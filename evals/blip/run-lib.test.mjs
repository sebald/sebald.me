import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CONFIGS,
  baselineOf,
  checkInit,
  childEnv,
  claudeArgs,
  claudeMd,
  isDone,
  isUsageLimit,
  judgeBaseline,
  probeLine,
  summariseInit,
} from './run-lib.mjs';

const user = { plugins: ['productivity'], skills: ['brain'], agents: ['mine'] };
const init = (extra = {}) => ({
  apiKeySource: 'none',
  plugins: [],
  pluginEntries: [],
  skills: ['simplify'],
  agents: ['Explore'],
  ...extra,
});

test('childEnv drops the API key, repo paths and npm variables', () => {
  const env = childEnv(
    {
      ANTHROPIC_API_KEY: 'k',
      ANTHROPIC_AUTH_TOKEN: 't',
      npm_config_user_agent: 'pnpm',
      PNPM_SCRIPT_SRC_DIR: '/repo',
      INIT_CWD: '/repo',
      PATH: '/repo/node_modules/.bin:/usr/bin:/repo/packages/x/node_modules/.bin',
      HOME: '/home',
    },
    { repo: '/repo', cwd: '/cache/run' },
  );
  assert.equal(env.ANTHROPIC_API_KEY, undefined);
  assert.equal(env.ANTHROPIC_AUTH_TOKEN, undefined);
  assert.equal(env.npm_config_user_agent, undefined);
  assert.equal(env.INIT_CWD, undefined);
  assert.equal(env.PATH, '/usr/bin');
  assert.equal(env.PWD, '/cache/run');
  assert.equal(env.CLAUDE_CODE_DISABLE_AUTO_MEMORY, '1');
  assert.equal(env.HOME, '/home');
});

test('the command line carries the spec 3.3 flags, the same tools twice', () => {
  const args = claudeArgs({ model: 'm', budget: 4 });
  const at = flag => args[args.indexOf(flag) + 1];
  assert.equal(at('--tools'), at('--allowedTools'));
  assert.equal(at('--setting-sources'), 'project');
  assert.equal(at('--permission-mode'), 'acceptEdits');
  assert.equal(at('--max-budget-usd'), '4');
  assert.ok(args.includes('--strict-mcp-config'));
  assert.ok(args.includes('--include-hook-events'));
  assert.ok(!args.includes('--plugin-dir'));
});

test('CLAUDE.md names the command from cli on, not before', () => {
  assert.ok(!claudeMd('no-cli').includes('pnpm exec blip'));
  assert.ok(claudeMd('cli').includes('pnpm exec blip'));
  assert.equal(
    claudeMd('cli').split('\n').length - claudeMd('no-cli').split('\n').length,
    2,
  );
  assert.deepEqual(
    Object.entries(CONFIGS)
      .filter(([, c]) => c.built)
      .map(([name]) => name),
    ['no-cli', 'cli'],
  );
});

test('init check', () => {
  const ok = { config: 'cli', user };
  assert.deepEqual(checkInit(init(), ok), []);
  assert.match(
    checkInit(init({ apiKeySource: 'ANTHROPIC_API_KEY' }), ok)[0],
    /apiKeySource/,
  );
  assert.match(
    checkInit(init({ skills: ['simplify', 'brain'] }), ok)[0],
    /from ~\/\.claude/,
  );
  assert.match(
    checkInit(init({ skills: ['productivity:start'] }), ok)[0],
    /from ~\/\.claude/,
  );
  // built in, whatever the name: not a baseline list
  assert.deepEqual(
    checkInit(init({ agents: ['other'], skills: ['brand-new'] }), ok),
    [],
  );
});

const entry = (name, origin) => ({ name, origin });
const withPlugins = (...pluginEntries) =>
  init({ plugins: pluginEntries.map(e => e.name), pluginEntries });

