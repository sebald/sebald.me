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
  swapKey,
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

  it('the two colleagues on one base differ in their prop', () => {
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
