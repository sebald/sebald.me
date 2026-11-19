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
