import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mdxToMarkdown } from './convert.ts';
import {
  exampleAt,
  exampleOfStory,
  humanize,
  rewriteImports,
  summaryOfExample,
} from './examples.ts';

const EXPORTED = new Set(['Dialog', 'DialogProps', 'Button', 'Title']);

const SOURCE = `import { useState } from 'react';

import { Button } from '../../button/button';
import { Title } from '../../parts/parts';
import { type DialogProps, Dialog } from '../dialog';

/**
 * Over a menu: the dialog has the keys
 * while it is open
 */
export function Options(props: DialogProps) {
  return null;
}
`;

describe('exampleAt', () => {
  it('names the page and the file of an example, and nothing else', () => {
    assert.deepEqual(exampleAt('components/dialog/examples/options.tsx'), {
      page: 'dialog',
      name: 'options',
    });
    assert.deepEqual(exampleAt('patterns/duel/examples/meeting.tsx'), {
      page: 'duel',
      name: 'meeting',
    });
    assert.equal(exampleAt('components/dialog/dialog.tsx'), null);
    assert.equal(exampleAt('components/dialog/examples/deep/x.tsx'), null);
  });

  it('humanizes a file name', () => {
    assert.equal(humanize('in-a-window'), 'In a window');
  });
});

describe('summaryOfExample', () => {
  it('reads the component’s doc comment on one line', () => {
    assert.equal(
      summaryOfExample(SOURCE),
      'Over a menu: the dialog has the keys while it is open',
    );
    assert.equal(summaryOfExample('export function A() {}'), '');
  });
});

describe('rewriteImports', () => {
  const out = rewriteImports(
    SOURCE,
    'components/dialog/examples/options.tsx',
    EXPORTED,
    '@sebald/blip-ui',
  );

  it('turns every relative import into one from the package', () => {
    assert.doesNotMatch(out, /from '\./);
    assert.match(
      out,
      /^import \{ useState \} from 'react';\n\nimport \{ Button, Dialog, type DialogProps, Title \} from '@sebald\/blip-ui';\n\n/,
    );
    assert.match(out, /export function Options/);
  });

  it('wraps a long import one name to a line', () => {
    const many = new Set(
      Array.from({ length: 12 }, (_, i) => `Component${i}`),
    );
    const source = `import { ${[...many].join(', ')} } from '../../x/x';\n\nexport function A() {}\n`;
    const wrapped = rewriteImports(
      source,
      'components/x/examples/a.tsx',
      many,
      '@sebald/blip-ui',
    );
    assert.match(wrapped, /^import \{\n {2}Component0,\n/);
  });

  it('fails on what a consumer could not import', () => {
    const rewrite = (line: string, path = 'components/dialog/examples/a.tsx') =>
      rewriteImports(`${line}\n`, path, EXPORTED, '@sebald/blip-ui');
    assert.throws(() => rewrite("import { Nope } from '../dialog';"), /Nope/);
    assert.throws(
      () => rewrite("import { Dialog } from '../dialog.stories';"),
      /consumer/,
    );
    assert.throws(
      () => rewrite("import { A } from './b';"),
      /another example/,
    );
    assert.throws(
      () => rewrite("import Dialog from '../dialog';"),
      /named import/,
    );
    assert.throws(
      () => rewrite("import { A } from '../../../../x';", 'a/examples/a.tsx'),
      /consumer/,
    );
  });
});

describe('exampleOfStory', () => {
  const stories = `import { Pair as PairExample } from './examples/pair';
import { Other } from '../patterns/duel/examples/meeting';

export const Default: Story = {};

export const Pair: Story = {
  render: () => <PairExample />,
};

export const Duel: Story = {
  render: () => <Other />,
};
`;

  it('finds the example a story renders, through its alias', () => {
    assert.equal(
      exampleOfStory(stories, 'components/button/button.stories.tsx', 'Pair'),
      'components/button/examples/pair.tsx',
    );
    assert.equal(
      exampleOfStory(stories, 'compositions/together.stories.tsx', 'Duel'),
      'patterns/duel/examples/meeting.tsx',
    );
  });

  it('finds none for a story that renders none', () => {
    assert.equal(exampleOfStory(stories, 'a/a.stories.tsx', 'Default'), null);
    assert.equal(exampleOfStory(stories, 'a/a.stories.tsx', 'Missing'), null);
  });
});

describe('a Canvas', () => {
  const mdx = `# Page\n\n<Canvas of={X.Pair} />\n<Canvas of={X.Default} />\n\n## Next\n`;

  it('becomes the example when the story has one, and goes otherwise', () => {
    const markdown = mdxToMarkdown(mdx, [], '', (_, story) =>
      story === 'Pair' ? '\n```tsx\n<Pair />\n```\n' : undefined,
    );
    assert.equal(markdown, '# Page\n\n```tsx\n<Pair />\n```\n\n## Next\n');
  });
});
