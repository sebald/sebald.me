import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CHARACTERS } from './characters';
import {
  GHOST_CELLS,
  POSE_CELL,
  SHEET_IDS,
  TALK,
  TEARS,
  cellFor,
  ghostCell,
  mouthOpen,
  tearDrop,
} from './sprites';
import { FRAME_MS } from './stage';

describe('cellFor', () => {
  it('maps every pose to its sheet cell', () => {
    assert.equal(cellFor('idle'), 0);
    assert.equal(cellFor('talk'), POSE_CELL.talk);
    assert.equal(cellFor('taunt'), 2);
    assert.equal(cellFor('lose'), 5);
  });
});

describe('mouthOpen', () => {
  it('follows the uneven rhythm while the line types, about three openings a second', () => {
    const openings = TALK.filter((v, i) => v === 1 && TALK[i - 1] !== 1).length;
    assert.equal(openings, 3);
    TALK.forEach((open, i) => {
      assert.equal(mouthOpen(i * FRAME_MS, true), open === 1);
    });
    assert.equal(mouthOpen(TALK.length * FRAME_MS, true), TALK[0] === 1);
  });

  it('shuts once the line is typed', () => {
    assert.equal(mouthOpen(0, false), false);
    assert.equal(mouthOpen(FRAME_MS * 7, false), false);
  });
});

describe('tearDrop', () => {
  it('falls two pixels a frame, then pauses until the period is over', () => {
    assert.equal(tearDrop(0), 0);
    assert.equal(tearDrop(FRAME_MS), 2);
    assert.equal(tearDrop(FRAME_MS * (TEARS.fall - 1)), (TEARS.fall - 1) * 2);
    assert.equal(tearDrop(FRAME_MS * TEARS.fall), null);
    assert.equal(tearDrop(FRAME_MS * TEARS.period), 0);
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