test('init check: a plugin is built in by its own entry, not by name', () => {
  const ok = { config: 'cli', user };
  // a sixth built-in plugin is fine whatever its name
  assert.deepEqual(
    checkInit(
      withPlugins(entry('cc-plugin-easel', 'builtin'), entry('x', 'builtin')),
      ok,
    ),
    [],
  );
  // a user plugin with a built-in one's name fails, entry by entry
  const same = checkInit(
    withPlugins(
      entry('productivity', 'builtin'),
      entry('productivity', 'other'),
    ),
    ok,
  );
  assert.equal(same.length, 1);
  assert.match(same[0], /plugin "productivity" comes from ~\/\.claude/);
  // a stray plugin that is not built in fails
  assert.match(
    checkInit(
      withPlugins(entry('a', 'builtin'), entry('stray', 'other')),
      ok,
    )[0],
    /plugin "stray" is neither built in/,
  );
  // an entry that says nothing is not built in, even next to ones that do
  assert.match(
    checkInit(withPlugins(entry('a', 'builtin'), entry('mute', null)), ok)[0],
    /plugin "mute" is neither built in/,
  );
  // the configuration's own plugin is allowed from `plan` on
  const blip = withPlugins(entry('a', 'builtin'), entry('blip-ui', 'other'));
  assert.deepEqual(checkInit(blip, { config: 'plan', user }), []);
  assert.match(checkInit(blip, ok)[0], /plugin "blip-ui"/);
});

test('init check fails closed without origins or a plugin list', () => {
  const ok = { config: 'cli', user };
  // no plugin list in the event
  const none = checkInit(init({ plugins: undefined, pluginEntries: null }), ok);
  assert.equal(none.length, 1);
  assert.match(none[0], /no plugin list/);
  // plugins, none with an origin (old shape: bare names)
  const bare = checkInit(
    withPlugins(entry('cc-plugin-easel', null), entry('b', null)),
    ok,
  );
  assert.match(bare[0], /no plugin carries an origin/);
  assert.ok(bare.length > 1);
  // an empty list is a list: nothing loaded, nothing to judge
  assert.deepEqual(checkInit(withPlugins(), ok), []);
});

test("summariseInit keeps each plugin entry's origin", () => {
  const s = summariseInit({
    apiKeySource: 'none',
    plugins: [
      { name: 'a', path: 'builtin', source: 'a@builtin' },
      { name: 'b', path: '/x/b', source: 'b@market' },
      { name: 'c', source: 'c@builtin' },
      { name: 'd' },
      'e',
    ],
    skills: ['s'],
  });
  assert.deepEqual(s.plugins, ['a', 'b', 'c', 'd', 'e']);
  assert.deepEqual(
    s.pluginEntries.map(e => e.origin),
    ['builtin', 'other', 'builtin', null, null],
  );
  assert.equal(summariseInit({ apiKeySource: 'none' }).pluginEntries, null);
  // a user plugin named like a built-in one is its own entry
  assert.deepEqual(
    summariseInit({
      plugins: [{ name: 'p', path: '/home/u/p', source: 'p@user' }],
    }).pluginEntries,
    [{ name: 'p', origin: 'other' }],
  );
});

const loaded = (extra = {}) =>
  baselineOf({
    plugins: ['a', 'b'],
    skills: ['s2', 's1'],
    agents: ['x'],
    tools: ['Read'],
    mcpServers: [],
    ...extra,
  });
const label = (baseline = loaded()) => ({ claudeVersion: '2.1.329', baseline });
const judge = (record, now, accept = false) =>
  judgeBaseline(record, now, {
    accept,
    claudeVersion: '2.1.330',
    at: 'T',
    label: 'l',
  });

test('baselineOf sorts and dedupes', () => {
  assert.deepEqual(loaded().skills, ['s1', 's2']);
  assert.deepEqual(baselineOf({}).mcpServers, []);
});

test('baseline: the same set passes, in any order', () => {
  const r = judge(label(), loaded({ skills: ['s1', 's2'] }));
  assert.equal(r.stop, undefined);
  assert.equal(r.accepted, null);
});

test('baseline: a difference stops with added and removed per kind', () => {
  for (const [extra, expect] of [
    [
      { plugins: ['a', 'b', 'cc-plugin-easel'] },
      /plugins: added cc-plugin-easel/,
    ],
    [{ skills: ['s1'] }, /skills: removed s2/],
    [{ agents: ['y'] }, /agents: added y; removed x/],
    [{ tools: ['Read', 'Edit'] }, /tools: added Edit/],
    [{ mcpServers: ['m'] }, /mcpServers: added m/],
  ]) {
    const r = judge(label(), loaded(extra));
    assert.match(r.stop, expect);
    assert.match(r.stop, /--accept-baseline/);
    assert.equal(r.baseline, undefined);
  }
});

