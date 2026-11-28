import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { sectionNames, sectionOf } from './section.ts';

const PAGE = `# Button

Intro.

## Props

| Prop |
| --- |

### \`Sub\`

Part.

\`\`\`md
## Not a heading
\`\`\`

## Usage and rules

- Do

## Accessibility

Native.
`;

describe('sectionOf', () => {
  it('takes a section up to the next ## and keeps its ### parts', () => {
    const props = sectionOf(PAGE, 'props')!;
    assert.ok(props.startsWith('## Props'));
    assert.match(props, /### `Sub`/);
    assert.match(props, /## Not a heading/);
    assert.doesNotMatch(props, /Usage and rules/);
  });

  it('matches the first word of a heading, in any case', () => {
    assert.equal(sectionOf(PAGE, 'USAGE')!.trim().split('\n').at(-1), '- Do');
  });

  it('is null for a section the page does not have', () => {
    assert.equal(sectionOf(PAGE, 'anatomy'), null);
    assert.deepEqual(sectionNames(PAGE), [
      'Props',
      'Usage and rules',
      'Accessibility',
    ]);
  });
});
