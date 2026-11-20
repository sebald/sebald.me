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
} from './run-lib.mjs';

const baseline = { plugins: [], skills: ['simplify'], agents: ['Explore'] };
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
  const ok = { config: 'cli', baseline, user };
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
  assert.match(
    checkInit(init({ agents: ['other'] }), ok)[0],
    /not one the configuration/,
  );
  assert.match(
    checkInit(init({ plugins: ['blip-ui'] }), ok)[0],
    /plugin "blip-ui"/,
  );
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
