import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BITMAP_GLYPHS,
  bitmapTextLayout,
  drawBitmapText,
} from './bitmap-text.layout';

describe('bitmapTextLayout', () => {
  it('sizes a word: six letter pixels a letter less the last gap, its ink and drop round it', () => {
    const { width, height } = bitmapTextLayout('AB', 2);
    assert.equal(width, (2 * 6 - 1) * 2 + 4);
    assert.equal(height, 7 * 2 + 4);
  });

  it('draws each letter as its drop and ink line, then its pixels', () => {
    const { rects } = bitmapTextLayout('I', 1);
    const parts = rects.map(rect => rect.part);
    const firstLetter = parts.findIndex(part => part !== 'ink');
    assert.ok(firstLetter > 0);
    assert.ok(parts.slice(firstLetter).every(part => part !== 'ink'));
  });

  it('lights the top row and shades the bottom two', () => {
    const { rects } = bitmapTextLayout('I', 1);
    const row = (part: string) =>
      new Set(rects.filter(r => r.part === part).map(r => r.y - 1));
    assert.deepEqual([...row('light')], [0]);
    assert.deepEqual([...row('shade')].sort(), [5, 6]);
  });

  it('has a slash, for counts like 60/60 and addresses', () => {
    assert.ok(BITMAP_GLYPHS.includes('/'));
    const blank = bitmapTextLayout(' ', 1).rects.length;
    assert.equal(blank, 0);
    assert.ok(bitmapTextLayout('/', 1).rects.length > 0);
  });

  it('leaves a character the font lacks blank, and upper-cases', () => {
    assert.equal(bitmapTextLayout('~', 1).rects.length, 0);
    assert.deepEqual(bitmapTextLayout('a', 2), bitmapTextLayout('A', 2));
  });
});

describe('drawBitmapText', () => {
  it('paints the layout at its place, a unit of canvas pixels a stage pixel', () => {
    const calls: number[][] = [];
    const ctx = {
      fillStyle: '',
      fillRect: (x: number, y: number, w: number, h: number) =>
        void calls.push([x, y, w, h]),
    };
    const colours = { ink: 'k', light: 'l', main: 'm', shade: 's' };
    const box = drawBitmapText(ctx, 'I', {
      x: 10,
      y: 20,
      scale: 2,
      unit: 3,
      colours,
    });
    const layout = bitmapTextLayout('I', 2);
    assert.equal(calls.length, layout.rects.length);
    assert.deepEqual(calls[0], [
      10 + layout.rects[0]!.x * 3,
      20 + layout.rects[0]!.y * 3,
      layout.rects[0]!.width * 3,
      layout.rects[0]!.height * 3,
    ]);
    assert.deepEqual(box, {
      width: layout.width * 3,
      height: layout.height * 3,
    });
  });
});
