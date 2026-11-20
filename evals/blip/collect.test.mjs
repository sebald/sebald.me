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

import { collect, write, writeupsIn } from './collect.mjs';
const SKIPPED = ['cli/quests-4', 'cli/quests-5', 'cli/quests-6'];

import { buildCache, fixtureRuns } from './fixtures/build-cache.mjs';
import { configOrder } from './lib/aggregate.mjs';
import {
  analyseTranscript,
  bashWritesSource,
  blipCalls,
  networkCalls,
} from './lib/transcript.mjs';
import {
  analyseSource,
  checkBuild,
  collectorEnv,
  places,
} from './lib/tree.mjs';

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
      fixtureRuns()
        .filter(id => !SKIPPED.includes(id))
        .sort(),
    );
    assert.equal(first.results.runs.length, 11);
  });

  it('reads task and rep from meta.json and skips what is not a result', () => {
    assert.deepEqual(
      first.results.skipped.map(run => [run.id, run.reason]),
      [
        ['cli/quests-4', 'failed: init check: unexpected plugin'],
        ['cli/quests-5', 'stopped: usage-limit'],
        ['cli/quests-6', 'no meta.json: unfinished'],
      ],
    );
    assert.match(
      first.summary,
      /## Skipped runs\s+- `cli\/quests-4`: failed: init check[^]*`cli\/quests-5`: stopped: usage-limit[^]*`cli\/quests-6`: no meta\.json/,
    );
    // The skipped runs are not in the counts: quests has its three results
    assert.equal(first.results.aggregate.groups.cli.tasks.quests.runs, 3);
  });

  it('counts a heredoc into a .tsx in a Bash call as the first write', () => {
    const run = first.results.runs.find(run => run.id === 'cli/pause-3');
    assert.equal(run.transcript.toolCalls.byTool.Write, undefined);
    assert.equal(run.transcript.lookupBeforeFirstTsxWrite, true);
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
      /## Network use\s+1 of 11 runs[^]*`cli\/shop-2`: `curl`/,
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
    assert.match(summary, /\| cli \| 10 \| 1 \| 1 \| 3 \| 3 \| 0 \| 2 \|/);
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
    assert.match(first.results.cli.version, /^0\.0\.0-fixture\+[0-9a-f]{12}$/);
    assert.match(
      first.summary,
      /Collector `test`, Blip CLI `0\.0\.0-fixture\+[0-9a-f]{12}`/,
    );
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

  it('leaves hand-written files alone and links them from summary.md', () => {
    const out = join(dir, 'writeups');
    const folder = join(out, '2026-01-01-fx');
    mkdirSync(folder, { recursive: true });
    writeFileSync(join(folder, 'invented.md'), 'by hand\n');
    writeFileSync(join(folder, 'summary.md'), 'old\n');
    const writeups = writeupsIn(out, '2026-01-01', 'fx');
    assert.deepEqual(writeups, ['invented.md']);
    write(collect({ ...options(), writeups }), out, '2026-01-01');
    assert.equal(
      readFileSync(join(folder, 'invented.md'), 'utf8'),
      'by hand\n',
    );
    const summary = readFileSync(join(folder, 'summary.md'), 'utf8');
    assert.match(summary, /Write-ups: \[`invented\.md`\]\(invented\.md\)\./);
    // nothing to link when there is no other file, and no folder yet
    assert.deepEqual(writeupsIn(out, '2026-01-02', 'fx'), []);
    assert.doesNotMatch(first.summary, /Write-ups/);
    // a second collect reads the same list: same summary
    assert.equal(
      summary,
      collect({ ...options(), writeups: writeupsIn(out, '2026-01-01', 'fx') })
        .summary,
    );
  });

  it('puts an inline style recurring in 3 runs of 2 tasks among the candidates', () => {
    const style = first.results.candidates.find(c => c.style.length);
    assert.equal(style.element, 'div');
    assert.deepEqual(style.style, [
      "display:'flex'",
      'gap:*',
      'inset:0',
      "position:'absolute'",
    ]);
    // pause-1 and pause-2 wrote the keys in another order; pause-3's one-off
    // `style` on Button is not a candidate
    assert.deepEqual(style.runs, ['cli/pause-1', 'cli/pause-2', 'cli/shop-1']);
    assert.equal(
      first.results.candidates.filter(c => c.style.length).length,
      1,
    );
    assert.match(
      first.summary,
      /\| `div` \(raw tag\) \| style: `display:'flex'` `gap:\*` `inset:0` `position:'absolute'` \| 3 \| pause, shop \| 3 \|/,
    );
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
      /the CLI differs \(9\.9\.9, this one 0\.0\.0-fixture\+[0-9a-f]{12}\)/,
    );
  });

  it('stops when the runs of a label used different tarballs', () => {
    const path = join(cache, 'cli', 'shop-2', 'meta.json');
    const original = readFileSync(path, 'utf8');
    const meta = JSON.parse(original);
    meta.tarball.sha256 = 'a'.repeat(64);
    writeFileSync(path, JSON.stringify(meta));
    try {
      assert.throws(() => collect(options()), /2 CLI versions/);
    } finally {
      writeFileSync(path, original);
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

  it('reads quotes, wrappers, nested shells and heredocs', () => {
    assert.deepEqual(networkCalls('git commit -m "fix; gh actions"'), []);
    assert.deepEqual(networkCalls('grep -r "a|curl" src'), []);
    assert.deepEqual(
      networkCalls("cat > x.sh <<'EOF'\ncurl http://x\nEOF"),
      [],
    );
    assert.deepEqual(networkCalls('pnpm install -D left-pad'), [
      'pnpm install',
    ]);
    assert.deepEqual(networkCalls('/usr/bin/curl x'), ['curl']);
    assert.deepEqual(networkCalls('timeout 5 curl x'), ['curl']);
    assert.deepEqual(networkCalls('env X=1 wget x'), ['wget']);
    assert.deepEqual(networkCalls('bash -c "ls && curl x"'), ['curl']);
    assert.deepEqual(networkCalls('npx left-pad'), ['npx']);
    assert.deepEqual(networkCalls('npx tsc --noEmit'), []);
    assert.deepEqual(networkCalls('node -e "fetch(\'https://x.test\')"'), [
      'node (network code)',
    ]);
    assert.deepEqual(blipCalls('pnpm --silent exec blip docs button'), [
      'docs',
    ]);
    assert.deepEqual(blipCalls('blip --cwd . search x'), ['search']);
    assert.deepEqual(blipCalls('timeout 9 blip search x'), ['search']);
  });

  it('sees a write to source in a Bash command', () => {
    const writes = command => bashWritesSource(command);
    assert.ok(writes("cat > src/a.tsx <<'EOF'\nx\nEOF"));
    assert.ok(writes('echo x >> src/a.ts'));
    assert.ok(writes('echo x >src/a.tsx'));
    assert.ok(writes('echo x | tee -a src/a.tsx'));
    assert.ok(writes('cp /tmp/x.tsx src/a.tsx'));
    assert.ok(writes('mv a.tmp src/a.tsx'));
    assert.ok(writes("sed -i '' 's/a/b/' src/a.tsx"));
    assert.ok(writes('bash -c "echo x > src/a.tsx"'));
    assert.ok(!writes('cat src/a.tsx'));
    assert.ok(!writes('pnpm exec tsc --noEmit 2>&1 | head'));
    assert.ok(!writes('echo x > notes.txt'));
    assert.ok(!writes("cat > x.sh <<'EOF'\necho y > src/a.tsx\nEOF"));
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

  it('leaves a conditional\u2019s test out of a className\u2019s classes', () => {
    const { elements } = analyseSource(
      'a.tsx',
      "export const A = ({ s }) => <div className={cn('a', s === 'open' ? 'b' : 'c')} />;",
    );
    assert.deepEqual(elements[0].classes.tokens, ['a', 'b', 'c']);
  });

  it('normalises an inline style: sorted keys, tuned values as *, spreads kept', () => {
    const { elements } = analyseSource(
      'a.tsx',
      `export const A = () => (
        <div style={{ position: 'absolute',  inset: 0, 'z-index': 1, ...extra, padding: \`calc(\${a}px + var(--bui-bar))\` }} />
      );
      export const B = () => <div style={frame} />;
      export const C = () => <div style={{}} />;`,
    );
    assert.deepEqual(
      elements[0].styleProp.declarations,
      [
        'inset:0',
        'padding:*',
        "position:'absolute'",
        'z-index:*',
        '...extra',
      ].sort(),
    );
    // not an object literal, or empty: counted as a style, nothing to compare
    assert.equal(elements[1].style, true);
    assert.equal(elements[1].styleProp, null);
    assert.equal(elements[2].styleProp, null);
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
