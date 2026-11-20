// Layer 1 of the collector, from a run's `transcript.jsonl` (Claude Code's
// `--output-format stream-json`): what the agent did, counted

const DIST = '@sebald/blip-ui/dist';
const DOCS = '@sebald/blip-ui/docs';

const WRITE_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

/** What `curl`, `wget`, `gh` and the like are called as a command's first word */
const NETWORK_TOOLS = new Set(['curl', 'wget', 'gh', 'http', 'https', 'fetch']);
const INSTALLERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);
const INSTALL_VERBS = new Set(['install', 'i', 'add']);
const VIEW_VERBS = new Set(['view', 'info', 'show', 'search']);

/** A tool result's content is a string or a list of text parts */
const text = content => {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map(part => (typeof part === 'string' ? part : (part?.text ?? '')))
    .join('\n');
};

/**
 * The commands of a shell line, each as its words: split at `&&`, `||`, `;`,
 * `|` and newlines outside quotes; a heredoc's body is left out. Quotes are
 * removed from words
 */
export const segments = command => {
  const out = [];
  let words = [];
  let word = null;
  let quote = null;
  let heredoc = null;
  const endWord = () => {
    if (word !== null) words.push(word);
    word = null;
  };
  const endCommand = () => {
    endWord();
    if (words.length) out.push(words);
    words = [];
  };
  for (const line of String(command).split('\n')) {
    if (heredoc) {
      if (line.trim() === heredoc) heredoc = null;
      continue;
    }
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quote) {
        if (c === quote) quote = null;
        else if (c === '\\' && quote === '"' && i + 1 < line.length)
          word += line[++i];
        else word += c;
      } else if (c === "'" || c === '"') {
        quote = c;
        word ??= '';
      } else if (c === '\\' && i + 1 < line.length) {
        word = (word ?? '') + line[++i];
      } else if (c === ';' || c === '|' || c === '&') {
        if (c === '&' && line[i + 1] === '&') i++;
        else if (c === '|' && line[i + 1] === '|') i++;
        endCommand();
      } else if (/\s/.test(c)) endWord();
      else word = (word ?? '') + c;
    }
    if (quote) word += '\n';
    else {
      const here = /<<-?\s*['"]?(\w+)['"]?/.exec(line);
      endCommand();
      if (here) heredoc = here[1];
    }
  }
  endCommand();
  return out;
};

/** `FOO=bar cmd` is `cmd` */
const withoutAssignments = tokens => {
  let i = 0;
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i++;
  return tokens.slice(i);
};

const base = token => token.split('/').at(-1);

/** Words that start another command: `timeout 5 curl`, `env X=1 curl`, `xargs curl` */
const WRAPPERS = new Set([
  'sudo',
  'env',
  'nohup',
  'time',
  'xargs',
  'command',
  'exec',
]);

/** The command a segment runs, without wrappers, and its arguments */
const unwrap = raw => {
  let tokens = withoutAssignments(raw);
  for (;;) {
    const first = base(tokens[0] ?? '');
    if (WRAPPERS.has(first)) {
      tokens = withoutAssignments(
        tokens.slice(1).filter(t => !t.startsWith('-')),
      );
    } else if (first === 'timeout') tokens = tokens.slice(2);
    else break;
  }
  return tokens;
};

/** `bash -c "…"` and `sh -c "…"` run a command line of their own */
const nested = tokens => {
  const shell = /^(?:ba|z|da)?sh$/.test(base(tokens[0] ?? ''));
  const at = tokens.indexOf('-c');
  return shell && at > 0 && tokens[at + 1] ? tokens[at + 1] : null;
};

const PREFIX = new Set([
  'pnpm',
  'exec',
  'npx',
  'bunx',
  'node',
  'dlx',
  'yarn',
  'npm',
]);

const SUBCOMMANDS = new Set(['search', 'docs', 'validate', 'index', 'help']);

/** The `blip` calls of a Bash command, each as its subcommand (`help` for none) */
export const blipCalls = command => {
  const calls = [];
  for (const raw of segments(command)) {
    const tokens = unwrap(raw);
    const inner = nested(tokens);
    if (inner) {
      calls.push(...blipCalls(inner));
      continue;
    }
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (base(token) === 'blip' || token.endsWith('blip-ui/dist/cli/bin.js')) {
        calls.push(tokens.slice(i + 1).find(t => SUBCOMMANDS.has(t)) ?? 'help');
        break;
      }
      const launcher =
        PREFIX.has(base(token)) ||
        token.startsWith('-') ||
        token === '@sebald/blip-ui';
      if (!launcher) break;
    }
  }
  return calls;
};

const LOCAL_BINS = /^(blip|tsc|vite|oxlint|oxfmt)$/;