test('baseline: --accept-baseline continues and records old, new, version, time', () => {
  const was = loaded();
  const now = loaded({ plugins: ['a', 'b', 'c'] });
  const r = judge(label(was), now, true);
  assert.equal(r.stop, undefined);
  assert.deepEqual(r.baseline, now);
  assert.deepEqual(r.accepted, {
    at: 'T',
    claudeVersion: '2.1.330',
    from: was,
    to: now,
  });
  // nothing changed: the flag records nothing
  assert.equal(judge(label(was), was, true).accepted, null);
});

test('baseline: kinds an old label never recorded are not compared', () => {
  const old = { plugins: ['a', 'b'], skills: ['s1', 's2'], agents: ['x'] };
  assert.equal(judge(label(old), loaded()).stop, undefined);
  assert.equal(judge({ claudeVersion: '2.1.329' }, loaded()).stop, undefined);
});

test('usage-limit recognition', () => {
  assert.ok(
    isUsageLimit({
      type: 'result',
      is_error: true,
      result: "You've hit your limit · resets 3pm",
    }),
  );
  assert.ok(
    isUsageLimit({
      type: 'result',
      is_error: true,
      result: 'Claude AI usage limit reached|1700000000',
    }),
  );
  assert.ok(
    isUsageLimit({
      type: 'rate_limit_event',
      rate_limit_info: { status: 'rejected' },
    }),
  );
  assert.ok(
    !isUsageLimit({
      type: 'rate_limit_event',
      rate_limit_info: { status: 'allowed' },
    }),
  );
  assert.ok(
    !isUsageLimit({
      type: 'result',
      is_error: false,
      result: 'the usage limit is a topic',
    }),
  );
  assert.ok(
    !isUsageLimit({
      type: 'result',
      is_error: true,
      result: 'Execution error',
    }),
  );
});

test('what a rerun skips', () => {
  assert.ok(isDone({ status: 'done' }));
  assert.ok(isDone({ status: 'timeout' }));
  assert.ok(!isDone({ status: 'stopped', stoppedBy: 'usage-limit' }));
  assert.ok(!isDone({ status: 'failed' }, { retryFailed: true }));
  assert.ok(isDone({ status: 'failed' }));
  assert.ok(!isDone(null));
});

test('init check: tools and MCP servers', () => {
  const ok = { config: 'cli', user };
  const tools = [
    'Task',
    'Bash',
    'Edit',
    'Glob',
    'Grep',
    'Read',
    'Skill',
    'Write',
  ];
  assert.deepEqual(checkInit(init({ tools }), ok), []);
  assert.match(
    checkInit(init({ tools: [...tools, 'WebFetch'] }), ok)[0],
    /tools are/,
  );
  assert.match(
    checkInit(init({ tools, mcpServers: ['x'] }), ok)[0],
    /MCP servers/,
  );
});

test('the probe line is the first heading of the memory file', () => {
  assert.equal(probeLine('\n\n# Prefs\n\n- a\n'), '# Prefs');
  assert.equal(probeLine('just text\nmore'), 'just text');
  assert.equal(probeLine('  \n'), null);
});

test('childEnv is an allowlist: only listed names and LC_* pass', () => {
  const given = {
    ANTHROPIC_BASE_URL: 'u',
    CLAUDE_CONFIG_DIR: '/c',
    CLAUDECODE: '1',
    GITHUB_TOKEN: 't',
    AWS_SECRET_ACCESS_KEY: 's',
    NODE_PATH: '/other',
    PATH: '/usr/bin',
    HOME: '/home',
    USER: 'me',
    LC_ALL: 'C',
    HTTPS_PROXY: 'p',
    SOMETHING_ELSE: 'x',
  };
  const env = childEnv(given, { repo: '/repo', cwd: '/x' });
  assert.deepEqual(Object.keys(env).sort(), [
    'CLAUDE_CODE_DISABLE_AUTO_MEMORY',
    'HOME',
    'HTTPS_PROXY',
    'LC_ALL',
    'PATH',
    'PWD',
    'USER',
  ]);
  for (const name of Object.keys(env))
    if (!['CLAUDE_CODE_DISABLE_AUTO_MEMORY', 'PWD'].includes(name))
      assert.equal(env[name], given[name]);
});
