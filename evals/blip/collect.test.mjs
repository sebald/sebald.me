import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { collect, write } from './collect.mjs';
import { buildCache, fixtureRuns } from './fixtures/build-cache.mjs';
import { configOrder } from './lib/aggregate.mjs';
import {
  analyseTranscript,
  blipCalls,
  networkCalls,
} from './lib/transcript.mjs';
import { checkBuild, collectorEnv, places } from './lib/tree.mjs';

const FIXTURES = join(fileURLToPath(import.meta.url), '../fixtures');
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));

/** Every key of `expected` is in `actual`, with the same value (arrays: same length) */
const assertSubset = (actual, expected, where) => {
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    assert.ok(
      actual && typeof actual === 'object',
      `${where}: expected an object`,
    );
    for (const [key, value] of Object.entries(expected)) {
      if (key === '_') continue;
      assertSubset(actual[key], value, `${where}.${key}`);
    }
  } else if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `${where}: expected an array`);
    assert.equal(actual.length, expected.length, `${where}: length`);
    expected.forEach((item, i) =>
      assertSubset(actual[i], item, `${where}[${i}]`),
    );
  } else {
    assert.deepEqual(actual, expected, where);
  }
};

const sha = path =>
  createHash('sha256').update(readFileSync(path)).digest('hex');

