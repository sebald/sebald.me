import { docsCommand } from './commands/docs.ts';
import { indexCommand } from './commands/index.ts';
import { searchCommand } from './commands/search.ts';
import { loadDocs } from './docs-dir.ts';
import { type Io, parseArgs } from './io.ts';

/** Runs one `blip` call and returns its exit code */
export const run = (argv: readonly string[], io: Io): number => {
  const args = parseArgs(argv);
  if (args.error) {
    io.err(`${args.error}. blip --help lists the commands.`);
    return 2;
  }
  if (!io.docsDir) {
    io.err(
      'The docs are missing from this install: no docs/manifest.json next to the CLI.',
    );
    return 2;
  }
  let docs;
  try {
    docs = loadDocs(io.docsDir);
  } catch (error) {
    io.err(
      `The docs in ${io.docsDir} can't be read: ${(error as Error).message}`,
    );
    return 2;
  }
  if (args.help || args.command === undefined)
    return indexCommand(docs, args.json, io);
  if (args.command === 'search') return searchCommand(docs, args, io);
  if (args.command === 'docs') return docsCommand(docs, args, io);
  io.err(`Unknown command "${args.command}". blip --help lists the commands.`);
  return 2;
};
