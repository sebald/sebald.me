// The judge's tests: a stand-in answers, no real call is made

import assert from 'node:assert/strict';
import {
  chmodSync,
  copyFileSync,
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
import { buildCache } from './fixtures/build-cache.mjs';
import {
  blind,
  ask,
  blindPatterns,
  buildQuestion,
  judgeArgs,
  judgeRun,
  judgeRuns,
  judgeStatement,
  loadPrompt,
  rubricOfTask,
  srcDiff,
  validateAnswer,
} from './lib/judge.mjs';
import { compareLabels, pickRun } from './lib/labels.mjs';
import { screenshotFile, screenshotsDir } from './lib/screenshots.mjs';

const HERE = fileURLToPath(new URL('.', import.meta.url));
const TASKS = join(HERE, 'tasks');
const prompt = loadPrompt();

const TASK_IDS = readdirSync(TASKS).filter(name =>
  existsSync(join(TASKS, name, 'rubric.json')),
);

const answer = (verdict = 'pass', evidence = 'saw it') => ({
  text: JSON.stringify({ verdict, evidence }),
  costUsd: 0.01,
  model: 'stand-in',
});

describe('the prompt', () => {
  it('has its three sections and a hash', () => {
    assert.ok(prompt.System && prompt['Question from the diff']);
    assert.ok(prompt['Question from a screenshot']);
    assert.match(prompt.hash, /^[0-9a-f]{12}$/);
  });

  it('names no part of how the change was made', () => {
    const all = JSON.stringify(prompt);
    for (const pattern of blindPatterns({ label: 'day-zero' }))
      assert.ok(!pattern.test(all), `judge.md matches ${pattern}`);
  });

  it('is clean in every rubric statement, note and ticket', () => {
    assert.equal(TASK_IDS.length, 6);
    for (const task of TASK_IDS) {
      const { rubric, ticket } = rubricOfTask(TASKS, task);
      const texts = [
        ticket,
        ...rubric.statements.flatMap(s => [s.text, s.note ?? '']),
      ];
      for (const text of texts)
        assert.equal(
          blind(text, blindPatterns()).redacted,
          false,
          `${task}: ${text.slice(0, 60)}`,
        );
    }
  });
});

describe('one question per statement', () => {
  const ticket = '# Shop\n\nBuild a shop.';
  it('gives a diff statement the ticket, the claim, the note and the diff, no screenshot', () => {
    const q = buildQuestion({
      prompt,
      statement: { id: 'a', text: 'It buys.', note: 'A note.', from: 'diff' },
      ticket,
      diff: '+const x = 1;',
    });
    assert.equal(q.kind, 'diff');
    assert.match(q.user, /Build a shop\./);
    assert.match(q.user, /Claim: It buys\./);
    assert.match(q.user, /Note: A note\./);
    assert.match(q.user, /\+const x = 1;/);
    assert.doesNotMatch(q.user, /screenshot/i);
    const args = judgeArgs({
      model: 'm',
      system: q.system,
      tools: '',
      budget: 1,
    });
    assert.equal(args[args.indexOf('--tools') + 1], '');
    assert.ok(
      !args.includes('--allowedTools'),
      'a diff question has no tools at all',
    );
    const withRead = judgeArgs({
      model: 'm',
      system: 's',
      tools: 'Read',
      budget: 1,
    });
    assert.equal(withRead[withRead.indexOf('--allowedTools') + 1], 'Read');
  });

  it('gives a screenshot statement the ticket and one picture, never a diff', () => {
    const q = buildQuestion({
      prompt,
      statement: {
        id: 'a',
        text: 'It shows 120.',
        from: 'screenshot',
        screenshot: 'start@wide',
      },
      ticket,
      diff: '+const secret = 1;',
    });
    assert.equal(q.kind, 'screenshot');
    assert.match(q.user, /Build a shop\./);
    assert.match(q.user, /screenshot\.png/);
    assert.doesNotMatch(q.user, /secret|The diff of/);
    assert.doesNotMatch(q.user, /Note:/);
  });

  it('leaves out what is for the human reader: the url and unstated', () => {
    const q = buildQuestion({
      prompt,
      statement: {
        id: 'a',
        text: 'It asks.',
        from: 'diff',
        url: 'empty',
        unstated: true,
      },
      ticket,
      diff: '',
    });
    assert.doesNotMatch(q.user, /empty'|unstated|url/i);
  });
});

describe('guards', () => {
  const ticket = '# T';
  it('refuses a statement whose source is not diff or screenshot', () => {
    assert.throws(
      () =>
        buildQuestion({
          prompt,
          statement: { id: 'a', text: 'x', from: 'screnshot' },
          ticket,
          diff: '',
        }),
      /from must be/,
    );
    assert.throws(
      () =>
        buildQuestion({
          prompt,
          statement: { id: 'a', text: 'x', from: 'screenshot' },
          ticket,
          diff: '',
        }),
      /needs a screenshot/,
    );
  });

  it('refuses a ticket, claim or note that names what the judge must not see', () => {
    const statement = { id: 'a', text: 'x', from: 'diff' };
    assert.throws(
      () =>
        buildQuestion({ prompt, statement, ticket: 'see CLAUDE.md', diff: '' }),
      /must not see/,
    );
    assert.throws(
      () =>
        buildQuestion({
          prompt,
          statement: { ...statement, note: 'in .blip/' },
          ticket,
          diff: '',
        }),
      /must not see/,
    );
  });

  it('aborts, instead of recording errors, when the login is not the subscription', async () => {
    await assert.rejects(
      judgeStatement({
        question: { kind: 'diff', system: 's', user: 'u' },
        askFn: async () => ({
          fatal: true,
          error: 'apiKeySource is "x", not "none"',
        }),
      }),
      /Judge aborted/,
    );
  });
});

describe('the process', () => {
  let dir;
  before(() => {
    dir = mkdtempSync(join(tmpdir(), 'blip-judge-stub-'));
  });
  after(() => rmSync(dir, { recursive: true, force: true }));

  const stub = (name, source) => {
    const path = join(dir, name);
    writeFileSync(path, `#!/usr/bin/env node\n${source}`);
    chmodSync(path, 0o755);
    return path;
  };
  const question = {
    kind: 'screenshot',
    system: 'SYSTEM TEXT',
    user: 'USER TEXT',
  };
  const shot = join(
    HERE,
    '../../tests/game/__screenshots__/desktop/title-menu.png',
  );

  it('starts claude isolated, feeds the question on stdin and reads the result', async () => {
    const claude = stub(
      'ok.cjs',
      `const fs = require('node:fs');
const input = fs.readFileSync(0, 'utf8');
const report = { argv: process.argv.slice(2), cwd: process.cwd(), env: Object.keys(process.env), input,
  settings: fs.readFileSync('.claude/settings.json', 'utf8'), shot: fs.existsSync('screenshot.png') };
console.log(JSON.stringify({ type: 'system', subtype: 'init', apiKeySource: 'none', model: 'stand-in' }));
console.log(JSON.stringify({ type: 'result', is_error: false, total_cost_usd: 0.02, modelUsage: { 'stand-in': {} }, result: JSON.stringify(report) }));
`,
    );
    const reply = await ask(question, {
      claude,
      screenshot: shot,
      env: {
        PATH: process.env.PATH,
        HOME: process.env.HOME,
        ANTHROPIC_API_KEY: 'sk-secret',
        GITHUB_TOKEN: 'x',
        CLAUDE_CODE_OAUTH_TOKEN: 'y',
      },
    });
    assert.equal(reply.error, null);
    assert.equal(reply.costUsd, 0.02);
    assert.equal(reply.model, 'stand-in');
    const seen = JSON.parse(reply.text);
    assert.equal(seen.input, 'USER TEXT');
    assert.ok(seen.shot);
    assert.ok(!seen.cwd.includes('blip-eval'));
    assert.deepEqual(
      seen.env.filter(k => /KEY|TOKEN|SECRET/.test(k)),
      [],
    );
    assert.match(seen.settings, /claudeMdExcludes/);
    const get = flag => seen.argv[seen.argv.indexOf(flag) + 1];
    assert.equal(get('--setting-sources'), 'project');
    assert.equal(get('--tools'), 'Read');
    assert.equal(get('--system-prompt'), 'SYSTEM TEXT');
    assert.ok(seen.argv.includes('--strict-mcp-config'));
  });

  it('is fatal when the login is not the subscription', async () => {
    const claude = stub(
      'key.cjs',
      `console.log(JSON.stringify({ type: 'system', subtype: 'init', apiKeySource: 'ANTHROPIC_API_KEY' }));
setTimeout(() => {}, 5000);`,
    );
    const reply = await ask(question, {
      claude,
      env: { PATH: process.env.PATH, HOME: process.env.HOME },
    });
    assert.equal(reply.fatal, true);
    assert.match(reply.error, /apiKeySource/);
  });

  it('reports a result that is an error, and a run that never answers', async () => {
    const bad = stub(
      'err.cjs',
      `console.log(JSON.stringify({ type: 'system', subtype: 'init', apiKeySource: 'none' }));
console.log(JSON.stringify({ type: 'result', is_error: true, subtype: 'error_max_budget_usd', result: 'budget' }));`,
    );
    assert.match(
      (
        await ask(question, {
          claude: bad,
          env: { PATH: process.env.PATH, HOME: process.env.HOME },
        })
      ).error,
      /error result/,
    );
    const slow = stub('slow.cjs', 'setTimeout(() => {}, 5000);');
    assert.equal(
      (
        await ask(question, {
          claude: slow,
          timeoutMs: 300,
          env: { PATH: process.env.PATH, HOME: process.env.HOME },
        })
      ).error,
      'timed out',
    );
  });
});

describe('the answer', () => {
  it('accepts the schema and only it', () => {
    assert.deepEqual(validateAnswer('{"verdict":"pass","evidence":"line 3"}'), {
      ok: true,
      verdict: 'pass',
      evidence: 'line 3',
    });
    assert.equal(
      validateAnswer('Sure: {"verdict":"fail","evidence":"x"} done').ok,
      true,
    );
    for (const bad of [
      '',
      'pass',
      '{"verdict":"maybe","evidence":"x"}',
      '{"verdict":"pass"}',
      '{"verdict":"pass","evidence":""}',
      '{"verdict":"pass","evidence":"x","extra":1}',
      '{"verdict":"pass","evidence":5}',
      '[1]',
      '{not json}',
    ])
      assert.equal(validateAnswer(bad).ok, false, bad);
  });

  const question = { kind: 'diff', system: 's', user: 'u' };

  it('asks once more after an invalid answer, and takes a valid second one', async () => {
    const replies = [
      { text: 'no idea', costUsd: 0.01 },
      answer('fail', 'it did not'),
    ];
    let calls = 0;
    const result = await judgeStatement({
      question,
      askFn: async () => replies[calls++],
    });
    assert.equal(calls, 2);
    assert.equal(result.verdict, 'fail');
    assert.equal(result.attempts, 2);
    assert.equal(result.costUsd, 0.02);
  });

  it('records a judge error after a second invalid answer, and asks no third time', async () => {
    let calls = 0;
    const result = await judgeStatement({
      question,
      askFn: async () => {
        calls++;
        return { text: '{"verdict":"yes"}', costUsd: 0.01 };
      },
    });
    assert.equal(calls, 2);
    assert.equal(result.verdict, 'error');
    assert.match(result.evidence, /invalid answer/);
  });

  it('does not retry a failed process, except a timeout', async () => {
    let calls = 0;
    const broken = await judgeStatement({
      question,
      askFn: async () => (
        calls++,
        { error: 'apiKeySource is "x", not "none"' }
      ),
    });
    assert.equal(calls, 1);
    assert.equal(broken.verdict, 'error');
    calls = 0;
    await judgeStatement({
      question,
      askFn: async () => (calls++, { error: 'timed out' }),
    });
    assert.equal(calls, 2);
  });
});

describe('the diff and what the judge may see', () => {
  let dir;
  let cache;
  before(() => {
    dir = mkdtempSync(join(tmpdir(), 'blip-judge-'));
    cache = buildCache(join(dir, 'cache'), 'fx');
  });
  after(() => rmSync(dir, { recursive: true, force: true }));

  const runOf = id => {
    const [config, name] = id.split('/');
    return {
      id,
      config,
      task: name.replace(/-\d+$/, ''),
      dir: join(cache, id),
    };
  };
  const rubric = {
    task: 'shop',
    statements: [
      {
        id: 'd',
        text: 'It guards.',
        from: 'diff',
        unstated: true,
        url: 'empty',
      },
      {
        id: 's',
        text: 'It shows 120.',
        from: 'screenshot',
        screenshot: 'start@wide',
      },
    ],
  };

  it('is the diff of src/ since the first commit, and only that', () => {
    const diff = srcDiff(runOf('cli/shop-1').dir);
    assert.match(diff, /^diff --git a\/src\//m);
    assert.doesNotMatch(diff, /\.blip|CLAUDE\.md|transcript|meta\.json/);
  });

  it('shows the judge nothing of the configuration, the label, a path or .blip/', async () => {
    for (const id of ['cli/shop-1', 'cli/camp-rest-1']) {
      const run = runOf(id);
      mkdirSync(join(run.dir, '.blip'), { recursive: true });
      writeFileSync(
        join(run.dir, '.blip', 'events.jsonl'),
        '{"event":"hook"}\n',
      );
      const seen = [];
      const judgeDir = join(dir, `judge-${id.replace('/', '-')}`);
      await judgeRun({
        run,
        label: 'fx',
        rubric: { ...rubric, task: run.task },
        ticket: '# Ticket\n\nSomething.',
        prompt,
        labelDir: cache,
        judgeDir,
        askFn: async (question, options) => {
          seen.push(`${question.system}\n${question.user}`);
          assert.equal(
            options.screenshot,
            null,
            'no screenshot exists, none is passed',
          );
          return answer();
        },
      });
      assert.equal(seen.length, 1, 'only the diff statement is asked');
      for (const text of seen) {
        assert.doesNotMatch(text, /\.blip|CLAUDE\.md|blip\.config|no-cli/);
        assert.ok(!text.includes(run.dir) && !text.includes(cache));
        assert.ok(
          !new RegExp(`(?<![\\w-])${run.config}(?![\\w-])`).test(text),
          run.config,
        );
        assert.doesNotMatch(text, /(?<![\w-])fx(?![\w-])/);
      }
    }
  });

  it('takes a configuration name out of a diff it appears in, and says so', () => {
    const patterns = blindPatterns({ label: 'day-zero' });
    const result = blind(
      'see .blip/events.jsonl and CLAUDE.md for runs (no-cli, day-zero)',
      patterns,
    );
    assert.equal(result.redacted, true);
    assert.equal(
      result.text,
      'see [removed]/events.jsonl and [removed] for runs ([removed], [removed])',
    );
    assert.equal(
      blind('const client = clipboard; // full health, plan b', patterns)
        .redacted,
      false,
    );
  });

  it('asks a screenshot statement with the picture, and a diff statement without', async () => {
    const run = runOf('cli/shop-1');
    // Where the rendered pass puts them: <label>/.screenshots/<run id>/<url id>@wide|phone.png
    const shots = screenshotsDir(cache, run.id);
    mkdirSync(shots, { recursive: true });
    copyFileSync(
      join(HERE, '../../tests/game/__screenshots__/desktop/title-menu.png'),
      join(shots, 'start@wide.png'),
    );
    assert.equal(
      screenshotFile(cache, run.id, 'start@wide'),
      join(shots, 'start@wide.png'),
    );
    assert.equal(
      screenshotFile(cache, run.id, 'start'),
      join(shots, 'start@wide.png'),
      'a bare url id is the wide one',
    );
    assert.equal(screenshotFile(cache, run.id, 'start@phone'), null);
    const asked = [];
    const record = await judgeRun({
      run,
      label: 'fx',
      rubric,
      ticket: '# T',
      prompt,
      labelDir: cache,
      judgeDir: join(dir, 'judge-shots'),
      askFn: async (question, options) => {
        asked.push({ kind: question.kind, screenshot: options.screenshot });
        return answer('fail', 'no 120');
      },
    });
    assert.deepEqual(
      asked.map(a => [a.kind, a.screenshot === null]),
      [
        ['diff', true],
        ['screenshot', false],
      ],
    );
    assert.deepEqual(
      record.statements.map(s => [s.key, s.verdict, s.unstated]),
      [
        ['shop/d', 'fail', true],
        ['shop/s', 'fail', false],
      ],
    );
    assert.equal(record.stated.fail, 1);
    assert.equal(record.unstated.fail, 1);
    assert.equal(record.costUsd, 0.02);
  });

  it('skips a screenshot statement without its screenshot and fails nothing', async () => {
    const run = runOf('cli/shop-2');
    const record = await judgeRun({
      run,
      label: 'fx',
      rubric,
      ticket: '# T',
      prompt,
      labelDir: cache,
      judgeDir: join(dir, 'judge-skip'),
      askFn: async () => answer(),
    });
    assert.equal(record.statements[1].verdict, 'skipped');
    assert.deepEqual(record.stated, { pass: 0, fail: 0, error: 0, skipped: 1 });
  });

  it('answers from the cache the second time, until the statement changes', async () => {
    const run = runOf('cli/shop-1');
    const judgeDir = join(dir, 'judge-cache');
    let calls = 0;
    const askFn = async () => (calls++, answer());
    const go = r =>
      judgeRun({
        run,
        label: 'fx',
        rubric: r,
        ticket: '# T',
        prompt,
        labelDir: cache,
        judgeDir,
        askFn,
      });
    await go(rubric);
    const first = calls;
    await go(rubric);
    assert.equal(calls, first, 'nothing asked again');
    await go({
      ...rubric,
      statements: [{ ...rubric.statements[0], text: 'It guards more.' }],
    });
    assert.equal(calls, first + 1);
  });

  it('does not cache a judge error', async () => {
    const run = runOf('cli/shop-1');
    const judgeDir = join(dir, 'judge-err');
    let calls = 0;
    const askFn = async () => (calls++, { error: 'no result event' });
    const one = { task: 'shop', statements: [rubric.statements[0]] };
    const go = () =>
      judgeRun({
        run,
        label: 'fx',
        rubric: one,
        ticket: '# T',
        prompt,
        labelDir: cache,
        judgeDir,
        askFn,
      });
    assert.equal((await go()).statements[0].verdict, 'error');
    await go();
    assert.equal(calls, 2);
  });

  it('stops when the estimate passes the cap', async () => {
    await assert.rejects(
      judgeRuns({
        runs: [runOf('cli/shop-1'), runOf('cli/shop-2')],
        label: 'fx',
        rubricOf: () => ({ rubric, ticket: '# T' }),
        labelDir: cache,
        judgeDir: join(dir, 'judge-cap'),
        parallel: 1,
        maxCostUsd: 0.005,
        askFn: async () => answer(),
      }),
      /Judge stopped/,
    );
  });

  describe('in the collector', () => {
    const judged = id => ({
      model: 'stand-in',
      costUsd: 0.05,
      stated: { pass: 1, fail: 1, error: 0, skipped: 0 },
      unstated: { pass: 0, fail: 1, error: 0, skipped: 1 },
      statements: [
        {
          key: 'shop/gold',
          id: 'gold',
          unstated: false,
          from: 'screenshot',
          screenshot: 'start@wide',
          verdict: 'fail',
          evidence: 'Gold reads 12.',
        },
        {
          key: 'shop/cant-buy',
          id: 'cant-buy',
          unstated: false,
          from: 'diff',
          verdict: 'pass',
          evidence: 'fine',
        },
        {
          key: 'shop/nothing-to-sell',
          id: 'nothing-to-sell',
          unstated: true,
          from: 'diff',
          verdict: 'fail',
          evidence: 'No empty text.',
        },
        {
          key: 'shop/x',
          id: 'x',
          unstated: true,
          from: 'screenshot',
          screenshot: 'empty@wide',
          verdict: 'skipped',
          evidence: 'none',
        },
      ],
      id,
    });
    const options = () => ({
      label: 'fx',
      cache: join(dir, 'cache'),
      version: 'test',
      build: false,
    });

    it('puts the answers in results.json, measure 3, and the failures with evidence in summary.md', () => {
      const out = collect({
        ...options(),
        judged: { 'cli/shop-1': judged('cli/shop-1') },
      });
      const run = out.results.runs.find(r => r.id === 'cli/shop-1');
      assert.equal(run.judge.stated.pass, 1);
      assert.ok(out.results.layers.includes('judge'));
      assert.deepEqual(out.results.judge.models, ['stand-in']);
      assert.equal(out.results.judge.costUsd, 0.05);
      assert.equal(
        out.results.runs.find(r => r.id === 'cli/shop-2').judge,
        undefined,
      );
      const { summary } = out;
      assert.match(summary, /## 3\. It does the job/);
      assert.match(
        summary,
        /### Failed statements\n\n- `cli\/shop-1` `shop\/gold` \(screenshot start@wide\): Gold reads 12\./,
      );
      assert.match(
        summary,
        /### Failed unstated statements\n\n- `cli\/shop-1` `shop\/nothing-to-sell` \(diff\): No empty text\./,
      );
      assert.doesNotMatch(
        summary.split('### Failed unstated')[0],
        /nothing-to-sell/,
      );
      assert.match(summary, /1 statements were not judged/);
    });

    it('collects the same without a judge as before, and twice the same with one', () => {
      const plain = collect(options());
      assert.equal(plain.results.judge, undefined);
      assert.ok(!plain.results.layers.includes('judge'));
      const j = { 'cli/shop-1': judged('cli/shop-1') };
      const a = write(
        collect({ ...options(), judged: j }),
        join(dir, 'oa'),
        '2026-01-01',
      );
      const b = write(
        collect({ ...options(), judged: j }),
        join(dir, 'ob'),
        '2026-01-01',
      );
      for (const file of ['results.json', 'summary.md'])
        assert.equal(
          readFileSync(join(a, file), 'utf8'),
          readFileSync(join(b, file), 'utf8'),
        );
    });
  });
});

describe('the labels', () => {
  it('picks the third smallest diff of six', () => {
    const sizes = [5, 1, 9, 3, 4, 2].map((chars, i) => ({
      id: `r${i}`,
      chars,
    }));
    assert.equal(pickRun(sizes), 'r3');
  });

  const labels = [
    {
      task: 't',
      run: 'cli/t-1',
      statements: [
        { id: 'a', pass: true },
        { id: 'b', pass: false },
        { id: 'c', pass: true },
        { id: 'd', pass: null },
        { id: 'e', pass: true },
      ],
    },
  ];
  const judge = [
    {
      task: 't',
      statements: [
        { id: 'a', verdict: 'pass', evidence: '1' },
        { id: 'b', verdict: 'pass', evidence: '2' },
        { id: 'c', verdict: 'pass', evidence: '3' },
        { id: 'd', verdict: 'pass', evidence: '4' },
        { id: 'e', verdict: 'skipped', evidence: '5' },
      ],
    },
  ];

  it('counts agreement on what both answered, and lists the rest apart', () => {
    const result = compareLabels(labels, judge);
    assert.equal(result.compared, 3);
    assert.equal(result.agreed, 2);
    assert.equal(result.meetsCriterion, false);
    assert.deepEqual(
      result.disagreements.map(d => d.key),
      ['t/b'],
    );
    assert.deepEqual(result.unlabelled, ['t/d']);
    assert.deepEqual(result.unjudged, ['t/e (skipped)']);
  });

  it('does not meet the criterion while statements are unlabelled or unjudged', () => {
    assert.equal(compareLabels(labels, judge).meetsCriterion, false);
    const all = [
      {
        task: 't',
        run: 'r',
        statements: [
          { id: 'a', pass: true },
          { id: 'b', pass: null },
        ],
      },
    ];
    const j = [
      { task: 't', statements: [{ id: 'a', verdict: 'pass', evidence: '' }] },
    ];
    assert.equal(compareLabels(all, j).share, 1);
    assert.equal(compareLabels(all, j).meetsCriterion, false);
  });

  it('meets the criterion at nine in ten', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `s${i}`,
      pass: true,
    }));
    const verdicts = many.map((s, i) => ({
      id: s.id,
      verdict: i === 0 ? 'fail' : 'pass',
      evidence: '',
    }));
    const result = compareLabels(
      [{ task: 't', run: 'r', statements: many }],
      [{ task: 't', statements: verdicts }],
    );
    assert.equal(result.share, 0.9);
    assert.equal(result.meetsCriterion, true);
  });
});
