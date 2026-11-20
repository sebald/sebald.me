// Layer 3 of the eval's judging (spec 3.5, Q14): an LLM answers each rubric
// statement of a run, one question per statement, from the one source its
// `from` names. `diff` gets the ticket and the diff of `src/`, `screenshot` the
// ticket and that one screenshot. The prompt is `evals/blip/judge.md`.
//
// The judge is a headless Claude Code on the logged-in subscription, started
// the way `run.mjs` starts an agent (the env allowlist, `--setting-sources
// project`, the user's global memory excluded, `apiKeySource` must be `none`),
// in an empty folder of its own, so nothing of the run's folder, its path or
// its configuration reaches it. Answers are cached next to the label's runs
// (`<label>/.judge/`), so collecting again costs nothing.

import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { childEnv, excludes, parseLine } from '../run-lib.mjs';
import { screenshotFile } from './screenshots.mjs';
import { collectorEnv } from './tree.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const EVAL = resolve(HERE, '..');
const REPO = resolve(EVAL, '../..');

export const PROMPT_FILE = join(EVAL, 'judge.md');
export const DEFAULT_MODEL = 'claude-opus-5-5';
/** What one question may cost at most (`--max-budget-usd`); a question is a few cents */
export const QUESTION_BUDGET_USD = 0.5;
const QUESTION_TIMEOUT_MS = 180_000;
/** A diff longer than this is cut, and says so */
export const MAX_DIFF_CHARS = 80_000;

const sha = text => createHash('sha256').update(text).digest('hex');

/** The prompt's sections by their `##` heading, the leading comment dropped */
export const loadPrompt = (path = PROMPT_FILE) => {
  const text = readFileSync(path, 'utf8');
  const sections = {};
  let name = null;
  for (const line of text.split('\n')) {
    const heading = /^## (.+)$/.exec(line);
    if (heading) {
      name = heading[1].trim();
      sections[name] = [];
    } else if (name) sections[name].push(line);
  }
  const out = Object.fromEntries(
    Object.entries(sections).map(([key, lines]) => [
      key,
      lines.join('\n').trim(),
    ]),
  );
  for (const need of [
    'System',
    'Question from the diff',
    'Question from a screenshot',
  ]) {
    if (!out[need]) throw new Error(`${path} has no "## ${need}" section`);
  }
  return { ...out, hash: sha(text).slice(0, 12) };
};

// What the judge must never see: the harness's folders and files, and the
// configuration's name (`no-cli`; the other names are ordinary words that code
// and comments use, so they are not touched). The label is added per run.
const BLIND = [
  /\.blip\b/g,
  /CLAUDE\.md/g,
  /claudeMdExcludes/g,
  /blip\.config/g,
  /\bno-cli\b/g,
];

const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The patterns that apply to one run: the fixed ones and its label */
export const blindPatterns = ({ label } = {}) => [
  ...BLIND,
  ...[label]
    .filter(Boolean)
    .map(name => new RegExp(`(?<![\\w-])${escapeRe(name)}(?![\\w-])`, 'g')),
];

/** `text` with anything blind patterns match replaced, and whether it was */
export const blind = (text, patterns) => {
  let redacted = false;
  let out = text;
  for (const pattern of patterns) {
    out = out.replace(pattern, () => {
      redacted = true;
      return '[removed]';
    });
  }
  return { text: out, redacted };
};

