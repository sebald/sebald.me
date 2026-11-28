import type { ManifestExample } from '../build/manifest.ts';
import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io, Parsed } from '../io.ts';
import { closestPage, distance, oneLine } from '../search.ts';

/** The list as aligned lines: id, what it shows, the command that prints it */
const list = (examples: readonly ManifestExample[]) => {
  const width = Math.max(...examples.map(example => example.id.length));
  return examples
    .map(
      example =>
        `${example.id.padEnd(width)}  ${oneLine(example.summary || example.title)}\n${' '.repeat(width + 2)}→ blip examples ${example.id}`,
    )
    .join('\n');
};

/** The example id nearest to a name that is none, within a plausible edit distance */
const closestExample = (name: string, examples: readonly ManifestExample[]) => {
  let best: { id: string; cost: number } | null = null;
  for (const { id } of examples) {
    const cost = distance(name.toLowerCase(), id);
    if (!best || cost < best.cost) best = { id, cost };
  }
  return best && best.cost <= Math.max(3, name.length / 3) ? best.id : null;
};

export const examplesCommand = (docs: Docs, args: Parsed, io: Io) => {
  const name = args.positionals[0];
  if (args.positionals.length > 1) {
    io.err(
      'blip examples takes one page or example: blip examples [<page> | <id>]',
    );
    return 2;
  }
  const record = (results: string[]) =>
    recordEvent(io.cwd, io.env, {
      event: 'lookup',
      command: 'examples',
      arguments: args.positionals,
      results,
    });
  const show = (examples: readonly ManifestExample[], empty: string) => {
    if (args.json) {
      io.out(JSON.stringify({ examples }));
    } else if (examples.length === 0) io.out(empty);
    else io.out(list(examples));
  };

  if (!name) {
    record(docs.examples.map(example => example.id));
    show(docs.examples, 'This install has no examples.');
    return 0;
  }

  const wanted = name.toLowerCase();
  const one = docs.examples.find(example => example.id === wanted);
  if (one) {
    record([one.id]);
    const source = docs.source(one);
    io.out(
      args.json
        ? JSON.stringify({ id: one.id, page: one.page, source })
        : source.trimEnd(),
    );
    return 0;
  }

  const page =
    docs.manifest.pages.find(page => page.id === wanted)?.id ??
    docs.exports.find(entry => entry.name.toLowerCase() === wanted)?.page ??
    null;
  if (page) {
    const examples = docs.examples.filter(example => example.page === page);
    record(examples.map(example => example.id));
    show(examples, `The ${page} page has no examples.`);
    return 0;
  }

  record([]);
  const closest =
    closestExample(name, docs.examples) ??
    closestPage(name, docs.pages, docs.exports);
  const hint = closest
    ? ` The closest is ${closest}: blip examples ${closest}`
    : '';
  if (args.json)
    io.out(JSON.stringify({ error: `No page or example "${name}"`, closest }));
  else io.err(`No page or example "${name}".${hint}`);
  return 2;
};
