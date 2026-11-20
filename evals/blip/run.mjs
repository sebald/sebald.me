#!/usr/bin/env node
// Runs tasks of the Blip UI eval in isolated copies of the template with
// headless Claude Code (docs/blip-harness/spec.md, 3.3). The layout it leaves
// is in evals/blip/README.md ("A run's directory").
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createWriteStream,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  appendFileSync,
  cpSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import {
  canaryPrompt,
  probeLine,
  CONFIGS,
  canaryArgs,
  checkInit,
  childEnv,
  claudeArgs,
  claudeMd,
  isDone,
  isUsageLimit,
  parseLine,
  parseList,
  runName,
  settingsJson,
  summariseInit,
  summariseResult,
} from './run-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = realpathSync(resolve(HERE, '../..'));
const TEMPLATE = join(HERE, 'template');
const cacheWanted = resolve(
  process.env.BLIP_EVAL_CACHE ?? join(homedir(), '.cache', 'blip-eval'),
);
const CACHE = existsSync(cacheWanted) ? realpathSync(cacheWanted) : cacheWanted;
// A test hook: another executable standing in for `claude`
const CLAUDE = process.env.BLIP_EVAL_CLAUDE ?? 'claude';
const CANARY_MODEL = 'haiku';
const GIT_ENV = {
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_AUTHOR_NAME: 'blip-eval',
  GIT_AUTHOR_EMAIL: 'blip-eval@example.invalid',
  GIT_COMMITTER_NAME: 'blip-eval',
  GIT_COMMITTER_EMAIL: 'blip-eval@example.invalid',
};

const USAGE = `Usage: node evals/blip/run.mjs --label <l> --config <c> [options]

  --label <l>        Names the label's folder under ${CACHE}
  --config <c>       ${Object.keys(CONFIGS).join(' | ')}
  --tasks a,b        Default: every folder in evals/blip/tasks
  --reps <n>         Repetitions per task (default 1)
  --model <m>        Default claude-sonnet-5-5
  --budget <usd>     --max-budget-usd per run (default 4)
  --timeout <min>    Wall-clock limit per run (default 30)
  --tarball <file>   Use this packed Blip UI instead of packing the workspace
  --parallel <n>     Runs at the same time (default 1)
  --retry-failed     Also redo runs marked failed
  --dry              Print what would run, spend nothing`;

const fail = (message, code = 2) => {
  console.error(message);
  process.exit(code);
};

const { values: opts } = (() => {
  try {
    return parseArgs({
      options: {
        label: { type: 'string' },
        config: { type: 'string' },
        tasks: { type: 'string' },
        reps: { type: 'string', default: '1' },
        model: { type: 'string', default: 'claude-sonnet-5-5' },
        budget: { type: 'string', default: '4' },
        timeout: { type: 'string', default: '30' },
        tarball: { type: 'string' },
        parallel: { type: 'string', default: '1' },
        'retry-failed': { type: 'boolean', default: false },
        dry: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
      },
    });
  } catch (error) {
    return fail(`${error.message}\n\n${USAGE}`);
  }
})();

if (opts.help) {
  console.log(USAGE);
  process.exit(0);
}
if (!opts.label || !/^[\w.-]+$/.test(opts.label) || opts.label.startsWith('.'))
  fail(
    `--label is required (letters, digits, "_", "-", "."; no leading dot)\n\n${USAGE}`,
  );
if (!opts.config || !Object.hasOwn(CONFIGS, opts.config))
  fail(
    `--config is required, one of ${Object.keys(CONFIGS).join(', ')}\n\n${USAGE}`,
  );
if (!CONFIGS[opts.config].built)
  fail(`Configuration "${opts.config}" is not built yet.`);
