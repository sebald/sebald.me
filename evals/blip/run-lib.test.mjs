import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CONFIGS,
  checkInit,
  childEnv,
  claudeArgs,
  claudeMd,
  isDone,
  isUsageLimit,
  probeLine,
  summariseInit,
} from './run-lib.mjs';

const user = { plugins: ['productivity'], skills: ['brain'], agents: ['mine'] };
const init = (extra = {}) => ({
  apiKeySource: 'none',
  plugins: [],
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

test('init check: plugins with an origin (the init event) and without', () => {
  const ok = { config: 'cli', user };
  const event = {
    ...init(),
    plugins: ['cc-plugin-easel', 'productivity', 'stray'],
    builtinPlugins: ['cc-plugin-easel'],
  };
  // a sixth built-in plugin is fine; a user plugin and a stray one are not
  assert.deepEqual(
    checkInit({ ...event, plugins: ['cc-plugin-easel'] }, ok),
    [],
  );
  const problems = checkInit(event, ok);
  assert.equal(problems.length, 2);
  assert.match(problems[0], /plugin "productivity" comes from ~\/\.claude/);
  assert.match(problems[1], /plugin "stray" is neither built in/);
  // a user plugin is refused even when the event calls it built in's neighbour
  assert.match(
    checkInit(init({ plugins: ['productivity'] }), ok)[0],
    /from ~\/\.claude/,
  );
  // without origins (names only) a new plugin passes unless it is the user's
  assert.deepEqual(checkInit(init({ plugins: ['cc-plugin-easel'] }), ok), []);
  // the configuration's own plugin is allowed from `plan` on
  assert.deepEqual(
    checkInit(
      { ...event, plugins: ['blip-ui'], builtinPlugins: [] },
      { config: 'plan', user },
    ),
    [],
  );
  assert.match(
    checkInit(
      { ...event, plugins: ['blip-ui'], builtinPlugins: [] },
      { config: 'cli', user },
    )[0],
    /plugin "blip-ui"/,
  );
});

test('summariseInit tells built-in plugins from the rest', () => {
  const s = summariseInit({
    apiKeySource: 'none',
    plugins: [
      { name: 'a', path: 'builtin', source: 'a@builtin' },
      { name: 'b', path: '/x/b', source: 'b@market' },
      { name: 'c', source: 'c@builtin' },
    ],
    skills: ['s'],
  });
  assert.deepEqual(s.plugins, ['a', 'b', 'c']);
  assert.deepEqual(s.builtinPlugins, ['a', 'c']);
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
