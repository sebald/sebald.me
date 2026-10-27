import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDuel, reduce } from './duel';
import { duelSetupFor } from './run';
import {
  SAVE_KEY,
  type SaveStorage,
  emptySave,
  finishDuel,
  loadSave,
  parseSave,
  playerName,
  resultCardText,
  setSilence,
  startRun,
  writeSave,
} from './save';

const fakeStorage = (initial: Record<string, string> = {}): SaveStorage => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
};

describe('save', () => {
  it('round-trips through storage', () => {
    const storage = fakeStorage();
    const save = startRun(setSilence(emptySave(), false), 'dev', 'b', 42);
    writeSave(save, storage);
    assert.deepEqual(loadSave(storage), save);
  });

  it('returns null without a save, on corrupt data and on another version', () => {
    assert.equal(loadSave(fakeStorage()), null);
    assert.equal(loadSave(fakeStorage({ [SAVE_KEY]: '{not json' })), null);
    assert.equal(
      parseSave(JSON.stringify({ version: 2, silence: true, runs: {} })),
      null,
    );
    assert.equal(
      parseSave(JSON.stringify({ version: 1, silence: 'yes', runs: {} })),
      null,
    );
  });

  it('drops a run that does not look like one and keeps the rest', () => {
    const save = startRun(emptySave(), 'pm', 'a', 1);
    const raw = JSON.stringify({
      ...save,
      runs: { ...save.runs, dev: { role: 'dev' } },
    });
    const parsed = parseSave(raw);
    assert.ok(parsed?.runs.pm);
    assert.equal(parsed?.runs.dev, undefined);
  });

  it('does nothing without storage', () => {
    assert.equal(loadSave(undefined), null);
    writeSave(emptySave(), undefined);
  });

  it('keeps the look and the other runs when starting a run', () => {
    let save = startRun(emptySave(), 'pm', 'b', 1);
    save = startRun(save, 'designer', 'a', 2);
    assert.equal(save.runs.pm?.look, 'b');
    assert.equal(save.runs.designer?.look, 'a');
    assert.equal(playerName('pm', 'b'), 'Ravi');
  });

  it('folds a finished duel into the run', () => {
    let save = startRun(emptySave(), 'pm', 'a', 3);
    const run = save.runs.pm!;
    let duel = createDuel(duelSetupFor(run, 0, { seed: 1, silence: false }));
    duel = reduce(duel, { type: 'begin' });
    for (let guard = 0; guard < 100 && duel.phase !== 'end'; guard++) {
      if (duel.phase === 'defend') {
        duel = reduce(duel, { type: 'counter', phrase: duel.exchange!.answer });
      } else if (duel.phase === 'attack') {
        duel = reduce(duel, { type: 'throw', phrase: duel.hand[0]! });
      } else {
        duel = reduce(duel, { type: 'continue' });
      }
    }
    save = finishDuel(save, 'pm', 0, duel);
    assert.ok(save.runs.pm?.beaten[0]);
    assert.equal(save.runs.pm?.attempts, 1);
    assert.equal(save.runs.pm?.look, 'a');
    assert.equal(finishDuel(save, 'dev', 0, duel), save);
  });
});

describe('resultCardText', () => {
  it('prints the card from the spec', () => {
    const run = startRun(emptySave(), 'dev', 'a', 1).runs.dev!;
    const text = resultCardText({
      ...run,
      finished: true,
      attempts: 10,
      beaten: {
        0: { flawless: true },
        1: { flawless: true },
        2: { flawless: false },
        3: { flawless: true },
        4: { flawless: true },
        5: { flawless: false },
        6: { flawless: true },
      },
      collected: [
        ...run.collected,
        ...Array.from({ length: 16 }, () => 'x' as never),
      ],
      stats: {
        exchangesWon: 31,
        exchangesLost: 9,
        micDrops: 6,
        missesByPool: { pm: 3, dev: 1, designer: 5 },
      },
    });
    assert.equal(
      text,
      [
        'Pushback · Dev',
        'Stakeholder beaten · 10 duels · 5 flawless',
        'Exchanges 31–9 · Mic drops 6 · Glossary 24/24',
        'Missed counters: PM 3 · Dev 1 · Designer 5',
        'sebald.me/lab/pushback',
      ].join('\n'),
    );
  });

  it('says the boss took it offline on a lost run', () => {
    const run = startRun(emptySave(), 'pm', 'a', 1).runs.pm!;
    assert.match(
      resultCardText(run),
      /^Pushback · PM\nStakeholder took it offline · 0 duels · 0 flawless\n/,
    );
  });
});
