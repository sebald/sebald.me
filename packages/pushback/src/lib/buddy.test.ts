import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BUDDY_STEPS,
  BUDDY_WINDOW_MS,
  buddyLine,
  buddyRuledOut,
  buddyStep,
} from './buddy';
import { BUDDY_BARKS } from './lines';

describe('buddyStep', () => {
  it('dims in three steps across the silence limit', () => {
    assert.equal(buddyStep(0, 8000), 0);
    assert.equal(buddyStep(3999, 8000), 0);
    assert.equal(buddyStep(4000, 8000), 1);
    assert.equal(buddyStep(5600, 8000), 2);
    assert.equal(buddyStep(7040, 8000), BUDDY_STEPS);
    assert.equal(buddyStep(8000, 8000), BUDDY_STEPS);
  });

  it('shows nothing before the momentum cutoff is near', () => {
    // Fast counters (before half the limit) earn momentum; the first
    // step lands just before that, so a player who waits for the
    // whisper gives momentum up.
    assert.equal(buddyStep(8000 * 0.49, 8000), 0);
    assert.equal(buddyStep(8000 * 0.5, 8000), 1);
  });

  it('paces itself without a silence bar', () => {
    assert.equal(buddyStep(0, null), 0);
    assert.equal(buddyStep(BUDDY_WINDOW_MS * 0.5, null), 1);
    assert.equal(buddyStep(BUDDY_WINDOW_MS, null), BUDDY_STEPS);
  });
});

describe('buddyRuledOut', () => {
  it('rules out in steps from nothing to all, and clamps', () => {
    assert.equal(buddyRuledOut(0), 0);
    assert.ok(buddyRuledOut(1) > 0 && buddyRuledOut(2) > buddyRuledOut(1));
    assert.equal(buddyRuledOut(BUDDY_STEPS), 1);
    assert.equal(buddyRuledOut(99), 1);
    assert.equal(buddyRuledOut(-1), 0);
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
