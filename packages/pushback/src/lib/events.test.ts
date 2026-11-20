import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bossIndex } from './characters';
import { type DuelState, createDuel, reduce } from './duel';
import {
  duelEnded,
  duelLeft,
  duelStarted,
  gameOpened,
  modeChanged,
  runContinued,
  runFinished,
  runStarted,
  saveErased,
} from './events';
import { duelSetupFor } from './run';
import { type Save, emptySave, finishDuel, startRun } from './save';

/** A duel at a slot of the save's run, played to its end, won or lost */
const playDuel = (save: Save, index: number, win: boolean): DuelState => {
  let s = createDuel(
    duelSetupFor(save.run!, index, {
      seed: index + 1,
      silence: false,
      mode: save.mode,
    }),
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
      s = reduce(s, { type: 'throw', phrase: s.closer ?? s.hand[0]! });
    } else {
      s = reduce(s, { type: 'continue' });
    }
  }
  return s;
};

describe('events', () => {
  const fresh = startRun(emptySave('normal'), 'dev', 'b', 7);

  it('a run started says whether it replaced an open one', () => {
    assert.deepEqual(runStarted(emptySave('hard'), 'pm', 'a'), {
      type: 'run:start',
      role: 'pm',
      look: 'a',
      mode: 'hard',
      replaced: false,
    });
    assert.equal(
      (runStarted(fresh, 'pm', 'a') as { replaced: boolean }).replaced,
      true,
    );
  });

  it('the game opened, a run continued: what the save holds', () => {
    assert.deepEqual(gameOpened(fresh, true), {
      type: 'game:open',
      returning: true,
      running: true,
      mode: 'normal',
    });
    assert.deepEqual(runContinued(fresh.run!, fresh.mode), {
      type: 'run:continue',
      role: 'dev',
      mode: 'normal',
      beaten: 0,
      slots: fresh.run!.run.slots.length,
    });
  });

  it('a duel started names the opponent, the tier and the attempt', () => {
    const event = duelStarted(fresh.run!, 0, fresh.mode);
    assert.deepEqual(event, {
      type: 'duel:start',
      role: 'dev',
      opponent: fresh.run!.run.slots[0]!.character,
      tier: 1,
      attempt: 'first',
      mode: 'normal',
      tutorial: true,
    });
  });

  it('a duel ended: the result as the save records it', () => {
    const won = playDuel(fresh, 0, true);
    const event = duelEnded(won);
    assert.equal(event?.type, 'duel:end');
    if (event?.type !== 'duel:end') return;
    assert.equal(event.result, 'won');
    assert.ok(event.score > 0);
    assert.ok(event.exchangesWon > 0);

    const lost = duelEnded(playDuel(fresh, 0, false));
    assert.equal(lost?.type === 'duel:end' && lost.result, 'lost');
    assert.equal(lost?.type === 'duel:end' && lost.score, 0);
  });

  it('a duel not over yet ends nothing, but can be left', () => {
    const begun = reduce(
      createDuel(duelSetupFor(fresh.run!, 0, { seed: 1, silence: false })),
      { type: 'begin' },
    );
    assert.equal(duelEnded(begun), null);
    assert.equal(duelLeft(begun).type, 'duel:leave');
  });

  it('a run finishes once, when the Stakeholder falls the first time', () => {
    let save = fresh;
    const boss = bossIndex(save.run!.run);
    for (let index = 0; index < boss; index++)
      save = finishDuel(save, index, playDuel(save, index, true));
    assert.equal(
      runFinished(save, finishDuel(save, boss, playDuel(save, boss, false))),
      null,
    );
    const finished = finishDuel(save, boss, playDuel(save, boss, true));
    const event = runFinished(save, finished);
    assert.equal(event?.type, 'run:finish');
    if (event?.type !== 'run:finish') return;
    assert.equal(event.role, 'dev');
    assert.equal(event.attempts, boss + 1);
    assert.ok(event.score > 0);
    // A replay after it finishes nothing new
    assert.equal(
      runFinished(
        finished,
        finishDuel(finished, boss, playDuel(finished, boss, true)),
      ),
      null,
    );
  });

  it('a mode switched: nothing when it stays, discarded with progress', () => {
    assert.equal(modeChanged(fresh, 'normal'), null);
    assert.deepEqual(modeChanged(fresh, 'easy'), {
      type: 'mode:change',
      from: 'normal',
      to: 'easy',
      discarded: true,
    });
    assert.equal(
      (modeChanged(emptySave(), 'hard') as { discarded: boolean }).discarded,
      false,
    );
  });

  it('the save erased, with what it held', () => {
    assert.deepEqual(saveErased(fresh), {
      type: 'save:erase',
      running: true,
      shipped: 0,
      glossary: 0,
    });
  });
});
