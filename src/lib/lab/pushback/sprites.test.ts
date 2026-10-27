import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CHARACTERS } from './characters';
import {
  GHOST_CELLS,
  POSE_CELL,
  PROPS,
  SHEET_IDS,
  cellFor,
  ghostCell,
  handAnchor,
  hexToRgb,
  hue,
  luminance,
  recolour,
  saturation,
  shade,
  swapKey,
  tintMatches,
} from './sprites';
import { FRAME_MS } from './stage';

describe('cellFor', () => {
  it('maps every pose to its sheet cell', () => {
    assert.equal(cellFor('idle', 0, false), 0);
    assert.equal(cellFor('taunt', 999, false), 2);
    assert.equal(cellFor('lose', 0, true), 5);
  });

  it('alternates the mouth while a line types, then rests open', () => {
    assert.equal(cellFor('talk', 0, true), POSE_CELL.talk);
    assert.equal(cellFor('talk', FRAME_MS, true), POSE_CELL.idle);
    assert.equal(cellFor('talk', FRAME_MS * 2, true), POSE_CELL.talk);
    assert.equal(cellFor('talk', FRAME_MS * 7, false), POSE_CELL.talk);
  });
});

describe('ghostCell', () => {
  it('hovers on two frames, then points from the second step', () => {
    assert.equal(ghostCell(0, 0), GHOST_CELLS.hover[0]);
    assert.equal(ghostCell(1, 600), GHOST_CELLS.hover[1]);
    assert.equal(ghostCell(2, 0), GHOST_CELLS.point);
    assert.equal(ghostCell(3, 1200), GHOST_CELLS.point);
  });
});

describe('colour', () => {
  it('reads hue, saturation and luminance', () => {
    assert.equal(hue([255, 0, 0]), 0);
    assert.equal(hue([0, 255, 0]), 120);
    assert.equal(hue([0, 0, 255]), 240);
    assert.equal(hue([128, 128, 128]), 0);
    assert.equal(saturation([128, 128, 128]), 0);
    assert.equal(saturation([255, 0, 0]), 1);
    assert.equal(luminance([255, 255, 255]), 255);
    assert.deepEqual(hexToRgb('#2a7b7c'), [42, 123, 124]);
  });

  it('matches a material by hue, and a grey by lightness', () => {
    const teal = hexToRgb('2a7b7c');
    assert.ok(tintMatches([60, 150, 150], teal), 'a lighter teal');
    assert.ok(tintMatches([20, 70, 72], teal), 'a darker teal');
    assert.ok(!tintMatches([200, 80, 80], teal), 'a red');
    assert.ok(!tintMatches([100, 100, 100], teal), 'a grey');
    const grey = hexToRgb('6c7072');
    assert.ok(tintMatches([90, 92, 95], grey), 'a darker grey');
    assert.ok(!tintMatches([10, 10, 12], grey), 'the outline black');
    assert.ok(!tintMatches([60, 150, 150], grey), 'a colour');
  });

  it('keeps the shade when it recolours', () => {
    const from = hexToRgb('808080');
    const to = hexToRgb('ff0000');
    assert.deepEqual(shade([128, 128, 128], from, to), [255, 0, 0]);
    assert.deepEqual(shade([64, 64, 64], from, to), [128, 0, 0]);
  });

  it('recolours matching pixels in place and leaves the rest', () => {
    // A teal pixel, a red one and a transparent teal one, four bytes each
    const rgba = Uint8ClampedArray.from([
      42, 123, 124, 255, 200, 80, 80, 255, 42, 123, 124, 0,
    ]);
    recolour(rgba, [{ from: '2a7b7c', to: '9c3d6e' }]);
    assert.deepEqual(Array.from(rgba.slice(0, 3)), [156, 61, 110]);
    assert.deepEqual(Array.from(rgba.slice(4, 7)), [200, 80, 80]);
    assert.deepEqual(Array.from(rgba.slice(8, 11)), [42, 123, 124]);
  });
});

describe('swaps', () => {
  it('every character uses a sheet and a prop that exist', () => {
    for (const character of CHARACTERS) {
      assert.ok(SHEET_IDS.includes(character.swap.base), character.id);
      if (character.swap.prop) {
        assert.ok(PROPS.includes(character.swap.prop), character.id);
      }
    }
  });

  it('every prop is carried by exactly one character', () => {
    const carried = CHARACTERS.flatMap(c => (c.swap.prop ? [c.swap.prop] : []));
    assert.deepEqual([...carried].sort(), [...PROPS].sort());
  });

  it('the two colleagues on one base differ in tint or prop', () => {
    const keys = CHARACTERS.map(c => swapKey(c.swap));
    assert.equal(new Set(keys).size, keys.length);
  });

  it('puts the prop at the forward hand of the figure', () => {
    assert.deepEqual(handAnchor({ x: 20, y: 32, width: 30, height: 80 }), {
      x: 44,
      y: 80,
    });
  });
});