/** The network-reaching commands of a Bash command */
export const networkCalls = command => {
  const found = [];
  for (const raw of segments(command)) {
    const tokens = unwrap(raw);
    const inner = nested(tokens);
    if (inner) {
      found.push(...networkCalls(inner));
      continue;
    }
    const first = base(tokens[0] ?? '');
    const second = tokens[1] ?? '';
    const names = tokens.slice(1).filter(t => !t.startsWith('-'));
    const code = tokens.join(' ');
    if (NETWORK_TOOLS.has(first)) found.push(first);
    else if (INSTALLERS.has(first) && VIEW_VERBS.has(second))
      found.push(`${first} ${second}`);
    // A bare `pnpm install` works from the lockfile; naming a package reaches out
    else if (INSTALLERS.has(first) && second === 'add')
      found.push(`${first} add`);
    else if (
      INSTALLERS.has(first) &&
      INSTALL_VERBS.has(second) &&
      tokens.slice(2).some(t => !t.startsWith('-'))
    ) {
      found.push(`${first} ${second}`);
    } else if (first === 'pnpm' && second === 'dlx') found.push('pnpm dlx');
    // `npx <package>` may download it; `npx blip` and `npx tsc` run what is installed
    else if (
      ['npx', 'bunx'].includes(first) &&
      names[0] &&
      !LOCAL_BINS.test(names[0]) &&
      !names[0].startsWith('@sebald/blip-ui')
    ) {
      found.push(first);
    } else if (
      ['node', 'python', 'python3', 'deno', 'bun'].includes(first) &&
      tokens.some(t => t === '-e' || t === '-c' || t === '--eval') &&
      /\bfetch\s*\(|https?:\/\/|urllib|requests\.|http\.client/.test(code)
    ) {
      found.push(`${first} (network code)`);
    } else if (
      first === 'git' &&
      ['clone', 'fetch', 'pull', 'push'].includes(second)
    ) {
      found.push(`git ${second}`);
    }
  }
  return found;
};

const SOURCE = /\.tsx?$/;

/**
 * Whether a Bash command writes a `.ts` or `.tsx` file: a `>` or `>>`
 * redirect (a heredoc is one), `tee`, `cp` or `mv` onto one, `sed -i` on one
 */
export const bashWritesSource = command => {
  for (const raw of segments(command)) {
    const tokens = unwrap(raw);
    const first = base(tokens[0] ?? '');
    for (let i = 0; i < tokens.length; i++) {
      const m = /^(?:\d*)>>?(?!&)(.*)$/.exec(tokens[i]);
      if (m && SOURCE.test(m[1] || tokens[i + 1] || '')) return true;
    }
    const args = tokens.slice(1).filter(t => !t.startsWith('-'));
    if (first === 'tee' && args.some(t => SOURCE.test(t))) return true;
    if (
      ['cp', 'mv', 'install'].includes(first) &&
      SOURCE.test(args.at(-1) ?? '')
    )
      return true;
    if (
      first === 'sed' &&
      tokens.some(t => /^-i|^--in-place/.test(t)) &&
      args.some(t => SOURCE.test(t))
    )
      return true;
    const inner = nested(tokens);
    if (inner && bashWritesSource(inner)) return true;
  }
  return false;
};

const filePathOf = input =>
  String(input?.file_path ?? input?.path ?? input?.notebook_path ?? '');

/** Which of Blip's shipped folders a tool call looks into */
const touches = (name, input) => {
  const where =
    name === 'Bash'
      ? String(input?.command ?? '')
      : [input?.file_path, input?.path, input?.pattern]
          .filter(Boolean)
          .join(' ');
  return { dist: where.includes(DIST), docs: where.includes(DOCS) };
};

const emptyUsage = () => ({
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheCreation: 0,
});

const addUsage = (to, usage) => {
  to.input += usage.input;
  to.output += usage.output;
  to.cacheRead += usage.cacheRead;
  to.cacheCreation += usage.cacheCreation;
};

const toUsage = u => ({
  input: u?.input_tokens ?? 0,
  output: u?.output_tokens ?? 0,
  cacheRead: u?.cache_read_input_tokens ?? 0,
  cacheCreation: u?.cache_creation_input_tokens ?? 0,
});

/** A message can arrive as several events, one per content block, each with its usage */
const larger = (a, b) => ({
  input: Math.max(a.input, b.input),
  output: Math.max(a.output, b.output),
  cacheRead: Math.max(a.cacheRead, b.cacheRead),
  cacheCreation: Math.max(a.cacheCreation, b.cacheCreation),
});

const sortedCounts = counts =>
  Object.fromEntries(
    Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1)),
  );

const round = (n, digits) =>
  typeof n === 'number' ? Number(n.toFixed(digits)) : null;

export const parseTranscript = source => {
  const events = [];
  let bad = 0;
  for (const line of source.split('\n')) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      bad++;
    }
  }
  return { events, bad };
};

