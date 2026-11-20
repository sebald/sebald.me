import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { run } from './run.ts';
import { search } from './search.ts';

const EXAMPLES = [
  ['dialog/options', 'Options', 'A dialog over a menu.'],
  ['dialog/wide', 'Wide', 'The large dialog.'],
  ['menu-screen/pick-a-role', 'Pick a role', 'A whole menu screen.'],
] as const;

/** Three pages, three examples, and a working directory */
const call = (argv: string[]) => {
  const root = mkdtempSync(join(tmpdir(), 'blip-examples-'));
  const docsDir = join(root, 'docs');
  mkdirSync(join(docsDir, 'pages'), { recursive: true });
  const pages = [
    ['dialog', 'component', 'Dialog', 'A window over the stage.'],
    ['confirm', 'component', 'Confirm', 'Asks before something is erased.'],
    ['menu-screen', 'pattern', 'Menu screen', 'A screen that asks to choose.'],
  ] as const;
  for (const [id, , title, summary] of pages) {
    writeFileSync(
      join(docsDir, 'pages', `${id}.md`),
      `# ${title}\n\n${summary}\n`,
    );
  }
  for (const [id] of EXAMPLES) {
    mkdirSync(join(docsDir, 'examples', id.split('/')[0]!), {
      recursive: true,
    });
    writeFileSync(join(docsDir, 'examples', `${id}.tsx`), `// ${id}\n`);
  }
  writeFileSync(
    join(docsDir, 'manifest.json'),
    JSON.stringify({
      version: '0.0.0',
      pages: pages.map(([id, kind, title, summary]) => ({
        id,
        kind,
        title,
        summary,
        file: `pages/${id}.md`,
        exports: [],
        rules: [],
        examples: EXAMPLES.filter(([e]) => e.startsWith(`${id}/`)).map(
          ([e]) => e,
        ),
      })),
      exports: {},
      examples: EXAMPLES.map(([id, title, summary]) => ({
        id,
        page: id.split('/')[0],
        title,
        summary,
        file: `examples/${id}.tsx`,
      })),
    }),
  );
  const out: string[] = [];
  const err: string[] = [];
  const code = run(argv, {
    docsDir,
    cwd: join(root, 'project'),
    env: { BLIP_EVENTS: 'off' },
    out: text => out.push(text),
    err: text => err.push(text),
  });
  return { code, out: out.join('\n'), err: err.join('\n') };
};

describe('blip examples', () => {
  it('lists a page’s examples, and all of them with no argument', () => {
    const page = call(['examples', 'dialog']);
    assert.equal(page.code, 0);
    assert.match(page.out, /^dialog\/options {2}A dialog over a menu\./);
    assert.match(page.out, /→ blip examples dialog\/wide/);
    assert.doesNotMatch(page.out, /menu-screen/);
    assert.match(call(['examples']).out, /menu-screen\/pick-a-role/);
  });

  it('prints one example’s source', () => {
    const one = call(['examples', 'dialog/options']);
    assert.equal(one.code, 0);
    assert.equal(one.out, '// dialog/options');
    const json = JSON.parse(call(['examples', 'dialog/options', '--json']).out);
    assert.deepEqual(json, {
      id: 'dialog/options',
      page: 'dialog',
      source: '// dialog/options\n',
    });
  });

  it('says so for a page without examples, and exits 2 for an unknown name', () => {
    const none = call(['examples', 'confirm']);
    assert.equal(none.code, 0);
    assert.match(none.out, /confirm page has no examples/);
    const wrong = call(['examples', 'dialog/optons']);
    assert.equal(wrong.code, 2);
    assert.match(wrong.err, /closest is dialog\/options/);
    assert.equal(call(['examples', 'a', 'b']).code, 2);
  });

  it('is in the index', () => {
    assert.match(call([]).out, /blip examples \[<page> \| <id>\]/);
  });
});

describe('search over examples', () => {
  const pages = [
    {
      id: 'menu-screen',
      kind: 'pattern',
      title: 'Menu screen',
      summary: 'A screen that asks to choose.',
      headings: [],
      text: 'menu',
    },
    {
      id: 'picker',
      kind: 'component',
      title: 'Picker',
      summary: 'A list, the title menu.',
      headings: [],
      text: 'menu menu menu',
    },
  ];
  const examples = [
    {
      id: 'menu-screen/pick-a-role',
      page: 'menu-screen',
      title: 'Pick a role',
      summary: 'A menu screen.',
    },
  ];

  it('lists the example after its page, with the command that prints it', () => {
    const hits = search('menu', pages, [], 8, examples);
    assert.equal(hits[0]!.id, 'menu-screen');
    const hit = hits.find(hit => hit.type === 'example')!;
    assert.equal(hit.command, 'blip examples menu-screen/pick-a-role');
  });

  it('finds an example by a word of its name', () => {
    assert.equal(search('role', pages, [], 8, examples)[0]!.type, 'example');
  });
});
