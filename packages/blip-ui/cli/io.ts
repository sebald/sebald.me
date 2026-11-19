export interface Io {
  /** The package's `docs/`, null when it is missing */
  docsDir: string | null;
  cwd: string;
  env: Record<string, string | undefined>;
  out: (text: string) => void;
  err: (text: string) => void;
}

export interface Parsed {
  command: string | undefined;
  positionals: string[];
  json: boolean;
  limit: number | null;
  help: boolean;
  /** A usage error in the flags */
  error?: string;
}

export const parseArgs = (argv: readonly string[]): Parsed => {
  const parsed: Parsed = {
    command: undefined,
    positionals: [],
    json: false,
    limit: null,
    help: false,
  };
  const rest: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === '--json') parsed.json = true;
    else if (arg === '--help' || arg === '-h') parsed.help = true;
    else if (arg === '--limit' || arg.startsWith('--limit=')) {
      const value = arg.includes('=') ? arg.split('=')[1] : argv[++i];
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1) {
        parsed.error = '--limit takes a whole number, 1 or more';
      } else parsed.limit = n;
    } else if (arg.startsWith('--')) parsed.error = `Unknown flag ${arg}`;
    else rest.push(arg);
  }
  [parsed.command, ...parsed.positionals] = rest;
  return parsed;
};
