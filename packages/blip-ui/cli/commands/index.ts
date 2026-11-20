import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io } from '../io.ts';
import { oneLine } from '../search.ts';

export const COMMANDS = [
  ['blip', 'this index'],
  ['blip search <words…> [--limit n]', 'find pages and exports'],
  [
    'blip docs <page | export> [--section <name>]',
    'print a page (or one section, such as props) as markdown',
  ],
] as const;

const KINDS = [
  ['component', 'Components'],
  ['foundation', 'Foundations'],
  ['pattern', 'Patterns'],
] as const;

export const indexCommand = (docs: Docs, json: boolean, io: Io) => {
  recordEvent(io.cwd, io.env, {
    event: 'lookup',
    command: 'index',
    arguments: [],
    results: docs.manifest.pages.map(page => page.id),
  });
  if (json) {
    io.out(
      JSON.stringify({
        commands: COMMANDS.map(([usage, does]) => ({ usage, does })),
        pages: docs.manifest.pages.map(({ id, kind, title, summary }) => ({
          id,
          kind,
          title,
          summary,
        })),
      }),
    );
    return 0;
  }
  const lines = ['Blip UI: look up its docs before building with it', ''];
  lines.push('Commands');
  const width = Math.max(...COMMANDS.map(([usage]) => usage.length));
  for (const [usage, does] of COMMANDS) {
    lines.push(`  ${usage.padEnd(width)}  ${does}`);
  }
  const idWidth = Math.max(...docs.manifest.pages.map(page => page.id.length));
  for (const [kind, heading] of KINDS) {
    const pages = docs.manifest.pages.filter(page => page.kind === kind);
    if (pages.length === 0) continue;
    lines.push(
      '',
      `${heading} (${pages.length}), open one with blip docs <id>`,
    );
    for (const page of pages) {
      lines.push(`  ${page.id.padEnd(idWidth)}  ${oneLine(page.summary, 80)}`);
    }
  }
  io.out(lines.join('\n'));
  return 0;
};