for (const key of ['reps', 'budget', 'timeout', 'parallel']) {
  const n = Number(opts[key]);
  if (
    !(n > 0 && Number.isFinite(n)) ||
    (key !== 'budget' && key !== 'timeout' && !Number.isInteger(n))
  )
    fail(`--${key} must be a positive number, got "${opts[key]}"`);
}
if (CACHE === REPO || CACHE.startsWith(REPO + sep))
  fail(`The cache (${CACHE}) must be outside this repo`);

const allTasks = readdirSync(join(HERE, 'tasks'), { withFileTypes: true })
  .filter(
    e => e.isDirectory() && existsSync(join(HERE, 'tasks', e.name, 'task.md')),
  )
  .map(e => e.name)
  .sort();
const tasks = [...new Set(parseList(opts.tasks, allTasks))];
if (!tasks.length) fail('--tasks lists no task');
for (const t of tasks)
  if (!allTasks.includes(t))
    fail(`No task "${t}". Tasks: ${allTasks.join(', ')}`);

const reps = Number(opts.reps);
const budget = Number(opts.budget);
const timeoutMs = Number(opts.timeout) * 60_000;
const parallel = Number(opts.parallel);
const config = opts.config;
const labelDir = join(CACHE, opts.label);
const configDir = join(labelDir, config);
const baseDir = join(labelDir, '.base');
const tmpDir = join(labelDir, '.tmp');
const canaryDir = join(labelDir, '.canary');
const labelFile = join(labelDir, 'label.json');

const readJson = file => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
};
const quote = s =>
  /^[\w@%+=:,./-]+$/.test(s) ? s : `'${s.replaceAll("'", `'\\''`)}'`;
const show = (cmd, args) => [cmd, ...args].map(quote).join(' ');
const run = (cmd, args, options = {}) =>
  execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
const sha256 = file =>
  createHash('sha256').update(readFileSync(file)).digest('hex');

const claudeVersion = (() => {
  try {
    return run(CLAUDE, ['--version']).trim();
  } catch {
    return fail(`Could not run \`${CLAUDE} --version\``);
  }
})();

// What is in the cache already
const runs = tasks.flatMap(task =>
  Array.from({ length: reps }, (_, i) => {
    const rep = i + 1;
    const dir = join(configDir, runName(task, rep));
    const meta = readJson(join(dir, 'meta.json'));
    const state = existsSync(dir)
      ? isDone(meta, { retryFailed: opts['retry-failed'] })
        ? 'skip'
        : meta?.stoppedBy === 'usage-limit'
          ? 'redo (usage limit)'
          : meta
            ? 'redo (failed)'
            : 'redo (unfinished)'
      : 'new';
    return { task, rep, dir, state };
  }),
);
const pending = runs.filter(r => r.state !== 'skip');
const label = readJson(labelFile);

const args = () => claudeArgs({ model: opts.model, budget, plugins: [] });

if (opts.dry) {
  console.log(
    `label ${opts.label}, config ${config}, model ${opts.model}, budget $${budget}, limit ${opts.timeout} min, parallel ${parallel}`,
  );
  console.log(`cache ${labelDir}`);
  console.log(`claude ${claudeVersion}`);
  if (opts.tarball) {
    const given = resolve(opts.tarball);
    if (!existsSync(given)) fail(`No such tarball: ${given}`);
    if (label && label.tarball.sha256 !== sha256(given))
      fail(
        `Label "${opts.label}" was built from another tarball. A comparison uses one tarball: pick a new label.`,
      );
    console.log(`tarball ${given}`);
  } else if (label)
    console.log(`tarball ${label.tarball.file} (recorded for this label)`);
  else
    console.log(
      `pack: ${show('pnpm', ['--filter', '@sebald/blip-ui', 'pack', '--pack-destination', join(labelDir, 'tarball')])}`,
    );
  console.log(`base: ${show('pnpm', ['install'])} in ${baseDir}`);
  if (pending.length)
    console.log(
      `canary: ${show(CLAUDE, canaryArgs({ model: CANARY_MODEL }))} in ${canaryDir} < (a question about the first heading of ~/.claude/CLAUDE.md)`,
    );
  for (const r of runs) {
    if (r.state === 'skip') {
      console.log(`\n${r.dir}\n  skip: already done`);
      continue;
    }
    console.log(
      `\n${r.dir}${r.state === 'new' ? '' : `  [${r.state}]`}\n  install: ${show('pnpm', ['install', '--offline', '--frozen-lockfile'])}\n  ${show(CLAUDE, args(r))} < evals/blip/tasks/${r.task}/task.md`,
    );
  }
  console.log(
    `\n${runs.length} run(s), ${pending.length} to do. Nothing was run.`,
  );
  process.exit(0);
}

