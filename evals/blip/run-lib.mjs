// Pure helpers of run.mjs: nothing here touches the disk, the network or a child
// process, so `node --test evals/blip` covers them.

export const TOOLS = 'Bash,Read,Write,Edit,Glob,Grep,Skill,Agent';

// Configurations (spec 3.4). `built: false` ones stop with "not built yet".
export const CONFIGS = {
  'no-cli': { built: true, cli: false, plugin: null },
  cli: { built: true, cli: true, plugin: null },
  plan: { built: false, cli: true, plugin: 'plan' },
  hook: { built: false, cli: true, plugin: 'hook' },
  reviewer: { built: false, cli: true, plugin: 'reviewer' },
  full: { built: false, cli: true, plugin: 'full' },
};

// The probe asks about a line of the user's own global memory file, read at
// run time, so it means something on any machine.
export const canaryPrompt = line =>
  `Is there text starting with ${JSON.stringify(line)} anywhere in your context? ` +
  'Answer with exactly LEAK:yes or LEAK:no.';

export const probeLine = text => {
  const lines = String(text)
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const line = lines.find(l => l.startsWith('#')) ?? lines[0];
  return line ? line.slice(0, 80) : null;
};

// The project's CLAUDE.md (Q10): the same paragraph in every configuration,
// one more line from `cli` on.
export const claudeMd = config => {
  const lines = [
    '# Ford',
    '',
    'Ford is a small 2D adventure game. Its UI is built with `@sebald/blip-ui`.',
    '',
    '## Commands',
    '',
    '- `pnpm typecheck` and `pnpm build` check your work. Do not start the dev server.',
    '',
    '## Screens',
    '',
    '`?screen=<name>&state=<fixture>` opens a screen from `src/screens/index.ts` on a game state from `src/game/data.ts` (`FIXTURES`). `?screen=camp&state=start` is the default.',
  ];
  if (CONFIGS[config].cli) {
    lines.push('', "Blip UI's docs, examples and rules: `pnpm exec blip`");
  }
  return lines.join('\n') + '\n';
};

// The project's settings: the permissions, and the user's global memory
// kept out. `--setting-sources project` alone does not do that on Claude Code
// 2.1.329 (Q7: the canary caught it), `claudeMdExcludes` does. The home
// directory is only known at run time, so this file is written per run and
// never committed.
export const excludes = home => [
  `${home}/.claude/CLAUDE.md`,
  `${home}/.claude/rules/**`,
  `${home}/CLAUDE.md`,
  `${home}/.cache/CLAUDE.md`,
];

export const settingsJson = ({ home, permissions = true }) =>
  JSON.stringify(
    {
      ...(permissions ? { permissions: { allow: TOOLS.split(',') } } : {}),
      claudeMdExcludes: excludes(home),
    },
    null,
    2,
  ) + '\n';

// The child's environment is an allowlist: only what a process needs to run,
// find the user's login and reach the network. Everything else is dropped:
// API keys and tokens of any kind (a run uses the logged-in subscription,
// Q13), `ANTHROPIC_*`, `CLAUDE_*`, `GITHUB_TOKEN`, `AWS_*`, `NODE_PATH`, the
// `npm_*` and `PNPM_*` variables `pnpm eval:blip` adds, `INIT_CWD`, `OLDPWD`.
// The login is found through HOME and USER (the macOS keychain and
// ~/.claude), so those stay. `PWD` is set to where the child runs, auto memory
// is off (Q7), and this repo's own entries are taken off PATH.
export const ENV_ALLOW = [
  'PATH',
  'HOME',
  'USER',
  'LOGNAME',
  'SHELL',
  'LANG',
  'TERM',
  'TZ',
  'TMPDIR',
  '__CF_USER_TEXT_ENCODING',
  'XDG_CONFIG_HOME',
  'XDG_CACHE_HOME',
  'XDG_DATA_HOME',
  'XDG_STATE_HOME',
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'NO_PROXY',
  'http_proxy',
  'https_proxy',
  'no_proxy',
  'SSL_CERT_FILE',
  'NODE_EXTRA_CA_CERTS',
];

export const childEnv = (env, { repo, cwd }) => {
  const out = {};
  for (const [key, value] of Object.entries(env))
    if (ENV_ALLOW.includes(key) || key.startsWith('LC_')) out[key] = value;
  out.CLAUDE_CODE_DISABLE_AUTO_MEMORY = '1';
  if (out.PATH)
    out.PATH = out.PATH.split(':')
      .filter(dir => dir !== repo && !dir.startsWith(`${repo}/`))
      .join(':');
  if (cwd) out.PWD = cwd;
  return out;
};

