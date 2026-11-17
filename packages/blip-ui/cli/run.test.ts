import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { run } from './run.ts';

/** A docs folder of two pages and a working directory, in a temp folder */
const setup = () => {
  const root = mkdtempSync(join(tmpdir(), 'blip-cli-'));
  const docsDir = join(root, 'docs');
  mkdirSync(join(docsDir, 'pages'), { recursive: true });
  const pages = [
    ['confirm', 'Confirm', 'Asks before something is erased.'],
    ['dialog', 'Dialog', 'A window over the stage.'],
  ] as const;
  for (const [id, title, summary] of pages) {
    writeFileSync(
      join(docsDir, 'pages', `${id}.md`),
      `# ${title}\n\n${summary}\n`,
    );
  }
  writeFileSync(
    join(docsDir, 'manifest.json'),
    JSON.stringify({
      version: '0.0.0',
      pages: pages.map(([id, title, summary]) => ({
        id,
        kind: 'component',
        title,
        summary,
        file: `pages/${id}.md`,
        exports: [title],
        rules: [],
        examples: [],
      })),
      exports: {
        Confirm: { page: 'confirm', kind: 'component' },
        Dialog: { page: 'dialog', kind: 'component' },
      },
      examples: [],
    }),
  );
  const cwd = join(root, 'project');
  mkdirSync(cwd);
  return { docsDir, cwd };
};

const call = (argv: string[], env: Record<string, string> = {}) => {
  const { docsDir, cwd } = setup();
  const out: string[] = [];
  const err: string[] = [];
  const code = run(argv, {
    docsDir,
    cwd,
    env,
    out: text => out.push(text),
    err: text => err.push(text),
  });
  return { code, out: out.join('\n'), err: err.join('\n'), cwd };
};

const events = (cwd: string) =>
  readFileSync(join(cwd, '.blip', 'events.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map(line => JSON.parse(line) as Record<string, unknown>);

describe('run', () => {
  it('lists the commands and the pages with no arguments', () => {
    const { code, out } = call([]);
    assert.equal(code, 0);
    assert.match(out, /blip search/);
    assert.match(out, /confirm {2}Asks before something is erased\./);
  });

  it('prints a page by id or by export name', () => {
    assert.equal(
      call(['docs', 'dialog']).out,
      '# Dialog\n\nA window over the stage.',
    );
    assert.equal(call(['docs', 'Dialog']).out, call(['docs', 'dialog']).out);
  });

  it('exits 2 for an unknown page and names the closest', () => {
    const { code, err } = call(['docs', 'dialgo']);
    assert.equal(code, 2);
    assert.match(err, /closest page is dialog/);
  });

  it('puts the best match first, and says so when there is none, exiting 0', () => {
    const found = call(['search', 'confirm', 'before', 'deleting']);
    assert.equal(found.code, 0);
    assert.match(found.out.split('\n')[0]!, /^confirm /);
    const none = call(['search', 'zzzz']);
    assert.equal(none.code, 0);
    assert.match(none.out, /Nothing matches "zzzz"/);
  });

  it('answers in JSON with --json', () => {
    const hits = JSON.parse(call(['search', 'dialog', '--json']).out) as {
      hits: { id: string }[];
    };
    assert.equal(hits.hits[0]!.id, 'dialog');
  });

  it('exits 2 for a usage error', () => {
    assert.equal(call(['nope']).code, 2);
    assert.equal(call(['search']).code, 2);
    assert.equal(call(['search', 'x', '--limit', 'many']).code, 2);
    assert.equal(call(['docs', 'a', 'b']).code, 2);
  });

  it('appends a lookup event per call', () => {
    const { cwd } = call(['search', 'confirm']);
    const [event] = events(cwd);
    assert.equal(event!.event, 'lookup');
    assert.equal(event!.command, 'search');
    assert.deepEqual(event!.arguments, ['confirm']);
  });

  it('writes nothing, not even the folder, with BLIP_EVENTS=off', () => {
    for (const argv of [
      [],
      ['search', 'confirm'],
      ['docs', 'dialog'],
      ['docs', 'nope'],
    ]) {
      const { cwd } = call(argv, { BLIP_EVENTS: 'off' });
      assert.equal(existsSync(join(cwd, '.blip')), false, argv.join(' '));
    }
  });
});