// ---- Packing and the label's install ----------------------------------

mkdirSync(labelDir, { recursive: true });

const ensureTarball = () => {
  if (opts.tarball) {
    const given = resolve(opts.tarball);
    if (!existsSync(given)) fail(`No such tarball: ${given}`);
    const hash = sha256(given);
    if (label && label.tarball.sha256 !== hash)
      fail(
        `Label "${opts.label}" was built from another tarball (${label.tarball.sha256.slice(0, 12)}, this one is ${hash.slice(0, 12)}). A comparison uses one tarball: pick a new label.`,
      );
    return label ?? { given, hash };
  }
  if (label) return label;
  return null;
};

const packageJsonOf = tgz =>
  JSON.parse(run('tar', ['-xOf', tgz, 'package/package.json']));

const makeLabel = () => {
  try {
    return makeLabelUnsafe();
  } catch (error) {
    return fail(
      `Could not prepare the label: ${String(error.stderr || error.message).slice(0, 500)}`,
    );
  }
};

const makeLabelUnsafe = () => {
  const found = ensureTarball();
  if (found?.label) return found;
  let file;
  if (found?.given) {
    file = join(labelDir, 'tarball', basename(found.given));
    mkdirSync(dirname(file), { recursive: true });
    cpSync(found.given, file);
  } else {
    const dest = join(labelDir, 'tarball');
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    console.log('Packing @sebald/blip-ui ...');
    run(
      'pnpm',
      ['--filter', '@sebald/blip-ui', 'pack', '--pack-destination', dest],
      {
        cwd: REPO,
        env: { ...process.env },
      },
    );
    const packed = readdirSync(dest).filter(f => f.endsWith('.tgz'));
    if (packed.length !== 1)
      fail(`Expected one tarball in ${dest}, found ${packed.length}`);
    file = join(dest, packed[0]);
  }
  const git = (...a) => {
    try {
      return run('git', a, { cwd: REPO }).trim();
    } catch {
      return null;
    }
  };
  const record = {
    label: opts.label,
    createdAt: new Date().toISOString(),
    claudeVersion,
    tarball: {
      file,
      sha256: sha256(file),
      version: packageJsonOf(file).version,
      commit: found?.given ? null : git('rev-parse', 'HEAD'),
      dirty: found?.given
        ? null
        : Boolean(git('status', '--porcelain', 'packages/blip-ui')),
    },
    baseline: null,
  };
  writeFileSync(labelFile, JSON.stringify(record, null, 2) + '\n');
  return record;
};

const COPY_SKIP = new Set(['node_modules', 'dist', '.git', '.tmp']);
const copyTree = (from, to) =>
  cpSync(from, to, {
    recursive: true,
    filter: src =>
      !COPY_SKIP.has(relative(from, src).split(sep)[0]) &&
      !src.endsWith('.tsbuildinfo'),
  });