// The command line (spec 3.3 step 4). The prompt goes in on stdin: the tool
// flags take lists, so a trailing positional would be swallowed by them.
export const claudeArgs = ({ model, budget, plugins = [], tools = TOOLS }) => {
  const args = [
    '-p',
    '--output-format',
    'stream-json',
    '--verbose',
    '--setting-sources',
    'project',
    '--strict-mcp-config',
    '--permission-mode',
    'acceptEdits',
    '--tools',
    tools,
    '--allowedTools',
    tools,
    '--max-budget-usd',
    String(budget),
    '--include-hook-events',
  ];
  if (model) args.push('--model', model);
  for (const dir of plugins) args.push('--plugin-dir', dir);
  return args;
};

export const canaryArgs = ({ model }) => [
  '-p',
  '--output-format',
  'stream-json',
  '--verbose',
  '--setting-sources',
  'project',
  '--strict-mcp-config',
  '--tools',
  '',
  '--model',
  model,
];

const names = list =>
  (list ?? []).map(x => (typeof x === 'string' ? x : (x?.name ?? '')));

export const parseLine = line => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};

// What `init` says was loaded, reduced to names.
export const summariseInit = event => ({
  apiKeySource: event.apiKeySource ?? null,
  model: event.model ?? null,
  plugins: names(event.plugins),
  skills: names(event.skills),
  agents: names(event.agents),
  tools: names(event.tools),
  mcpServers: names(event.mcp_servers),
});

// The init check (spec 3.3 step 5). `baseline` is what the canary's init
// listed (Claude Code's own plugins, skills and agents, the same everywhere);
// `user` is what lives in ~/.claude. Returns the problems, empty when fine.
export const checkInit = (init, { config, baseline, user }) => {
  const problems = [];
  if (init.apiKeySource !== 'none')
    problems.push(
      `apiKeySource is ${JSON.stringify(init.apiKeySource)}, not "none"`,
    );
  const plugin = CONFIGS[config].plugin ? 'blip-ui' : null;
  // `Agent` is listed as `Task` in the init event
  const want = TOOLS.split(',').map(t => (t === 'Agent' ? 'Task' : t));
  if (init.tools && [...init.tools].sort().join() !== [...want].sort().join())
    problems.push(`tools are ${init.tools.join(',')}, not ${want.join(',')}`);
  if (init.mcpServers?.length)
    problems.push(`MCP servers loaded: ${init.mcpServers.join(',')}`);
  for (const [kind, loaded] of [
    ['plugin', init.plugins],
    ['skill', init.skills],
    ['agent', init.agents],
  ]) {
    const allowed = new Set(baseline[`${kind}s`] ?? []);
    for (const name of loaded) {
      if (
        [...(user[`${kind}s`] ?? []), ...(user.plugins ?? [])].some(
          u => name === u || name.startsWith(`${u}:`),
        )
      )
        problems.push(`${kind} "${name}" comes from ~/.claude`);
      else if (
        !allowed.has(name) &&
        !(plugin && (name === plugin || name.startsWith(`${plugin}:`)))
      )
        problems.push(
          `${kind} "${name}" is not one the configuration should load`,
        );
    }
  }
  return problems;
};

// The usage-limit error, wherever it shows: a result event that is an error
// saying so, or a rate-limit event that was rejected. The exact text is
// unconfirmed (Q13: "checked in the pilot"), so the match is on wording that
// the message has used.
const LIMIT =
  /usage limit|hit your limit|limit reached|out of extra usage|limit will reset/i;
export const isUsageLimit = event => {
  if (!event) return false;
  if (event.type === 'result' && event.is_error)
    return LIMIT.test(String(event.result ?? ''));
  if (event.type === 'rate_limit_event')
    return event.rate_limit_info?.status === 'rejected';
  return false;
};

export const summariseResult = event =>
  event
    ? {
        subtype: event.subtype ?? null,
        isError: Boolean(event.is_error),
        costUsd: event.total_cost_usd ?? null,
        turns: event.num_turns ?? null,
        apiMs: event.duration_api_ms ?? null,
        usage: event.usage ?? null,
        text: event.is_error
          ? String(event.result ?? '').slice(0, 300)
          : undefined,
      }
    : null;

// A run's state from its meta.json: does a rerun skip it, or redo it?
export const isDone = (meta, { retryFailed = false } = {}) => {
  if (!meta || meta.stoppedBy === 'usage-limit') return false;
  if (meta.status === 'failed') return !retryFailed;
  return ['done', 'timeout'].includes(meta.status);
};

export const runName = (task, rep) => `${task}-${rep}`;

export const parseList = (value, all) =>
  value
    ? value
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : all;
