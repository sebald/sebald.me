#!/usr/bin/env node
// Layer 1 of the eval's judging (spec 3.5): reads each run directory of a label
// and writes `results/<date>-<label>/results.json` and `summary.md`, the only
// files it writes in this repo. Never reruns an agent, never touches a run's
// `.blip/`. See `evals/blip/README.md`.

import { execFileSync } from 'node:child_process';
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

import { aggregate, candidates } from './lib/aggregate.mjs';
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

/** `<config>/<task>-<n>` directories of a label, sorted */
const findRuns = labelDir => {
  const runs = [];
  for (const config of readdirSync(labelDir, { withFileTypes: true })) {
    if (!config.isDirectory()) continue;
    for (const entry of readdirSync(join(labelDir, config.name), {
      withFileTypes: true,
    })) {
      const match = entry.isDirectory() && /^(.+)-(\d+)$/.exec(entry.name);
      if (!match) continue;
      runs.push({
        id: `${config.name}/${entry.name}`,
        config: config.name,
        task: match[1],
        rep: Number(match[2]),
        dir: join(labelDir, config.name, entry.name),
      });
    }
  }
  return runs.sort((a, b) =>
    a.config !== b.config
      ? a.config < b.config
        ? -1
        : 1
      : a.task !== b.task
        ? a.task < b.task
          ? -1
          : 1
        : a.rep - b.rep,
  );
};

/** In the run's folder, or beside it (the layout spec 3.3 leaves open) */
const transcriptPath = dir =>
  [join(dir, 'transcript.jsonl'), `${dir}.transcript.jsonl`].find(existsSync);

const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

const cliVersionOf = dir => {
  const path = join(dir, 'node_modules', PACKAGE, 'package.json');
  return existsSync(path) ? readJson(path).version : null;
};

export const collect = ({
  label,
  cache = join(homedir(), '.cache', 'blip-eval'),
  tasksDir = join(HERE, 'tasks'),
  version = collectorVersion(),
  build = true,
  against = null,
}) => {
  const labelDir = join(cache, label);
  if (!existsSync(labelDir))
    throw new Error(`No runs for "${label}" in ${cache}`);
  const found = findRuns(labelDir);
  if (found.length === 0) throw new Error(`No run directories in ${labelDir}`);

  const scopes = {};
  const scopeOf = task => {
    if (!(task in scopes)) {
      const path = join(tasksDir, task, 'rubric.json');
      if (!existsSync(path))
        throw new Error(`No rubric for task "${task}" (${path})`);
      scopes[task] = readJson(path).scope ?? 'all';
    }
    return scopes[task];
  };

  const cliVersions = new Set();
  const runs = found.map(({ id, config, task, rep, dir }) => {
    const path = transcriptPath(dir);
    if (!path) throw new Error(`${id}: no transcript.jsonl`);
    const transcript = analyseTranscript(readFileSync(path, 'utf8'));
    const scope = scopeOf(task);
    const tree = analyseTree(dir, scope);
    const checks = build
      ? checkBuild(dir)
      : {
          tsc: { ran: false, ok: null, errors: null },
          build: { ran: false, ok: null, errors: null },
        };
    const cli = cliVersionOf(dir);
    if (cli) cliVersions.add(cli);
    return {
      id,
      config,
      task,
      rep,
      scope,
      status: transcript.status,
      transcript,
      tree: { ...tree, ...checks },
    };
  });

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
    layers: ['transcript', 'tree'],
    runs,
    aggregate: stats,
    candidates: candidates(runs),
  };

  let comparison = null;
  if (against) {
    const other = readJson(join(against, 'results.json'));
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

  return { results, summary: writeSummary({ results, comparison }) };
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

const main = () => {
  const { values } = parseArgs({
    options: {
      label: { type: 'string' },
      cache: { type: 'string' },
      out: { type: 'string' },
      date: { type: 'string' },
      against: { type: 'string' },
      'collector-version': { type: 'string' },
      'skip-build': { type: 'boolean' },
    },
  });
  if (!values.label) {
    console.error(
      'Usage: node evals/blip/collect.mjs --label <label> [--cache <dir>] [--out <dir>] [--date YYYY-MM-DD] [--against <results dir>] [--skip-build]',
    );
    process.exit(2);
  }
  try {
    const done = collect({
      label: values.label,
      cache: values.cache,
      version: values['collector-version'] ?? collectorVersion(),
      build: !values['skip-build'],
      against: values.against ? resolve(values.against) : null,
    });
    const date = values.date ?? new Date().toISOString().slice(0, 10);
    const dir = write(
      done,
      values.out ? resolve(values.out) : join(HERE, 'results'),
      date,
    );
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
  main();
