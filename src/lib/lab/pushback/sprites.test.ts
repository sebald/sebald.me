import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CHARACTERS } from './characters';
import {
  GHOST_CELLS,
  POSE_CELL,
  SHEET_IDS,
  cellFor,
  ghostCell,
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

describe('sheets', () => {
  it('every character is drawn from a sheet that exists', () => {
    for (const character of CHARACTERS) {
      assert.ok(SHEET_IDS.includes(character.sheet), character.id);
    }
  });
});
