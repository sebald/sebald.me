// Builds a cache of run directories from the hand-made fixtures, in the layout
// of spec 3.3 (`<cache>/<label>/<config>/<task>-<n>`), so the collector can be
// tried and tested without a Claude run:
//
//   node evals/blip/fixtures/build-cache.mjs <dir> [label]
//   node evals/blip/collect.mjs --label fx --cache <dir> --out <dir>/results --skip-build

import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const git = (cwd, ...args) =>
  execFileSync('git', args, {
    cwd,
    stdio: 'ignore',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: 'fixture',
      GIT_AUTHOR_EMAIL: 'fixture@example.com',
      GIT_COMMITTER_NAME: 'fixture',
      GIT_COMMITTER_EMAIL: 'fixture@example.com',
      GIT_AUTHOR_DATE: '2026-01-01T00:00:00Z',
      GIT_COMMITTER_DATE: '2026-01-01T00:00:00Z',
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_SYSTEM: '/dev/null',
    },
  });

/** `<config>/<task>-<n>` of every run the fixtures hold */
export const fixtureRuns = () => {
  const root = join(HERE, 'runs');
  return readdirSync(root, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .flatMap(config =>
      readdirSync(join(root, config.name), { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => `${config.name}/${entry.name}`),
    )
    .sort();
};

export const buildCache = (cache, label = 'fx') => {
  for (const id of fixtureRuns()) {
    const source = join(HERE, 'runs', id);
    const run = join(cache, label, id);
    mkdirSync(run, { recursive: true });
    cpSync(join(HERE, 'base'), run, { recursive: true });
    cpSync(join(HERE, 'package'), join(run, 'node_modules', '@sebald', 'blip-ui'), {
      recursive: true,
    });
    cpSync(join(source, 'transcript.jsonl'), join(run, 'transcript.jsonl'));
    if (existsSync(join(source, 'blip-events.jsonl'))) {
      mkdirSync(join(run, '.blip'), { recursive: true });
      cpSync(join(source, 'blip-events.jsonl'), join(run, '.blip', 'events.jsonl'));
    }
    // The template's first commit, then what the agent did to it
    git(run, 'init', '-q', '-b', 'main');
    git(run, 'add', 'src');
    git(run, 'commit', '-q', '-m', 'template');
    cpSync(join(source, 'final'), run, { recursive: true });
    const options = existsSync(join(source, 'fixture.json'))
      ? JSON.parse(readFileSync(join(source, 'fixture.json'), 'utf8'))
      : {};
    if (options.commit) {
      git(run, 'add', 'src');
      git(run, 'commit', '-q', '-m', 'agent');
    }
  }
  return join(cache, label);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [dir, label] = process.argv.slice(2);
  if (!dir) {
    console.error('Usage: node evals/blip/fixtures/build-cache.mjs <dir> [label]');
    process.exit(2);
  }
  console.log(buildCache(resolve(dir), label));
}
