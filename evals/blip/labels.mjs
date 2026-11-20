#!/usr/bin/env node
// The judge's agreement with hand labels (eval-judge's first criterion).
//
//   node evals/blip/labels.mjs init  [--label day-zero]   pick the runs, write labels/<task>.json
//   node evals/blip/labels.mjs show  <task>               print what to read for one task's run
//   node evals/blip/labels.mjs judge [--label day-zero]   the judge answers the labelled runs,
//                                                          kept apart in labels/judge/<task>.json
//   node evals/blip/labels.mjs compare                    agreement, once the labels are filled in
//
// `judge` spends the Claude subscription (about 30 questions).

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { findRuns } from './collect.mjs';
import {
  DEFAULT_MODEL,
  judgeRuns,
  rubricOfTask,
  srcDiff,
} from './lib/judge.mjs';
import { compareLabels, labelTemplate, pickRun } from './lib/labels.mjs';
import { changedLines } from './lib/tree.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LABELS = join(HERE, 'labels');
const TASKS = join(HERE, 'tasks');
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const writeJson = (path, value) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};
const tilde = path => path.replace(homedir(), '~');

const readdirSyncJson = dir =>
  readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .sort()
    .map(name => readJson(join(dir, name)));

const labelFiles = () => (existsSync(LABELS) ? readdirSyncJson(LABELS) : []);

const main = async () => {
  const {
    positionals: [command, arg],
    values,
  } = parseArgs({
    allowPositionals: true,
    options: {
      label: { type: 'string', default: 'day-zero' },
      cache: { type: 'string' },
      model: { type: 'string' },
      force: { type: 'boolean' },
    },
  });
  const cache = values.cache ?? join(homedir(), '.cache', 'blip-eval');
  const labelDir = join(cache, values.label);

  if (command === 'init') {
    const { runs } = findRuns(labelDir);
    const tasks = [...new Set(runs.map(run => run.task))].sort();
    for (const task of tasks) {
      const path = join(LABELS, `${task}.json`);
      if (existsSync(path) && !values.force)
        throw new Error(`${path} exists; --force overwrites the labels`);
      const mine = runs.filter(run => run.task === task);
      const runId = pickRun(
        mine.map(run => ({ id: run.id, chars: srcDiff(run.dir).length })),
      );
      const run = mine.find(r => r.id === runId);
      const { rubric } = rubricOfTask(TASKS, task);
      const files = [...changedLines(run.dir).keys()].sort();
      writeJson(
        path,
        labelTemplate({
          rubric,
          label: values.label,
          run: runId,
          runDir: tilde(run.dir),
          files,
        }),
      );
      console.log(`${task}: ${runId}`);
    }
    return;
  }

  if (command === 'show') {
    const labels = readJson(join(LABELS, `${arg}.json`));
    const run = findRuns(join(cache, labels.label)).runs.find(
      r => r.id === labels.run,
    );
    console.log(
      `# ${labels.task}: ${labels.run}\n\nTicket: evals/blip/tasks/${labels.task}/task.md\nRun folder: ${tilde(run.dir)}\n`,
    );
    console.log(srcDiff(run.dir));
    return;
  }

  if (command === 'judge') {
    const files = labelFiles();
    if (!files.length) throw new Error('No labels: run `init` first');
    const { runs } = findRuns(labelDir);
    const picked = files.map(f => {
      const run = runs.find(r => r.id === f.run);
      if (!run) throw new Error(`${f.run} is not in ${labelDir}`);
      return run;
    });
    const model = values.model ?? DEFAULT_MODEL;
    const judged = await judgeRuns({
      runs: picked,
      label: values.label,
      rubricOf: task => rubricOfTask(TASKS, task),
      labelDir,
      judgeDir: join(labelDir, '.judge'),
      parallel: 2,
      maxCostUsd: 5,
      askOptions: { model },
      onAnswer: ({ run, record, cached }) =>
        console.error(
          `${run.id} ${record.key}: ${record.verdict}${cached ? ' (cached)' : ` ($${(record.costUsd ?? 0).toFixed(3)})`}`,
        ),
    });
    let cost = 0;
    for (const file of files) {
      const record = judged[file.run];
      cost += record.costUsd;
      writeJson(join(LABELS, 'judge', `${file.task}.json`), {
        task: file.task,
        run: file.run,
        model: record.model,
        statements: record.statements,
      });
    }
    console.log(
      `Judged ${files.length} runs, ${files.reduce((n, f) => n + f.statements.length, 0)} statements, about $${cost.toFixed(2)}`,
    );
    return;
  }

  if (command === 'compare') {
    const judgeDir = join(LABELS, 'judge');
    const result = compareLabels(
      labelFiles(),
      existsSync(judgeDir) ? readdirSyncJson(judgeDir) : [],
    );
    console.log(
      `${result.agreed} of ${result.compared} statements agree` +
        (result.share === null
          ? ''
          : ` (${Math.round(100 * result.share)}%, the criterion is 90% of all statements, all labelled and judged): ${result.meetsCriterion ? 'met' : 'NOT met'}`),
    );
    for (const d of result.disagreements)
      console.log(
        `\n${d.key} (${d.run}): you ${d.mine ? 'pass' : 'fail'}, judge ${d.judge ? 'pass' : 'fail'}\n  ${d.evidence}`,
      );
    if (result.unlabelled.length)
      console.log(`\nNot labelled yet: ${result.unlabelled.join(', ')}`);
    if (result.unjudged.length)
      console.log(`\nLabelled but not judged: ${result.unjudged.join(', ')}`);
    return;
  }

  console.error(
    'Usage: node evals/blip/labels.mjs init|show <task>|judge|compare [--label day-zero] [--cache <dir>] [--model <m>] [--force]',
  );
  process.exit(2);
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