describe('the collector on the fixtures', () => {
  let dir;
  let cache;
  let first;
  const options = () => ({
    label: 'fx',
    cache: join(dir, 'cache'),
    version: 'test',
    build: false,
  });

  before(() => {
    dir = mkdtempSync(join(tmpdir(), 'blip-collect-'));
    cache = buildCache(join(dir, 'cache'));
    first = collect(options());
  });
  after(() => rmSync(dir, { recursive: true, force: true }));

  it('finds every run the fixtures hold', () => {
    assert.deepEqual(
      first.results.runs.map(run => run.id),
      fixtureRuns().sort(),
    );
    assert.equal(first.results.runs.length, 10);
  });

  it('matches the numbers written beside each fixture run', () => {
    for (const run of first.results.runs) {
      const expected = readJson(
        join(FIXTURES, 'runs', run.id, 'expected.json'),
      );
      assertSubset(run.transcript, expected.transcript, `${run.id}.transcript`);
      assertSubset(run.tree, expected.tree, `${run.id}.tree`);
    }
  });

  it('takes the scope from the rubric', () => {
    const scopes = Object.fromEntries(
      first.results.runs.map(run => [run.id, run.scope]),
    );
    assert.equal(scopes['cli/pause-1'], 'changed-lines');
    assert.equal(scopes['cli/camp-rest-1'], 'changed-lines');
    assert.equal(scopes['cli/shop-1'], 'all');
  });

  it('counts an untouched div of camp.tsx for scope all and not for changed-lines', () => {
    const byId = id => first.results.runs.find(run => run.id === id);
    // Template: three divs in camp.tsx
    assert.equal(byId('cli/shop-2').tree.rawTags.byTag.div, 3);
    // camp-rest: the agent adds one div next to the three; only it counts
    assert.equal(byId('cli/camp-rest-1').tree.rawTags.byTag.div, 1);
    // pause adds a file with one div and leaves camp.tsx alone
    assert.equal(byId('cli/pause-1').tree.rawTags.byTag.div, 1);
    assert.equal(byId('cli/pause-2').tree.rawTags.byTag.div, 1);
  });

  it('flags a curl as network use, and only that run', () => {
    const flagged = first.results.runs
      .filter(run => run.transcript.network.length > 0)
      .map(run => run.id);
    assert.deepEqual(flagged, ['cli/shop-2']);
    assert.match(
      first.summary,
      /## Network use\s+1 of 10 runs[^]*`cli\/shop-2`: `curl`/,
    );
  });

  it('lists the colours on Button in 3 runs of 2 tasks once, and nothing else', () => {
    const expected = readJson(join(FIXTURES, 'expected.json'));
    assertSubset(first.results.candidates, expected.candidates, 'candidates');
    const keys = first.results.candidates.map(candidate => candidate.key);
    // Three runs of one task
    assert.ok(!keys.some(key => key.includes('Tabs.Tab')));
    // A margin on Button, three runs of two tasks
    assert.ok(!keys.some(key => key.includes('mt-4')));
    assert.match(
      first.summary,
      /## Candidate variants[^]*`Button`[^]*`bg-red-700` `text-white`/,
    );
  });

  it('shows each measure per configuration and per task, with the number of runs', () => {
    const expected = readJson(join(FIXTURES, 'expected.json'));
    const { groups, configs, tasks } = first.results.aggregate;
    assert.deepEqual(configs, ['no-cli', 'cli']);
    assert.deepEqual(tasks, [
      'camp-rest',
      'fight-hud',
      'pause',
      'quests',
      'saves',
      'shop',
    ]);
    assert.equal(groups.cli.all.runs, expected.runs.cli);
    assert.equal(groups['no-cli'].all.runs, expected.runs['no-cli']);
    const shop = groups.cli.tasks.shop;
    assert.equal(shop.runs, expected.shop.runs);
    for (const id of [
      'outputTokens',
      'blipCalls',
      'overBudget',
      'lookupFirst',
    ]) {
      assert.deepEqual(shop.measures[id], expected.shop[id], id);
    }
    // A build that was not run is not a share of zero
    assert.equal(groups.cli.all.measures.builds, null);

    const { summary } = first;
    assert.match(
      summary,
      /## Runs\s+\| configuration \| all \| camp-rest \| fight-hud \| pause \| quests \| saves \| shop \|/,
    );
    assert.match(summary, /\| cli \| 9 \| 1 \| 1 \| 2 \| 3 \| 0 \| 2 \|/);
    assert.match(
      summary,
      /### output tokens\s+\| configuration \| all \| vs previous \|/,
    );
    assert.match(
      summary,
      /\| cli \| [^|]+\| [^|]*\| [^|]+\| [^|]+\| [^|]+\| [^|]+\| - \| 220 \(40 to 400\) \|/,
    );
    assert.match(summary, /### over budget/);
  });

  it('records the collector and the CLI version', () => {
    assert.deepEqual(first.results.collector, { version: 'test' });
    assert.deepEqual(first.results.cli, { version: '0.0.0-fixture' });
    assert.match(first.summary, /Collector `test`, Blip CLI `0.0.0-fixture`/);
  });

  it('gives the same files twice and leaves every events.jsonl as the agent left it', () => {
    const logs = ['cli/shop-1', 'cli/pause-1'].map(id =>
      join(cache, id, '.blip', 'events.jsonl'),
    );
    const before = logs.map(sha);
    const out = name => join(dir, name);
    const a = write(collect(options()), out('a'), '2026-01-01');
    const b = write(collect(options()), out('b'), '2026-01-01');
    for (const file of ['results.json', 'summary.md']) {
      assert.equal(
        readFileSync(join(a, file), 'utf8'),
        readFileSync(join(b, file), 'utf8'),
        file,
      );
    }
    assert.deepEqual(logs.map(sha), before);
    // A run without a log of its own did not get one
    assert.ok(!existsSync(join(cache, 'cli', 'quests-1', '.blip')));
    // Nothing of the cache's absolute path ends up in the results
    assert.ok(!readFileSync(join(a, 'results.json'), 'utf8').includes(dir));
  });

  it('writes only summary.md and results.json', () => {
    const written = write(first, join(dir, 'only'), '2026-01-01');
    assert.deepEqual(readdirSync(written).sort(), [
      'results.json',
      'summary.md',
    ]);
  });

  it('refuses to put results side by side when the collector or the CLI differs', () => {
    const base = write(first, join(dir, 'base'), '2026-01-01');
    const same = collect({ ...options(), against: base });
    assert.match(same.summary, /## Against fx\n/);
    assert.doesNotMatch(same.summary, /Not compared/);
    assert.match(same.summary, /\| output tokens \| cli \|/);

    const other = collect({ ...options(), version: 'other', against: base });
    assert.match(
      other.summary,
      /Not compared: the collector differs \(test, this one other\)\./,
    );
    assert.match(other.summary, /Collect `fx` again/);
    assert.doesNotMatch(
      other.summary,
      /\| output tokens \| cli \|[^\n]*\| [^\n]*\| [^\n]*\|\n/,
    );

    const results = readJson(join(base, 'results.json'));
    results.cli.version = '9.9.9';
    writeFileSync(join(base, 'results.json'), JSON.stringify(results));
    const cli = collect({ ...options(), against: base });
    assert.match(
      cli.summary,
      /the CLI differs \(9\.9\.9, this one 0\.0\.0-fixture\)/,
    );
  });

  it('stops when the runs of a label used different CLI versions', () => {
    const run = join(
      cache,
      'cli',
      'shop-2',
      'node_modules',
      '@sebald',
      'blip-ui',
      'package.json',
    );
    const original = readFileSync(run, 'utf8');
    writeFileSync(
      run,
      JSON.stringify({ name: '@sebald/blip-ui', version: '1.2.3' }),
    );
    try {
      assert.throws(() => collect(options()), /2 CLI versions/);
    } finally {
      writeFileSync(run, original);
    }
  });
});

describe('the transcript', () => {
  it('reads the blip calls of a command, however it is started', () => {
    assert.deepEqual(blipCalls('pnpm exec blip search a b'), ['search']);
    assert.deepEqual(
      blipCalls('node_modules/.bin/blip docs button && pnpm exec blip'),
      ['docs', 'help'],
    );
    assert.deepEqual(
      blipCalls('BLIP_EVENTS=off npx blip validate --json | head'),
      ['validate'],
    );
    assert.deepEqual(blipCalls('echo blip search'), []);
    assert.deepEqual(blipCalls('grep -r blip src'), []);
  });

  it('flags what reaches out and not what works offline', () => {
    assert.deepEqual(networkCalls('curl -s https://x.test | head'), ['curl']);
    assert.deepEqual(networkCalls('wget x; gh pr view 1'), ['wget', 'gh']);
    assert.deepEqual(networkCalls('npm view left-pad version'), ['npm view']);
    assert.deepEqual(networkCalls('pnpm add left-pad'), ['pnpm add']);
    assert.deepEqual(networkCalls('npm install left-pad'), ['npm install']);
    assert.deepEqual(networkCalls('pnpm install'), []);
    assert.deepEqual(networkCalls('pnpm install --offline'), []);
    assert.deepEqual(networkCalls('pnpm exec tsc --noEmit && ls src'), []);
    assert.deepEqual(networkCalls('echo curl'), []);
  });

  it('counts a message once however many events carry it, and survives a torn line', () => {
    const event = (blocks, usage) =>
      JSON.stringify({
        type: 'assistant',
        message: { id: 'm', content: blocks, usage },
        parent_tool_use_id: null,
      });
    const done = analyseTranscript(
      [
        event([{ type: 'text', text: 'a' }], {
          input_tokens: 5,
          output_tokens: 1,
        }),
        event(
          [
            {
              type: 'tool_use',
              id: 't',
              name: 'Bash',
              input: { command: 'ls' },
            },
          ],
          { input_tokens: 5, output_tokens: 9 },
        ),
        '{"type":"assis',
      ].join('\n'),
    );
    assert.equal(done.toolCalls.total, 1);
    assert.equal(done.badLines, 1);
    assert.equal(done.turns, 1);
    // No result event: not a result
    assert.equal(done.status, 'incomplete');
  });

  it('does not count a run that ends on the usage limit', () => {
    const done = analyseTranscript(
      JSON.stringify({
        type: 'result',
        subtype: 'success',
        is_error: true,
        result: 'Claude usage limit reached',
      }),
    );
    assert.equal(done.status, 'incomplete');
    assert.equal(done.reason, 'usage limit');
  });
});

describe('the tree', () => {
  it('tells a class that places from one that restyles', () => {
    for (const token of [
      'mt-4',
      '-mt-2',
      'flex',
      'flex-col',
      'gap-2',
      'absolute',
      'inset-0',
      'w-full',
      'tall:grid-cols-2',
      'md:hidden',
      '!m-0',
      'overflow-hidden',
      'self-end',
    ]) {
      assert.ok(places(token), token);
    }
    for (const token of [
      'bg-red-700',
      'text-white',
      'p-2',
      'px-4',
      'border-4',
      'rounded',
      'font-bold',
      'opacity-70',
      'mix-blend-multiply',
      'hover:bg-red-500',
    ]) {
      assert.ok(!places(token), token);
    }
  });

  it('keeps the CLI from writing to the agent’s event log', () => {
    assert.equal(
      collectorEnv({ PATH: '/x', BLIP_EVENTS: 'on' }).BLIP_EVENTS,
      'off',
    );
    assert.equal(collectorEnv({}).BLIP_EVENTS, 'off');
  });

  it('runs tsc and the build the run installed, with BLIP_EVENTS off', () => {
    const run = mkdtempSync(join(tmpdir(), 'blip-build-'));
    try {
      mkdirSync(join(run, 'node_modules', '.bin'), { recursive: true });
      const bin = (name, body) => {
        writeFileSync(
          join(run, 'node_modules', '.bin', name),
          `#!/bin/sh\n${body}\n`,
        );
        chmodSync(join(run, 'node_modules', '.bin', name), 0o755);
      };
      bin(
        'tsc',
        'echo "src/a.tsx(1,1): error TS2304: x"; echo "src/b.tsx(1,1): error TS2322: y"; exit 2',
      );
      bin('vite', '[ "$BLIP_EVENTS" = off ] && exit 0; exit 1');
      assert.deepEqual(checkBuild(run), {
        tsc: { ran: true, ok: false, errors: 2 },
        build: { ran: true, ok: true, errors: 0 },
      });
      // Nothing installed: not run, which is not a pass
      assert.deepEqual(checkBuild(tmpdir()).tsc, {
        ran: false,
        ok: null,
        errors: null,
      });
    } finally {
      rmSync(run, { recursive: true, force: true });
    }
  });

  it('orders configurations as they add to one another', () => {
    assert.deepEqual(configOrder(['full', 'cli', 'x', 'no-cli', 'plan']), [
      'no-cli',
      'cli',
      'plan',
      'full',
      'x',
    ]);
  });
});
