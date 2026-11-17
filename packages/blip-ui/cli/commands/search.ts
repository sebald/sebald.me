import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io, Parsed } from '../io.ts';
import { search } from '../search.ts';

export const searchCommand = (docs: Docs, args: Parsed, io: Io) => {
  const query = args.positionals.join(' ');
  if (!query.trim()) {
    io.err('blip search needs words to look for: blip search <words…>');
    return 2;
  }
  const hits = search(query, docs.pages, docs.exports, args.limit ?? 8);
  recordEvent(io.cwd, io.env, {
    event: 'lookup',
    command: 'search',
    arguments: args.positionals,
    results: hits.map(hit => hit.id),
  });
  if (args.json) {
    io.out(JSON.stringify({ query, hits }));
    return 0;
  }
  if (hits.length === 0) {
    io.out(
      `Nothing matches "${query}". Try other words, or blip for the list of pages.`,
    );
    return 0;
  }
  const idWidth = Math.max(...hits.map(hit => hit.id.length));
  const kindWidth = Math.max(...hits.map(hit => hit.kind.length));
  io.out(
    hits
      .map(
        hit =>
          `${hit.id.padEnd(idWidth)}  ${hit.kind.padEnd(kindWidth)}  ${hit.line}\n${' '.repeat(idWidth + 2)}→ ${hit.command}`,
      )
      .join('\n'),
  );
  return 0;
};
