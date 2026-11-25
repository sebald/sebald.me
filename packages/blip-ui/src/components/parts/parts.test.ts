import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Content } from './parts';

const SRC = join(import.meta.dirname, '../..');

describe('a content’s rows', () => {
  it('are a gap apart that the content sets, by its role', () => {
    const html = renderToStaticMarkup(createElement(Content, null, 'a'));
    assert.match(html, /\bgrid\b/);
    assert.match(html, /\bgap-regular\b/);
  });

  it('are spaced by no example, story or pattern of the kit', () => {
    const own = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
      .filter(file => /\.(tsx|mdx)$/.test(file))
      // The styles that set the gap, and this test
      .filter(file => !/(^|\/)parts\.(styles|test)\.ts$/.test(file));
    // The gap the content sets, written by hand next to a grid, in either order
    const gap = String.raw`gap-regular\b`;
    const hand = new RegExp(
      String.raw`(?:\bgrid\b[^'"\`\n]*${gap}|${gap}[^'"\`\n]*\bgrid\b)`,
    );
    assert.deepEqual(
      own.filter(file => hand.test(readFileSync(join(SRC, file), 'utf8'))),
      [],
      'a Content sets the gap between its rows: place them as its children',
    );
  });
});
