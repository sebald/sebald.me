import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Content } from './parts';

const SRC = join(import.meta.dirname, '../..');

describe('a content’s rows', () => {
  it('are a gap apart that the content sets, from the scale', () => {
    const html = renderToStaticMarkup(createElement(Content, null, 'a'));
    assert.match(html, /\bgrid\b/);
    assert.match(html, /gap-\[calc\(var\(--bui-px\)\*4\)\]/);
  });

  it('are spaced by no example, story or pattern of the kit', () => {
    const own = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
      .filter(file => /\.(tsx?|mdx)$/.test(file))
      // The styles that set the gap, and this test
      .filter(file => !/(^|\/)parts\.(styles|test)\.ts$/.test(file));
    const hand = /grid\s+gap-\[calc\(var\(--bui-px\)\*4\)\]/;
    assert.deepEqual(
      own.filter(file => hand.test(readFileSync(join(SRC, file), 'utf8'))),
      [],
      'a Content sets the gap between its rows: place them as its children',
    );
  });
});
