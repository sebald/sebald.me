#!/usr/bin/env node
// Layer 1 of the eval's judging (spec 3.5): reads each run directory of a label
// and writes `results/<date>-<label>/results.json` and `summary.md`, the only
// files it writes in this repo. Never reruns an agent, never touches a run's
// `.blip/`. See `evals/blip/README.md`.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { aggregate, candidates } from './lib/aggregate.mjs';
import {
  DEFAULT_MODEL,
  judgeInfo,
  judgeRuns,
  rubricOfTask,
} from './lib/judge.mjs';
import { writeSummary } from './lib/summary.mjs';
import { analyseTranscript } from './lib/transcript.mjs';
import { PACKAGE, analyseTree, checkBuild, collectorEnv } from './lib/tree.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, '../..');

export const SCHEMA = 1;

/** The collector's commit: the last one that changed it or its parts, `+dirty` with edits */
export const collectorVersion = () => {
  try {
    const paths = ['evals/blip/collect.mjs', 'evals/blip/lib'];
    const run = args =>
      execFileSync('git', args, {
        cwd: REPO,
        encoding: 'utf8',
        env: collectorEnv(),
      }).trim();
    const commit = run(['log', '-1', '--format=%H', '--', ...paths]);
    const dirty = run(['status', '--porcelain', '--', ...paths]) !== '';
    return commit
      ? `${commit.slice(0, 12)}${dirty ? '+dirty' : ''}`
      : 'uncommitted';
  } catch {
    return 'unknown';
  }
};

/** What eval-run keeps in a label's folder besides the configurations */
const isConfigDir = entry =>
  entry.isDirectory() &&
  entry.name !== 'tarball' &&
  !entry.name.startsWith('.');

/** Only these are results; the others are listed as skipped (eval-run's `meta.json`) */
const RESULTS = new Set(['done', 'timeout']);

/**
 * The run directories of a label (`<config>/<dir>` with a `meta.json`), sorted,
 * and the ones that are not results: no `meta.json` is unfinished, `failed`
 * and `stopped` could not be measured. Task and rep come from `meta.json`,
 * never from the folder's name
 */
export const findRuns = labelDir => {
  const runs = [];
  const skipped = [];
  for (const config of readdirSync(labelDir, { withFileTypes: true })) {
    if (!isConfigDir(config)) continue;
    for (const entry of readdirSync(join(labelDir, config.name), {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const id = `${config.name}/${entry.name}`;
      const dir = join(labelDir, config.name, entry.name);
      const metaPath = join(dir, 'meta.json');
      if (!existsSync(metaPath)) {
        skipped.push({ id, status: null, reason: 'no meta.json: unfinished' });
        continue;
      }
      let meta;
      try {
        meta = readJson(metaPath);
      } catch {
        skipped.push({ id, status: null, reason: 'meta.json unreadable' });
        continue;
      }
      if (!RESULTS.has(meta.status)) {
        const why = meta.failure ?? meta.stoppedBy ?? null;
        skipped.push({
          id,
          status: meta.status ?? null,
          reason: why ? `${meta.status}: ${why}` : String(meta.status),
        });
        continue;
      }
      runs.push({
        id,
        config: meta.config ?? config.name,
        task: meta.task,
        rep: meta.rep,
        dir,
        meta,
      });
    }
  }
  const order = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  runs.sort(
    (a, b) =>
      order(a.config, b.config) || order(a.task, b.task) || a.rep - b.rep,
  );
  skipped.sort((a, b) => order(a.id, b.id));
  return { runs, skipped };
};

/** In the run's folder, or beside it (the layout spec 3.3 leaves open) */
const transcriptPath = dir =>
  [join(dir, 'transcript.jsonl'), `${dir}.transcript.jsonl`].find(existsSync);

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

const filesUnder = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : 1,
  )) {
    const path = join(dir, entry.name);
    if (statSync(path).isDirectory()) filesUnder(path, out);
    else out.push(path);
  }
  return out;
};

/**
 * The CLI a run installed: the package's version (the same `0.0.0` for every
 * tarball today) and a hash of its `dist` and `docs`, which is what tells
 * two tarballs apart
 */
const cliVersionOf = (dir, meta) => {
  // eval-run records the tarball it packed once for the label
  if (meta?.tarball?.sha256) {
    return `${meta.tarball.version ?? '?'}+${meta.tarball.sha256.slice(0, 12)}`;
  }
  const pkg = join(dir, 'node_modules', PACKAGE);
  if (!existsSync(join(pkg, 'package.json'))) return null;
  const hash = createHash('sha256');
  for (const folder of ['dist', 'docs']) {
    for (const file of filesUnder(join(pkg, folder))) {
      hash.update(`${relative(pkg, file)}\0`);
      hash.update(readFileSync(file));
    }
  }
  return `${readJson(join(pkg, 'package.json')).version}+${hash.digest('hex').slice(0, 12)}`;
};