const ensureBase = record => {
  const ready = join(baseDir, 'node_modules', '.modules.yaml');
  if (existsSync(ready) && existsSync(join(baseDir, 'pnpm-lock.yaml'))) return;
  rmSync(baseDir, { recursive: true, force: true });
  copyTree(TEMPLATE, baseDir);
  rmSync(join(baseDir, 'pnpm-lock.yaml'), { force: true });
  cpSync(record.tarball.file, join(baseDir, 'blip-ui.tgz'));
  console.log("Installing the label's base (online) ...");
  const env = childEnv(process.env, { repo: REPO, cwd: baseDir });
  run('pnpm', ['install'], { cwd: baseDir, env });
  // Every agent starts here, so it must be clean outside this repo too (in the
  // repo, the template borrows types from the root's node_modules)
  console.log("Checking the label's base (typecheck, build) ...");
  try {
    run('pnpm', ['typecheck'], { cwd: baseDir, env });
    run('pnpm', ['build'], { cwd: baseDir, env });
  } catch (error) {
    // Not left looking installed, so the next call checks again
    rmSync(baseDir, { recursive: true, force: true });
    throw error;
  }
  rmSync(join(baseDir, 'dist'), { recursive: true, force: true });
};

// ---- The canary (Q7) ---------------------------------------------------

const userNames = () => {
  const claude = join(homedir(), '.claude');
  const list = (dir, strip) => {
    try {
      return readdirSync(join(claude, dir)).map(n =>
        strip ? n.replace(/\.md$/, '') : n,
      );
    } catch {
      return [];
    }
  };
  const installed = readJson(join(claude, 'plugins', 'installed_plugins.json'));
  return {
    plugins: Object.keys(installed?.plugins ?? {}).map(k => k.split('@')[0]),
    skills: list('skills'),
    agents: list('agents', true),
  };
};

// Starts claude, hands stdin over, feeds each stdout line to `onEvent`.
// `onEvent` may return 'kill'. Resolves with how it ended.
const live = new Set();
const killAll = () => {
  for (const kill of live) kill('SIGKILL');
};
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP'])
  process.on(sig, () => {
    killAll();
    process.exit(130);
  });
process.on('exit', killAll);
process.on('uncaughtException', error => {
  killAll();
  console.error(error);
  process.exit(1);
});