const git = (cwd, args, ok = [0]) => {
  try {
    return execFileSync('git', args, {
      cwd,
      env: collectorEnv(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    // `git diff --no-index` exits 1 when the files differ
    if (ok.includes(error.status)) return String(error.stdout ?? '');
    throw error;
  }
};

/**
 * The diff of `src/` since the run's first commit, committed or not, with the
 * files the agent added. Text only, no run state outside `src/`.
 */
export const srcDiff = cwd => {
  const root = git(cwd, ['rev-list', '--max-parents=0', 'HEAD'])
    .trim()
    .split('\n')
    .at(-1);
  const flags = [
    '-c',
    'core.quotePath=false',
    'diff',
    '--no-color',
    '--no-renames',
    '--src-prefix=a/',
    '--dst-prefix=b/',
  ];
  const parts = [git(cwd, [...flags, root, '--', 'src'])];
  const added = git(cwd, [
    '-c',
    'core.quotePath=false',
    'ls-files',
    '-o',
    '--exclude-standard',
    '--',
    'src',
  ])
    .split('\n')
    .filter(Boolean);
  for (const file of added) {
    parts.push(
      git(cwd, [...flags, '--no-index', '--', '/dev/null', file], [0, 1]),
    );
  }
  return parts.join('').trim();
};

const fill = (template, values) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');

/**
 * One question: the system prompt, the message, and for a screenshot the
 * file name it is shown under (`screenshot.png`, the same for every run)
 */
export const buildQuestion = ({ prompt, statement, ticket, diff }) => {
  if (statement.from !== 'diff' && statement.from !== 'screenshot')
    throw new Error(
      `Statement ${statement.id}: from must be "diff" or "screenshot", not ${JSON.stringify(statement.from)}`,
    );
  if (statement.from === 'screenshot' && !statement.screenshot)
    throw new Error(
      `Statement ${statement.id}: from screenshot needs a screenshot`,
    );
  for (const [what, text] of [
    ['ticket', ticket],
    ['text', statement.text],
    ['note', statement.note ?? ''],
  ])
    if (blind(text, blindPatterns()).redacted)
      throw new Error(
        `Statement ${statement.id}: the ${what} names something the judge must not see (.blip, CLAUDE.md, a configuration)`,
      );
  const note = statement.note ? `Note: ${statement.note}\n` : '';
  const values = {
    ticket: ticket.trim(),
    claim: statement.text,
    note,
  };
  if (statement.from === 'screenshot') {
    return {
      kind: 'screenshot',
      system: prompt.System,
      user: fill(prompt['Question from a screenshot'], {
        ...values,
        file: 'screenshot.png',
      }),
    };
  }
  return {
    kind: 'diff',
    system: prompt.System,
    user: fill(prompt['Question from the diff'], {
      ...values,
      diff: diff || '(the diff is empty: nothing in `src/` was changed)',
    }),
  };
};

/** The answer the judge must give: `{verdict: 'pass' | 'fail', evidence: string}` */
export const validateAnswer = text => {
  const body = String(text ?? '').trim();
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start < 0 || end < start) return { ok: false, why: 'no JSON object' };
  let value;
  try {
    value = JSON.parse(body.slice(start, end + 1));
  } catch {
    return { ok: false, why: 'not valid JSON' };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return { ok: false, why: 'not an object' };
  const keys = Object.keys(value).sort().join();
  if (keys !== 'evidence,verdict')
    return { ok: false, why: `keys are ${keys}, not evidence,verdict` };
  if (value.verdict !== 'pass' && value.verdict !== 'fail')
    return { ok: false, why: 'verdict is neither "pass" nor "fail"' };
  if (
    typeof value.evidence !== 'string' ||
    value.evidence.trim() === '' ||
    value.evidence.length > 1200
  )
    return { ok: false, why: 'evidence is empty or over 1200 characters' };
  return {
    ok: true,
    verdict: value.verdict,
    evidence: value.evidence.trim(),
  };
};

/** The command line of one question (a screenshot needs `Read`, a diff nothing) */
export const judgeArgs = ({ model, system, tools, budget }) => [
  '-p',
  '--output-format',
  'stream-json',
  '--verbose',
  '--setting-sources',
  'project',
  '--strict-mcp-config',
  '--disable-slash-commands',
  '--no-session-persistence',
  '--tools',
  tools,
  ...(tools ? ['--allowedTools', tools] : []),
  '--max-budget-usd',
  String(budget),
  '--model',
  model,
  '--system-prompt',
  system,
];

/**
 * Starts the judge once, in a fresh empty folder (with the screenshot as
 * `screenshot.png` when there is one). Resolves with the text of its answer,
 * the estimated cost and model, or `error`.
 */
export const ask = (
  question,
  {
    model = DEFAULT_MODEL,
    claude = process.env.BLIP_EVAL_CLAUDE ?? 'claude',
    budget = QUESTION_BUDGET_USD,
    timeoutMs = QUESTION_TIMEOUT_MS,
    screenshot = null,
    env = process.env,
  } = {},
) =>
  new Promise(resolveAsk => {
    const cwd = mkdtempSync(join(tmpdir(), 'judge-'));
    const home = homedir();
    mkdirSync(join(cwd, '.claude'));
    writeFileSync(
      join(cwd, '.claude', 'settings.json'),
      `${JSON.stringify(
        {
          permissions: { allow: ['Read'] },
          claudeMdExcludes: excludes(home),
        },
        null,
        2,
      )}\n`,
    );
    if (screenshot) copyFileSync(screenshot, join(cwd, 'screenshot.png'));
    const done = result => {
      rmSync(cwd, { recursive: true, force: true });
      resolveAsk(result);
    };
    const argv = judgeArgs({
      model,
      system: question.system,
      tools: question.kind === 'screenshot' ? 'Read' : '',
      budget,
    });
    let init = null;
    let result = null;
    let stderr = '';
    let buffer = '';
    let killed = false;
    const child = spawn(claude, argv, {
      cwd,
      env: childEnv(env, { repo: REPO, cwd }),
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
    }, timeoutMs);
    const feed = line => {
      const event = parseLine(line);
      if (!event) return;
      if (event.type === 'system' && event.subtype === 'init') {
        init = event;
        if (event.apiKeySource !== 'none') {
          killed = true;
          child.kill('SIGKILL');
        }
      } else if (event.type === 'result') result = event;
    };
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', d => (stderr += d));
    child.stdout.on('data', d => {
      buffer += d;
      let i;
      while ((i = buffer.indexOf('\n')) >= 0) {
        feed(buffer.slice(0, i));
        buffer = buffer.slice(i + 1);
      }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(question.user);
    child.on('error', error => {
      clearTimeout(timer);
      done({ error: `could not start claude: ${error.message}` });
    });
    child.on('close', () => {
      clearTimeout(timer);
      feed(buffer);
      if (init && init.apiKeySource !== 'none')
        return done({
          fatal: true,
          error: `apiKeySource is ${JSON.stringify(init.apiKeySource)}, not "none"`,
        });
      if (killed && !result) return done({ error: 'timed out' });
      if (!result)
        return done({
          error: `no result event${stderr ? `: ${stderr.slice(-200)}` : ''}`,
        });
      const models = Object.keys(result.modelUsage ?? {});
      done({
        text: result.is_error ? null : String(result.result ?? ''),
        error: result.is_error
          ? `error result: ${String(result.result ?? result.subtype).slice(0, 200)}`
          : null,
        costUsd: result.total_cost_usd ?? 0,
        model: models.length === 1 ? models[0] : (init?.model ?? model),
      });
    });
  });

/**
 * One statement of one run: ask, check the answer against the schema, ask once
 * more when it does not hold, and record a judge error when it still does not.
 * `askFn` is the part a test replaces.
 */
export const judgeStatement = async ({
  question,
  askFn = ask,
  askOptions = {},
}) => {
  let costUsd = 0;
  let model = askOptions.model ?? DEFAULT_MODEL;
  let problem = null;
  let attempts = 0;
  for (let attempt = 1; attempt <= 2; attempt++) {
    attempts = attempt;
    const reply = await askFn(question, askOptions);
    // The login is not the subscription's: every question would fail alike
    if (reply.fatal) throw new Error(`Judge aborted: ${reply.error}`);
    costUsd += reply.costUsd ?? 0;
    model = reply.model ?? model;
    if (reply.error) {
      problem = reply.error;
      // A process problem is not a bad answer: asking again won't help,
      // except for a timeout, which the second go may not hit
      if (reply.error !== 'timed out') break;
      continue;
    }
    const answer = validateAnswer(reply.text);
    if (answer.ok)
      return {
        verdict: answer.verdict,
        evidence: answer.evidence,
        model,
        costUsd,
        attempts: attempt,
      };
    problem = `invalid answer: ${answer.why} (${String(reply.text).slice(0, 160).replace(/\s+/g, ' ')})`;
  }
  return {
    verdict: 'error',
    evidence: problem,
    model,
    costUsd,
    attempts,
  };
};

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

const cachedAnswer = (path, key) => {
  try {
    const value = readJson(path);
    return value.key === key ? value.answer : null;
  } catch {
    return null;
  }
};

/**
 * All statements of one run. `run` is `{ id, config, task, dir }`, `label` the
 * label's name (kept out of the judge's input), `judgeDir` the label's
 * `.judge/` folder. A screenshot statement whose screenshot does not exist is
 * `skipped`, not failed. Returns the run's judge record.
 */
export const judgeRun = async ({
  run,
  label,
  rubric,
  ticket,
  prompt,
  judgeDir,
  labelDir,
  askFn = ask,
  askOptions = {},
  onAnswer = () => {},
  shouldStop = () => false,
}) => {
  const model = askOptions.model ?? DEFAULT_MODEL;
  const patterns = blindPatterns({ label });
  let diff = null;
  const diffOf = () => {
    if (diff === null) {
      const cut = srcDiff(run.dir);
      diff = blind(
        cut.length > MAX_DIFF_CHARS
          ? `${cut.slice(0, MAX_DIFF_CHARS)}\n(the diff is cut here: ${cut.length - MAX_DIFF_CHARS} more characters)`
          : cut,
        patterns,
      );
    }
    return diff;
  };
  const statements = [];
  for (const statement of rubric.statements) {
    if (shouldStop()) break;
    const key = `${rubric.task}/${statement.id}`;
    const base = {
      key,
      id: statement.id,
      unstated: Boolean(statement.unstated),
      from: statement.from,
      ...(statement.from === 'screenshot'
        ? { screenshot: statement.screenshot }
        : {}),
    };
    let screenshot = null;
    let input;
    if (statement.from === 'screenshot') {
      screenshot = screenshotFile(labelDir, run.id, statement.screenshot);
      if (!screenshot) {
        statements.push({
          ...base,
          verdict: 'skipped',
          evidence: `no screenshot ${statement.screenshot} for this run (the rendered pass has not written it)`,
        });
        continue;
      }
      input = sha(readFileSync(screenshot));
    } else {
      input = sha(diffOf().text);
    }
    const question = buildQuestion({
      prompt,
      statement,
      ticket,
      diff: statement.from === 'diff' ? diffOf().text : null,
    });
    const cacheKey = sha(
      JSON.stringify([
        prompt.hash,
        model,
        question.system,
        question.user,
        input,
      ]),
    );
    const cachePath = join(judgeDir, run.id, `${statement.id}.json`);
    let answer = cachedAnswer(cachePath, cacheKey);
    let cached = answer !== null;
    if (!answer) {
      answer = await judgeStatement({
        question: question,
        askFn,
        askOptions: { ...askOptions, model, screenshot },
      });
      if (answer.verdict !== 'error') {
        mkdirSync(dirname(cachePath), { recursive: true });
        writeFileSync(
          cachePath,
          `${JSON.stringify({ key: cacheKey, answer }, null, 2)}\n`,
        );
      }
    }
    const record = {
      ...base,
      ...answer,
      evidence: String(answer.evidence)
        .replaceAll(homedir(), '~')
        .replaceAll(tmpdir(), '<tmp>'),
      ...(statement.from === 'diff' && diffOf().redacted
        ? { redacted: true }
        : {}),
    };
    statements.push(record);
    onAnswer({ run, record, cached });
  }
  return summariseStatements(statements, model);
};

/** A run's record: the answers and what they add up to */
export const summariseStatements = (statements, model) => {
  const count = (unstated, verdict) =>
    statements.filter(s => s.unstated === unstated && s.verdict === verdict)
      .length;
  const costUsd = statements.reduce((sum, s) => sum + (s.costUsd ?? 0), 0);
  return {
    model: statements.find(s => s.model)?.model ?? model,
    costUsd: Number(costUsd.toFixed(4)),
    stated: {
      pass: count(false, 'pass'),
      fail: count(false, 'fail'),
      error: count(false, 'error'),
      skipped: count(false, 'skipped'),
    },
    unstated: {
      pass: count(true, 'pass'),
      fail: count(true, 'fail'),
      error: count(true, 'error'),
      skipped: count(true, 'skipped'),
    },
    statements,
  };
};

/**
 * Judges runs, `parallel` at a time, and returns `{ [run.id]: record }`.
 * `rubricOf(task)` gives `{ rubric, ticket }`. Stops asking when the estimate
 * of what was spent passes `maxCostUsd`.
 */
export const judgeRuns = async ({
  runs,
  label,
  rubricOf,
  judgeDir,
  labelDir,
  parallel = 2,
  maxCostUsd = Infinity,
  askFn = ask,
  askOptions = {},
  onAnswer = () => {},
  prompt = loadPrompt(),
}) => {
  const out = {};
  const queue = [...runs];
  let spent = 0;
  let stopped = false;
  const worker = async () => {
    for (let run = queue.shift(); run; run = queue.shift()) {
      if (stopped) return;
      const { rubric, ticket } = rubricOf(run.task);
      out[run.id] = await judgeRun({
        run,
        label,
        rubric,
        ticket,
        prompt,
        judgeDir,
        labelDir,
        askFn,
        askOptions,
        shouldStop: () => stopped,
        onAnswer: info => {
          if (!info.cached) spent += info.record.costUsd ?? 0;
          if (spent > maxCostUsd) stopped = true;
          onAnswer(info);
        },
      });
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, parallel) }, worker));
  if (stopped)
    throw new Error(
      `Judge stopped: the estimate passed $${maxCostUsd} (spent about $${spent.toFixed(2)}). Answers so far are cached; run again to continue.`,
    );
  return out;
};

export const judgeInfo = (judged, prompt = loadPrompt()) => {
  const records = Object.values(judged);
  const models = [...new Set(records.map(r => r.model))].sort();
  return {
    prompt: prompt.hash,
    models,
    costUsd: Number(records.reduce((sum, r) => sum + r.costUsd, 0).toFixed(4)),
  };
};

/** The task's rubric and ticket, from this repo */
export const rubricOfTask = (tasksDir, task) => ({
  rubric: readJson(join(tasksDir, task, 'rubric.json')),
  ticket: readFileSync(join(tasksDir, task, 'task.md'), 'utf8'),
});