export const collect = ({
  label,
  cache = join(homedir(), '.cache', 'blip-eval'),
  tasksDir = join(HERE, 'tasks'),
  version = collectorVersion(),
  build = true,
  against = null,
  writeups = [],
  // `{ [run id]: rendered }` from `renderLabel`, the rendered layer (async, so done by the caller)
  rendered = null,
  judged = null,
}) => {
  if (!/^[\w.-]+$/.test(label) || label.startsWith('.')) {
    throw new Error(
      `Label "${label}" must be letters, digits, ".", "_" and "-"`,
    );
  }
  const labelDir = join(cache, label);
  if (!existsSync(labelDir))
    throw new Error(`No runs for "${label}" in ${cache}`);
  const { runs: found, skipped } = findRuns(labelDir);
  if (found.length === 0 && skipped.length === 0) {
    throw new Error(`No run directories in ${labelDir}`);
  }

  const scopes = {};
  const scopeOf = task => {
    if (!(task in scopes)) {
      const path = join(tasksDir, task, 'rubric.json');
      if (!existsSync(path))
        throw new Error(`No rubric for task "${task}" (${path})`);
      const scope = readJson(path).scope ?? 'all';
      if (scope !== 'all' && scope !== 'changed-lines') {
        throw new Error(
          `${path}: scope must be "all" or "changed-lines", not "${scope}"`,
        );
      }
      scopes[task] = scope;
    }
    return scopes[task];
  };

  const cliVersions = new Set();
  const runs = found.flatMap(({ id, config, task, rep, dir, meta }) => {
    const path = transcriptPath(dir);
    if (!path) {
      skipped.push({ id, status: meta.status, reason: 'no transcript.jsonl' });
      return [];
    }
    const transcript = analyseTranscript(readFileSync(path, 'utf8'));
    const scope = scopeOf(task);
    const tree = analyseTree(dir, scope);
    const checks = build
      ? checkBuild(dir)
      : {
          tsc: { ran: false, ok: null, errors: null },
          build: { ran: false, ok: null, errors: null },
        };
    const cli = cliVersionOf(dir, meta);
    if (cli) cliVersions.add(cli);
    return [
      {
        id,
        config,
        task,
        rep,
        scope,
        runStatus: meta.status,
        status: transcript.status,
        ...(judged?.[id] ? { judge: judged[id] } : {}),
        transcript,
        tree: { ...tree, ...checks },
        rendered: rendered?.[id] ?? { ran: false },
      },
    ];
  });
  skipped.sort((a, b) => (a.id < b.id ? -1 : 1));

  if (cliVersions.size > 1) {
    throw new Error(
      `The runs of "${label}" used ${cliVersions.size} CLI versions (${[...cliVersions].join(', ')}); one label is one tarball`,
    );
  }

  const stats = aggregate(runs);
  const results = {
    schema: SCHEMA,
    label,
    collector: { version },
    cli: { version: [...cliVersions][0] ?? null },
    layers: [
      'transcript',
      'tree',
      ...(rendered ? ['rendered'] : []),
      ...(judged ? ['judge'] : []),
    ],
    ...(judged ? { judge: judgeInfo(judged) } : {}),
    runs,
    skipped,
    aggregate: stats,
    candidates: candidates(runs),
  };

  let comparison = null;
  if (against) {
    const other = readJson(join(against, 'results.json'));
    if (other.schema !== SCHEMA) {
      throw new Error(
        `${against}: results of schema ${other.schema}, this collector writes ${SCHEMA}; collect it again`,
      );
    }
    const problems = [];
    if (other.collector.version !== results.collector.version) {
      problems.push(
        `the collector differs (${other.collector.version}, this one ${results.collector.version}).`,
      );
    }
    if (other.cli.version !== results.cli.version) {
      problems.push(
        `the CLI differs (${other.cli.version}, this one ${results.cli.version}).`,
      );
    }
    comparison = {
      label: other.label,
      aggregate: other.aggregate,
      refused: problems.length ? problems.join(' ') : null,
    };
  }

  return { results, summary: writeSummary({ results, comparison, writeups }) };
};

/**
 * The hand-written files in a results folder: every `*.md` but `summary.md`.
 * The collector writes only `results.json` and `summary.md`, so these survive
 * a new collect, and `summary.md` links to them
 */
export const writeupsIn = (outRoot, date, label) => {
  const dir = join(outRoot, `${date}-${label}`);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(name => name.endsWith('.md') && name !== 'summary.md')
    .sort();
};

