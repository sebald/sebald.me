import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { headingsOf, mdxToMarkdown, summaryOf, titleOf } from './convert.ts';

const PAGE = `import { Canvas, Controls, Meta } from '@storybook/addon-docs/blocks';

import * as DialogStories from './dialog.stories';

<Meta of={DialogStories} />

# Dialog

A window over the stage,
for what interrupts a screen.

<Canvas of={DialogStories.Default} />
<Controls of={DialogStories.Default} />

\`\`\`tsx
import { Dialog } from '@sebald/blip-ui';

<Dialog open>
  <Controls of={nothing} />
</Dialog>
\`\`\`

## Usage

- **Do** use it.
`;

describe('mdxToMarkdown with a props table', () => {
  const table = '## Props\n\n| Prop |';

  it('puts the table where <Controls /> was, not twice', () => {
    const markdown = mdxToMarkdown(PAGE, [], table);
    assert.equal(markdown.split('## Props').length, 2);
    assert.ok(markdown.indexOf('## Props') < markdown.indexOf('## Usage'));
    assert.ok(markdown.indexOf('## Props') < markdown.indexOf('```tsx'));
    assert.match(markdown, /<Controls of=\{nothing\} \/>/);
  });

  it('puts it before the first section of a page with no <Controls />', () => {
    const page = PAGE.replace('<Controls of={DialogStories.Default} />\n', '');
    const markdown = mdxToMarkdown(page, [], table);
    assert.ok(markdown.indexOf('## Props') < markdown.indexOf('## Usage'));
    assert.ok(markdown.indexOf('```tsx') < markdown.indexOf('## Props'));
  });

  it('adds nothing when there is no table', () => {
    assert.doesNotMatch(mdxToMarkdown(PAGE), /## Props/);
  });
});

describe('mdxToMarkdown', () => {
  const markdown = mdxToMarkdown(PAGE);

  it('drops imports, Meta, Canvas and Controls outside code', () => {
    const outside = markdown.split('```')[0]!;
    assert.doesNotMatch(outside, /^import|<Meta|<Canvas|<Controls/m);
    assert.match(outside, /^# Dialog/);
  });

  it('leaves code fences as they are', () => {
    assert.match(markdown, /import \{ Dialog \} from '@sebald\/blip-ui';/);
    assert.match(markdown, /<Controls of=\{nothing\} \/>/);
    assert.match(markdown, /<Dialog open>/);
  });

  it('leaves no run of blank lines where a block was', () => {
    assert.doesNotMatch(markdown, /\n{3,}/);
    assert.ok(markdown.endsWith('\n') && !markdown.endsWith('\n\n'));
  });

  it('drops an import that spans lines', () => {
    const converted = mdxToMarkdown(
      "import {\n  A,\n  B,\n} from './x';\n\n# Title\n\nText.\n",
    );
    assert.equal(converted, '# Title\n\nText.\n');
  });

  it('turns a Storybook link into the command that opens the page', () => {
    const text = 'See [IconButton](?path=/docs/components-iconbutton--docs).';
    assert.equal(
      mdxToMarkdown(text, ['icon-button']),
      'See IconButton (`blip docs icon-button`).\n',
    );
  });

  it('finds a page whose title is words, its dashes kept', () => {
    const text = 'See [Menus and forms](?path=/docs/guides-menus-and-forms--docs).';
    assert.equal(
      mdxToMarkdown(text, ['forms', 'menus-and-forms']),
      'See Menus and forms (`blip docs menus-and-forms`).\n',
    );
  });

  it('keeps only the text of a link to a page that is not shipped', () => {
    const text = 'See [Gone](?path=/docs/components-gone--docs).';
    assert.equal(mdxToMarkdown(text, ['button']), 'See Gone.\n');
  });

  it('leaves ordinary links alone', () => {
    const text = '[Base UI](https://base-ui.com)';
    assert.equal(mdxToMarkdown(text), `${text}\n`);
  });
});

describe('page facts', () => {
  const markdown = mdxToMarkdown(PAGE);

  it('reads the title, the summary on one line and the headings', () => {
    assert.equal(titleOf(markdown), 'Dialog');
    assert.equal(
      summaryOf(markdown),
      'A window over the stage, for what interrupts a screen.',
    );
    assert.deepEqual(headingsOf(markdown), ['Usage']);
  });
});
