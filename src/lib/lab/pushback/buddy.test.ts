import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BUDDY_STEPS,
  BUDDY_WINDOW_MS,
  buddyLine,
  buddyOpacity,
  buddyStep,
} from './buddy';
import { BUDDY_BARKS } from './lines';

describe('buddyStep', () => {
  it('dims in three steps across the silence limit', () => {
    assert.equal(buddyStep(0, 8000), 0);
    assert.equal(buddyStep(2399, 8000), 0);
    assert.equal(buddyStep(2400, 8000), 1);
    assert.equal(buddyStep(4400, 8000), 2);
    assert.equal(buddyStep(6400, 8000), BUDDY_STEPS);
    assert.equal(buddyStep(8000, 8000), BUDDY_STEPS);
  });

  it('shows nothing before the momentum cutoff is near', () => {
    // Fast counters (before half the limit) earn momentum; the first
    // step lands just before that, so a player who waits for the
    // whisper gives momentum up.
    assert.equal(buddyStep(8000 * 0.29, 8000), 0);
    assert.equal(buddyStep(8000 * 0.5, 8000), 1);
  });

  it('paces itself without a silence bar', () => {
    assert.equal(buddyStep(0, null), 0);
    assert.equal(buddyStep(BUDDY_WINDOW_MS * 0.3, null), 1);
    assert.equal(buddyStep(BUDDY_WINDOW_MS, null), BUDDY_STEPS);
  });
});

describe('buddyOpacity', () => {
  it('drops from full to a quarter and clamps', () => {
    assert.equal(buddyOpacity(0), 1);
    assert.ok(buddyOpacity(1) < 1 && buddyOpacity(2) < buddyOpacity(1));
    assert.equal(buddyOpacity(BUDDY_STEPS), 0.25);
    assert.equal(buddyOpacity(99), 0.25);
    assert.equal(buddyOpacity(-1), 1);
  });
});

describe('buddyLine', () => {
  it('uses every line before repeating one, from a seed-set start', () => {
    const lines = BUDDY_BARKS.map((_, i) => buddyLine(i, 7));
    assert.equal(new Set(lines).size, BUDDY_BARKS.length);
    assert.equal(buddyLine(BUDDY_BARKS.length, 7), buddyLine(0, 7));
    assert.notEqual(buddyLine(0, 0), buddyLine(0, 1));
  });
});