export const analyseTranscript = source => {
  const { events, bad } = parseTranscript(source);

  const calls = [];
  const seenCalls = new Set();
  const results = new Map();
  const usageById = new Map();
  let result = null;

  for (const event of events) {
    if (event.type === 'assistant' && event.message) {
      const { id, content } = event.message;
      const subagent = event.parent_tool_use_id != null;
      if (id) {
        const usage = toUsage(event.message.usage);
        const known = usageById.get(id);
        usageById.set(id, {
          usage: known ? larger(known.usage, usage) : usage,
          subagent,
        });
      }
      for (const block of Array.isArray(content) ? content : []) {
        if (block?.type === 'tool_use' && !seenCalls.has(block.id)) {
          seenCalls.add(block.id);
          calls.push({
            id: block.id,
            name: block.name,
            input: block.input ?? {},
            subagent,
          });
        }
      }
    } else if (event.type === 'user' && Array.isArray(event.message?.content)) {
      for (const block of event.message.content) {
        if (block?.type === 'tool_result') {
          results.set(block.tool_use_id, {
            text: text(block.content),
            isError: block.is_error === true,
          });
        }
      }
    } else if (event.type === 'result') {
      result = event;
    }
  }

  const tools = {};
  const blip = {};
  const reads = { dist: 0, docs: 0 };
  const network = [];
  let tsErrors = 0;
  let firstLookup = -1;
  let firstTsxWrite = -1;

  calls.forEach((call, index) => {
    tools[call.name] = (tools[call.name] ?? 0) + 1;
    const where = touches(call.name, call.input);
    if (where.dist) reads.dist++;
    if (where.docs) reads.docs++;
    let lookup = where.dist || where.docs;
    if (call.name === 'Bash') {
      const command = String(call.input.command ?? '');
      for (const sub of blipCalls(command)) {
        blip[sub] = (blip[sub] ?? 0) + 1;
        if (sub !== 'validate') lookup = true;
      }
      for (const tool of networkCalls(command)) {
        network.push({
          tool,
          command: command.length > 160 ? `${command.slice(0, 160)}…` : command,
        });
      }
      const output = results.get(call.id)?.text ?? '';
      tsErrors += output.match(/\berror TS\d+/g)?.length ?? 0;
    } else if (call.name === 'WebFetch' || call.name === 'WebSearch') {
      network.push({
        tool: call.name,
        command: String(call.input.url ?? call.input.query ?? ''),
      });
    }
    if (lookup) {
      if (firstLookup < 0) firstLookup = index;
    }
    if (
      firstTsxWrite < 0 &&
      ((WRITE_TOOLS.has(call.name) && SOURCE.test(filePathOf(call.input))) ||
        (call.name === 'Bash' &&
          bashWritesSource(String(call.input.command ?? ''))))
    ) {
      firstTsxWrite = index;
    }
  });

  const main = emptyUsage();
  const subagents = emptyUsage();
  let subagentMessages = 0;
  let mainMessages = 0;
  for (const { usage, subagent } of usageById.values()) {
    addUsage(subagent ? subagents : main, usage);
    if (subagent) subagentMessages++;
    else mainMessages++;
  }

  const total = result?.usage ? toUsage(result.usage) : main;
  const resultText = text(result?.result ?? '');
  const usageLimit =
    result?.is_error === true &&
    /usage limit|limit reached|rate limit/i.test(resultText);
  const overBudget = result?.subtype === 'error_max_budget_usd';

  let status = 'complete';
  let reason = null;
  if (!result) {
    status = 'incomplete';
    reason = 'no result event';
  } else if (usageLimit) {
    status = 'incomplete';
    reason = 'usage limit';
  }

  return {
    status,
    reason,
    overBudget,
    failed: result?.is_error === true && !overBudget && !usageLimit,
    badLines: bad,
    toolCalls: { total: calls.length, byTool: sortedCounts(tools) },
    blipCalls: {
      total: Object.values(blip).reduce((a, b) => a + b, 0),
      byCommand: sortedCounts(blip),
    },
    reads,
    lookupBeforeFirstTsxWrite:
      firstTsxWrite < 0
        ? null
        : firstLookup >= 0 && firstLookup < firstTsxWrite,
    tsErrors,
    turns: result?.num_turns ?? mainMessages,
    tokens: {
      input: total.input,
      output: total.output,
      cacheRead: total.cacheRead,
      cacheCreation: total.cacheCreation,
    },
    subagents: {
      messages: subagentMessages,
      tokens: {
        input: subagents.input,
        output: subagents.output,
        cacheRead: subagents.cacheRead,
        cacheCreation: subagents.cacheCreation,
      },
    },
    costUsd: round(result?.total_cost_usd, 4),
    wallSeconds: round(
      typeof result?.duration_ms === 'number'
        ? result.duration_ms / 1000
        : null,
      1,
    ),
    denials: Array.isArray(result?.permission_denials)
      ? result.permission_denials.length
      : 0,
    network,
  };
};
