import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  padBox,
  padPixels,
} from '../../../../.claude/skills/pixel-sprite/scripts/pad.mjs';

describe('padBox', () => {
  it('centres a smaller image and pads the rest', () => {
    assert.deepEqual(padBox(458, 255, 480, 270), {
      left: 11,
      top: 7,
      cropX: 0,
      cropY: 0,
      copyW: 458,
      copyH: 255,
    });
  });

  it('crops a larger image centred', () => {
    assert.deepEqual(padBox(500, 300, 480, 270), {
      left: 0,
      top: 0,
      cropX: 10,
      cropY: 15,
      copyW: 480,
      copyH: 270,
    });
  });

  it('mixes: pads one side, crops the other', () => {
    const box = padBox(500, 255, 480, 270);
    assert.equal(box.cropX, 10);
    assert.equal(box.copyW, 480);
    assert.equal(box.top, 7);
    assert.equal(box.copyH, 255);
  });
});

describe('padPixels', () => {
  // A 2x2 image with one channel: a b / c d
  const img = Buffer.from([1, 2, 3, 4]);

  it('repeats the edge columns and rows into the padding', () => {
    const out = padPixels(img, 2, 2, 4, 4, 1);
    assert.deepEqual(
      [...out],
      [1, 1, 2, 2, 1, 1, 2, 2, 3, 3, 4, 4, 3, 3, 4, 4],
    );
  });

  it('crops centred when the image is larger', () => {
    const big = Buffer.from([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    const out = padPixels(big, 4, 4, 2, 2, 1);
    assert.deepEqual([...out], [6, 7, 10, 11]);
  });

  it('keeps the channels together', () => {
    const rgb = Buffer.from([10, 20, 30, 40, 50, 60]);
    const out = padPixels(rgb, 2, 1, 3, 1, 3);
    assert.deepEqual([...out], [10, 20, 30, 40, 50, 60, 40, 50, 60]);
  });
});
