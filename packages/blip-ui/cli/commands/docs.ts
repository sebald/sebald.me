import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io, Parsed } from '../io.ts';
import { closestPage } from '../search.ts';

export const docsCommand = (docs: Docs, args: Parsed, io: Io) => {
  const name = args.positionals[0];
  if (!name || args.positionals.length > 1) {
    io.err('blip docs takes one page or export: blip docs <page | export>');
    return 2;
  }
  const wanted = name.toLowerCase();
  const page =
    docs.manifest.pages.find(page => page.id === wanted)?.id ??
    docs.exports.find(entry => entry.name.toLowerCase() === wanted)?.page ??
    null;
  recordEvent(io.cwd, io.env, {
    event: 'lookup',
    command: 'docs',
    arguments: [name],
    results: page ? [page] : [],
  });
  if (page) {
    const markdown = docs.markdown(page);
    io.out(
      args.json ? JSON.stringify({ id: page, markdown }) : markdown.trimEnd(),
    );
    return 0;
  }
  const closest = closestPage(name, docs.pages, docs.exports);
  const hint = closest
    ? ` The closest page is ${closest}: blip docs ${closest}`
    : '';
  if (args.json)
    io.out(JSON.stringify({ error: `No page or export "${name}"`, closest }));
  else io.err(`No page or export "${name}".${hint}`);
  return 2;
};