const spawnClaude = ({ argv, cwd, prompt, onLine, onEvent, limitMs }) =>
  new Promise(resolveRun => {
    const child = spawn(CLAUDE, argv, {
      cwd,
      env: childEnv(process.env, { repo: REPO, cwd }),
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true,
    });
    let timedOut = false;
    let killedFor = null;
    let stderr = '';
    let buffer = '';
    const killGroup = signal => {
      try {
        process.kill(-child.pid, signal);
      } catch {
        /* already gone */
      }
    };
    live.add(killGroup);
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const stop = reason => {
      if (killedFor || timedOut) return;
      killedFor = reason;
      killGroup('SIGTERM');
      later(() => killGroup('SIGKILL'), 10_000);
    };
    if (limitMs)
      later(() => {
        timedOut = true;
        killGroup('SIGTERM');
        later(() => killGroup('SIGKILL'), 10_000);
      }, limitMs);
    const done = () => {
      timers.forEach(clearTimeout);
      live.delete(killGroup);
    };
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.on('error', error => {
      done();
      resolveRun({
        error,
        code: null,
        signal: null,
        timedOut,
        killedFor,
        stderr,
      });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(prompt);
    child.stderr.on('data', d => (stderr += d));
    const feed = line => {
      if (!line) return;
      onLine?.(line);
      const event = parseLine(line);
      if (event && onEvent(event) === 'kill') stop('init-check');
    };
    child.stdout.on('data', d => {
      buffer += d;
      let i;
      while ((i = buffer.indexOf('\n')) >= 0) {
        feed(buffer.slice(0, i));
        buffer = buffer.slice(i + 1);
      }
    });
    child.on('close', (code, signal) => {
      feed(buffer);
      // Anything the group left behind (a server the agent started)
      killGroup('SIGKILL');
      done();
      resolveRun({ code, signal, timedOut, killedFor, stderr });
    });
  });

const canary = async record => {
  rmSync(canaryDir, { recursive: true, force: true });
  mkdirSync(join(canaryDir, '.claude'), { recursive: true });
  writeFileSync(
    join(canaryDir, '.claude', 'settings.json'),
    settingsJson({ home: homedir(), permissions: false }),
  );
  let init = null;
  let result = null;
  let line = null;
  try {
    line = probeLine(
      readFileSync(join(homedir(), '.claude', 'CLAUDE.md'), 'utf8'),
    );
  } catch {
    /* no global memory file: nothing can leak */
  }
  if (!line)
    console.log(
      'No ~/.claude/CLAUDE.md to probe for; the canary only reads init.',
    );
  const ended = await spawnClaude({
    argv: canaryArgs({ model: CANARY_MODEL }),
    cwd: canaryDir,
    prompt: line ? canaryPrompt(line) : 'Answer with exactly LEAK:no.',
    limitMs: 5 * 60_000,
    onEvent: e => {
      if (e.type === 'system' && e.subtype === 'init') init = summariseInit(e);
      if (e.type === 'result') result = e;
    },
  });
  if (!init || !result)
    fail(
      `The canary did not finish (exit ${ended.code}). ${ended.stderr.trim().slice(0, 300)}`,
      3,
    );
  if (isUsageLimit(result))
    fail('The canary hit the usage limit. Try again after the reset.', 3);
  const answer = String(result.result ?? '');
  if (/LEAK:\s*yes/i.test(answer))
    fail(
      `Canary failed: the global ~/.claude/CLAUDE.md is visible to the agent (answer: ${answer.slice(0, 100)}). Nothing was run.`,
      3,
    );
  if (!/LEAK:\s*no/i.test(answer))
    fail(
      `Canary inconclusive (answer: ${answer.slice(0, 100)}). Nothing was run.`,
      3,
    );
  if (init.apiKeySource !== 'none')
    fail(
      `Canary failed: apiKeySource is ${JSON.stringify(init.apiKeySource)}, not "none".`,
      3,
    );
  const baseline = {
    plugins: init.plugins,
    skills: init.skills,
    agents: init.agents,
  };
  // Whatever the canary loaded must not come from ~/.claude
  const tainted = checkInit(init, {
    config,
    user: userNames(),
  }).filter(p => /~\/\.claude|MCP|apiKeySource/.test(p));
  if (tainted.length)
    fail(`Canary failed: ${tainted.join('; ')}. Nothing was run.`, 3);
  // Built-in plugins, skills and agents may differ between runs and invocations
  // (the check lets them through), so only another Claude Code (major or minor version) stops a label
  const minor = v => /\d+\.\d+/.exec(v ?? '')?.[0];
  if (
    record.claudeVersion &&
    minor(record.claudeVersion) !== minor(claudeVersion)
  )
    fail(
      `Claude Code is ${claudeVersion} now, label "${opts.label}" began on ${record.claudeVersion} (another major or minor version). Use a new label.`,
      3,
    );
  record.baseline = baseline;
  record.canary = {
    at: new Date().toISOString(),
    claudeVersion,
    answer: answer.slice(0, 100),
  };
  writeFileSync(labelFile, JSON.stringify(record, null, 2) + '\n');
  console.log(
    `Canary ok: no global memory visible, apiKeySource none (${init.skills.length} skills, ${init.agents.length} agents, ${init.plugins.length} plugins built in).`,
  );
};

// ---- One run -----------------------------------------------------------

const repoLinks = dir => {
  const found = [];
  const inRepo = p => p === REPO || p.startsWith(REPO + sep);
  const walk = d => {
    for (const name of readdirSync(d)) {
      if (name === '.git') continue;
      const p = join(d, name);
      const st = lstatSync(p);
      if (st.isSymbolicLink()) {
        try {
          if (inRepo(realpathSync(p))) found.push(p);
        } catch {
          /* dangling */
        }
      } else if (st.isDirectory()) walk(p);
    }
  };
  walk(dir);
  for (const file of ['package.json', 'pnpm-lock.yaml'])
    if (readFileSync(join(dir, file), 'utf8').includes(REPO))
      found.push(join(dir, file));
  return found;
};

const prepare = r => {
  rmSync(r.dir, { recursive: true, force: true });
  mkdirSync(dirname(r.dir), { recursive: true });
  copyTree(baseDir, r.dir);
  cpSync(join(baseDir, 'blip-ui.tgz'), join(r.dir, 'blip-ui.tgz'));
  writeFileSync(join(r.dir, 'CLAUDE.md'), claudeMd(config));
  mkdirSync(join(r.dir, '.claude'), { recursive: true });
  writeFileSync(
    join(r.dir, '.claude', 'settings.json'),
    settingsJson({ home: homedir() }),
  );
  writeFileSync(
    join(r.dir, '.gitignore'),
    'node_modules/\ndist/\n*.tgz\n*.tsbuildinfo\n',
  );
  const started = Date.now();
  run('pnpm', ['install', '--offline', '--frozen-lockfile'], {
    cwd: r.dir,
    env: childEnv(process.env, { repo: REPO, cwd: r.dir }),
  });
  const installMs = Date.now() - started;
  if (!CONFIGS[config].cli)
    rmSync(join(r.dir, 'node_modules', '.bin', 'blip'), { force: true });
  const links = repoLinks(r.dir);
  if (links.length)
    throw new Error(
      `Paths in the run directory reach into this repo: ${links.join(', ')}`,
    );
  const git = (...a) =>
    run('git', a, { cwd: r.dir, env: { ...process.env, ...GIT_ENV } });
  git('init', '-q', '-b', 'main');
  // The run's own records sit in the folder but are not part of the tree
  appendFileSync(
    join(r.dir, '.git', 'info', 'exclude'),
    'transcript.jsonl\nmeta.json\nstderr.log\n',
  );
  git('add', '-A');
  git('commit', '-q', '-m', 'template');
  return { installMs, commit: git('rev-parse', 'HEAD').trim() };
};

const execute = async (r, record, state) => {
  const startedAt = new Date();
  const meta = {
    label: opts.label,
    config,
    task: r.task,
    rep: r.rep,
    model: opts.model,
    budgetUsd: budget,
    timeoutMin: Number(opts.timeout),
    tarball: {
      sha256: record.tarball.sha256,
      version: record.tarball.version,
      commit: record.tarball.commit,
    },
    claudeVersion,
    startedAt: startedAt.toISOString(),
    endedAt: null,
    durationMs: null,
    exitCode: null,
    signal: null,
    status: 'failed',
    failure: null,
    timedOut: false,
    stoppedBy: null,
    overBudget: false,
    init: null,
    initProblems: [],
    result: null,
    installMs: null,
    baseCommit: null,
    redoOf: r.state === 'new' ? null : r.state,
  };
  const finish = extra => {
    Object.assign(meta, extra);
    meta.endedAt = new Date().toISOString();
    meta.durationMs = Date.now() - startedAt.getTime();
    mkdirSync(r.dir, { recursive: true });
    const moved = join(r.dir, 'transcript.jsonl');
    if (existsSync(transcript)) renameSync(transcript, moved);
    if (meta.stderr) writeFileSync(join(r.dir, 'stderr.log'), meta.stderr);
    delete meta.stderr;
    writeFileSync(
      join(r.dir, 'meta.json'),
      JSON.stringify(meta, null, 2) + '\n',
    );
    return meta;
  };
  mkdirSync(tmpDir, { recursive: true });
  const transcript = join(tmpDir, `${config}-${runName(r.task, r.rep)}.jsonl`);

  try {
    Object.assign(
      meta,
      (({ installMs, commit }) => ({ installMs, baseCommit: commit }))(
        prepare(r),
      ),
    );
  } catch (error) {
    return finish({
      failure: `setup: ${String(error.stderr || error.message).slice(0, 400)}`,
    });
  }

  const out = createWriteStream(transcript);
  let init = null;
  let result = null;
  let limited = false;
  const ended = await spawnClaude({
    argv: args(r),
    cwd: r.dir,
    prompt: readFileSync(join(HERE, 'tasks', r.task, 'task.md'), 'utf8'),
    limitMs: timeoutMs,
    onLine: line => out.write(line + '\n'),
    onEvent: e => {
      if (e.type === 'system' && e.subtype === 'init' && !init) {
        init = summariseInit(e);
        meta.init = init;
        meta.initProblems = checkInit(init, {
          config,
          user: state.user,
        });
        if (meta.initProblems.length) return 'kill';
      }
      if (isUsageLimit(e)) limited = true;
      if (e.type === 'result') result = e;
    },
  });
  await new Promise(res => out.end(res));

  const base = {
    exitCode: ended.code,
    signal: ended.signal,
    timedOut: ended.timedOut,
    result: summariseResult(result),
    stderr: ended.stderr.trim().slice(-2000),
  };
  if (ended.error)
    return finish({
      ...base,
      failure: `could not start claude: ${ended.error.message}`,
    });
  if (meta.initProblems.length)
    return finish({
      ...base,
      failure: `init check: ${meta.initProblems.join('; ')}`,
    });
  if (limited || isUsageLimit(result))
    return finish({ ...base, status: 'stopped', stoppedBy: 'usage-limit' });
  if (!init) return finish({ ...base, failure: 'no init event' });
  if (ended.timedOut) return finish({ ...base, status: 'timeout' });
  if (!result) return finish({ ...base, failure: 'no result event' });
  if (
    result.is_error &&
    !['error_max_budget_usd', 'error_max_turns'].includes(result.subtype)
  )
    return finish({
      ...base,
      failure: `error result: ${base.result.text ?? result.subtype}`,
    });
  return finish({
    ...base,
    status: 'done',
    overBudget: result.subtype === 'error_max_budget_usd',
  });
};

// ---- Go ------------------------------------------------------------------

const record = makeLabel();
try {
  ensureBase(record);
} catch (error) {
  fail(
    `Could not install the label: ${String(error.stdout || error.stderr || error.message).slice(0, 500)}`,
  );
}
if (!pending.length) {
  console.log(
    'Every run of this label and configuration is already done. Nothing to do.',
  );
  process.exit(0);
}
await canary(record);

const state = { user: userNames() };
let stopped = false;
let next = 0;
const outcomes = [];
const worker = async () => {
  while (!stopped && next < pending.length) {
    const r = pending[next++];
    console.log(
      `start  ${config}/${runName(r.task, r.rep)}${r.state === 'new' ? '' : `  (${r.state})`}`,
    );
    const meta = await execute(r, record, state);
    outcomes.push({ r, meta });
    console.log(
      `${meta.status.padEnd(6)} ${config}/${runName(r.task, r.rep)}  ${(meta.durationMs / 1000).toFixed(0)} s` +
        (meta.result?.costUsd != null
          ? `, est. $${meta.result.costUsd.toFixed(2)}`
          : '') +
        (meta.failure ? `  ${meta.failure}` : '') +
        (meta.timedOut ? '  over the wall-clock limit' : ''),
    );
    if (meta.stoppedBy === 'usage-limit') {
      stopped = true;
      console.error(
        `\nThe subscription's usage limit was reached. The label is stopped: run the same command again after the reset; this run is redone from a fresh copy and finished runs are skipped.`,
      );
    }
  }
};
await Promise.all(Array.from({ length: parallel }, worker));

const count = s => outcomes.filter(o => o.meta.status === s).length;
console.log(
  `\n${outcomes.length} run(s): ${count('done')} done, ${count('timeout')} timeout, ${count('failed')} failed, ${count('stopped')} stopped. Runs are in ${configDir}`,
);
process.exit(stopped ? 3 : count('failed') ? 1 : 0);
