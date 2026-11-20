import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io, Parsed } from '../io.ts';
import { closestPage } from '../search.ts';
import { sectionNames, sectionOf } from '../section.ts';

export const docsCommand = (docs: Docs, args: Parsed, io: Io) => {
  const name = args.positionals[0];
  if (!name || args.positionals.length > 1) {
    io.err(
      'blip docs takes one page or export: blip docs <page | export> [--section <name>]',
    );
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
    const whole = docs.markdown(page);
    const section = args.section;
    const markdown = section ? sectionOf(whole, section) : whole;
    if (markdown === null) {
      const names = sectionNames(whole);
      const message = `The ${page} page has no "${section}" section. Its sections: ${names.join(', ') || 'none'}.`;
      if (args.json)
        io.out(JSON.stringify({ error: message, sections: names }));
      else io.err(message);
      return 2;
    }
    io.out(
      args.json
        ? JSON.stringify({
            id: page,
            ...(section ? { section } : {}),
            markdown,
          })
        : markdown.trimEnd(),
    );
    return 0;
  }
  const bare = docs.exports.some(entry => entry.name.toLowerCase() === wanted);
  if (bare) {
    const message = `"${name}" is exported, but documented on no page.`;
    if (args.json) io.out(JSON.stringify({ error: message, closest: null }));
    else io.err(message);
    return 2;
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
