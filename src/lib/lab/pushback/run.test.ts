import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BOSS_SLOT_INDEX } from './characters';
import { type DuelState, createDuel, reduce } from './duel';
import { poolOf } from './lines';
import {
  attemptFor,
  bossUnlocked,
  canPlay,
  createRunState,
  duelSetupFor,
  nextSlot,
  recordDuel,
} from './run';

/** Play a slot to the end, answering right or wrong throughout */
const playSlot = (
  run: ReturnType<typeof createRunState>,
  index: number,
  win: boolean,
) => {
  let s: DuelState = createDuel(
    duelSetupFor(run, index, { seed: index + 1, silence: false }),
  );
  s = reduce(s, { type: 'begin' });
  for (let guard = 0; guard < 100 && s.phase !== 'end'; guard++) {
    if (s.phase === 'defend') {
      const answer = s.exchange!.answer;
      s = reduce(s, {
        type: 'counter',
        phrase: win ? answer : s.menu.find(id => id !== answer)!,
      });
    } else if (s.phase === 'attack') {
      s = reduce(s, { type: 'throw', phrase: s.hand[0]! });
    } else {
      s = reduce(s, { type: 'continue' });
    }
  }
  return recordDuel(run, index, s);
};

describe('a run', () => {
  it('starts with exactly the own pool collected and the first slot up', () => {
    const run = createRunState('dev', 3);
    assert.deepEqual(
      run.collected,
      poolOf('dev').map(p => p.id),
    );
    assert.equal(nextSlot(run), 0);
    assert.ok(!bossUnlocked(run));
    assert.ok(!canPlay(run, BOSS_SLOT_INDEX));
    assert.equal(attemptFor(run, 0), 'first');
    assert.ok(duelSetupFor(run, 0, { seed: 1, silence: true }).tutorial);
  });

  it('marks a lost slot for a retry and a beaten one for a replay', () => {
    let run = createRunState('pm', 5);
    run = playSlot(run, 0, false);
    assert.equal(attemptFor(run, 0), 'retry');
    assert.ok(!duelSetupFor(run, 0, { seed: 1, silence: true }).tutorial);
    assert.equal(nextSlot(run), 0);
    run = playSlot(run, 0, true);
    assert.equal(attemptFor(run, 0), 'replay');
    assert.ok(run.beaten[0]);
    assert.equal(nextSlot(run), 1);
  });

  it('keeps what the duel collected and adds up the stats', () => {
    let run = createRunState('designer', 8);
    run = playSlot(run, 0, true);
    assert.ok(run.collected.length > 8);
    assert.equal(run.stats.exchangesWon, 3);
    run = playSlot(run, 1, false);
    assert.equal(run.stats.exchangesLost, 3);
  });

  it('unlocks the boss after six ticks and finishes on a boss win', () => {
    let run = createRunState('pm', 2);
    for (let index = 0; index < BOSS_SLOT_INDEX; index++) {
      run = playSlot(run, index, true);
    }
    assert.ok(bossUnlocked(run));
    assert.ok(canPlay(run, BOSS_SLOT_INDEX));
    assert.ok(!run.finished);
    run = playSlot(run, BOSS_SLOT_INDEX, true);
    assert.ok(run.finished);
    assert.equal(run.beaten[BOSS_SLOT_INDEX]?.flawless, true);
  });
});