export const write = ({ results, summary }, outRoot, date) => {
  const dir = join(outRoot, `${date}-${results.label}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'results.json'),
    `${JSON.stringify(results, null, 2)}\n`,
  );
  writeFileSync(join(dir, 'summary.md'), summary);
  return dir;
};

/** The rubric's URLs per task, for the rendered layer */
export const rubricUrls = (task, tasksDir = join(HERE, 'tasks')) => {
  const path = join(tasksDir, task, 'rubric.json');
  return existsSync(path) ? (readJson(path).urls ?? []) : [];
};

/** Opens each result in a browser (`lib/rendered.mjs`); the runs it can't find a rubric for are left to `collect` to refuse */
export const renderRuns = async ({
  label,
  cache,
  tasksDir = join(HERE, 'tasks'),
}) => {
  if (!/^[\w.-]+$/.test(label) || label.startsWith('.')) {
    throw new Error(
      `Label "${label}" must be letters, digits, ".", "_" and "-"`,
    );
  }
  const labelDir = join(cache, label);
  if (!existsSync(labelDir))
    throw new Error(`No runs for "${label}" in ${cache}`);
  // Loaded here: Playwright and the stage check are only needed by this layer
  const { renderLabel } = await import('./lib/rendered.mjs');
  const { runs } = findRuns(labelDir);
  // A task without a rubric is for `collect` to refuse, not for this
  const scopeOf = task => {
    const path = join(tasksDir, task, 'rubric.json');
    return existsSync(path) ? (readJson(path).scope ?? 'all') : 'all';
  };
  return renderLabel({
    labelDir,
    runs: runs.map(run => ({
      id: run.id,
      task: run.task,
      dir: run.dir,
      scope: scopeOf(run.task),
    })),
    urlsOf: task => rubricUrls(task, tasksDir),
    log: message => console.error(message),
  });
};

/**
 * The judge's answers for a label's runs (spec 3.5, layer 3), from the label's
 * `.judge/` cache and by asking for what is not in it. Spends the Claude
 * subscription, so only `--judge` does it.
 */
export const judgeLabel = async ({
  label,
  cache,
  tasksDir = join(HERE, 'tasks'),
  model = DEFAULT_MODEL,
  parallel = 2,
  maxCostUsd = 15,
  log = () => {},
  askFn,
}) => {
  const labelDir = join(cache, label);
  const { runs } = findRuns(labelDir);
  const rubrics = {};
  return judgeRuns({
    runs: runs.filter(run => transcriptPath(run.dir)),
    label,
    rubricOf: task => (rubrics[task] ??= rubricOfTask(tasksDir, task)),
    judgeDir: join(labelDir, '.judge'),
    labelDir,
    parallel,
    maxCostUsd,
    askOptions: { model },
    askFn,
    onAnswer: ({ run, record, cached }) =>
      log(
        `${run.id} ${record.key}: ${record.verdict}${cached ? ' (cached)' : ` ($${(record.costUsd ?? 0).toFixed(3)})`}`,
      ),
  });
};

const main = async () => {
  const { values } = parseArgs({
    options: {
      label: { type: 'string' },
      cache: { type: 'string' },
      out: { type: 'string' },
      date: { type: 'string' },
      against: { type: 'string' },
      'collector-version': { type: 'string' },
      'skip-build': { type: 'boolean' },
      'skip-render': { type: 'boolean' },
      judge: { type: 'boolean' },
      'judge-model': { type: 'string' },
      'judge-parallel': { type: 'string' },
      'judge-max-usd': { type: 'string' },
    },
  });
  if (!values.label) {
    console.error(
      'Usage: node evals/blip/collect.mjs --label <label> [--cache <dir>] [--out <dir>] [--date YYYY-MM-DD] [--against <results dir>] [--skip-build] [--skip-render] [--judge [--judge-model <m>] [--judge-parallel <n>] [--judge-max-usd <n>]]',
    );
    process.exit(2);
  }
  try {
    const date = values.date ?? new Date().toISOString().slice(0, 10);
    const outRoot = values.out ? resolve(values.out) : join(HERE, 'results');
    const cache = values.cache ?? join(homedir(), '.cache', 'blip-eval');
    const render = !values['skip-build'] && !values['skip-render'];
    // The rendered pass first: the judge reads its screenshots
    const rendered = render
      ? await renderRuns({ label: values.label, cache })
      : null;
    const judged = values.judge
      ? await judgeLabel({
          label: values.label,
          cache,
          model: values['judge-model'] ?? DEFAULT_MODEL,
          parallel: Number(values['judge-parallel'] ?? 2),
          maxCostUsd: Number(values['judge-max-usd'] ?? 15),
          log: line => console.error(line),
        })
      : null;
    const done = collect({
      label: values.label,
      writeups: writeupsIn(outRoot, date, values.label),
      cache,
      rendered,
      version: values['collector-version'] ?? collectorVersion(),
      build: !values['skip-build'],
      against: values.against ? resolve(values.against) : null,
      judged,
    });
    const dir = write(done, outRoot, date);
    console.log(
      `Wrote ${join(dir, 'results.json')} and summary.md (${done.results.runs.length} runs)`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await main();
