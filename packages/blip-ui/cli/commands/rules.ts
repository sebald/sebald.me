import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io, Parsed } from '../io.ts';
import { flags, isOpen, sortRules } from '../rules.ts';
import { closestPage } from '../search.ts';

export const rulesCommand = (docs: Docs, args: Parsed, io: Io) => {
  if (args.positionals.length > 1) {
    io.err('blip rules takes at most one page: blip rules [<page>]');
    return 2;
  }
  const name = args.positionals[0]?.toLowerCase();
  if (
    name !== undefined &&
    !docs.manifest.pages.some(page => page.id === name)
  ) {
    // The correctness rules have a sidecar and no page
    if (!docs.rules.some(rule => rule.page === name)) {
      const closest = closestPage(name, docs.pages, docs.exports);
      const hint = closest
        ? ` The closest page is ${closest}: blip rules ${closest}`
        : '';
      recordEvent(io.cwd, io.env, {
        event: 'lookup',
        command: 'rules',
        arguments: args.positionals,
        results: [],
      });
      if (args.json)
        io.out(JSON.stringify({ error: `No page "${name}"`, closest }));
      else io.err(`No page "${name}".${hint}`);
      return 2;
    }
  }

  const rules = docs.rules
    .filter(rule => name === undefined || rule.page === name)
    .filter(rule => args.kind === null || rule.kind === args.kind)
    .filter(rule => args.open || !isOpen(rule));
  const listed = name === undefined ? rules : sortRules(rules);
  recordEvent(io.cwd, io.env, {
    event: 'lookup',
    command: 'rules',
    arguments: args.positionals,
    results: listed.map(rule => rule.id),
  });

  if (args.json) {
    io.out(
      JSON.stringify({
        rules: listed.map(({ id, kind, page, text, severity, markers }) => ({
          id,
          kind,
          page,
          text,
          severity,
          markers,
        })),
      }),
    );
    return 0;
  }
  if (listed.length === 0) {
    io.out(
      name === undefined
        ? 'No rules match.'
        : `No rules on the ${name} page${args.kind ? ` of kind ${args.kind}` : ''} yet.`,
    );
    return 0;
  }
  const width = Math.max(...listed.map(rule => rule.id.length));
  io.out(
    listed
      .map(rule => {
        const marked = flags(rule);
        return `${rule.id.padEnd(width)}  ${rule.text}${marked ? ` ${marked}` : ''}`;
      })
      .join('\n'),
  );
  return 0;
};
