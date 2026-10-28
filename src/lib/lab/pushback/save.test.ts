import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createDuel, reduce } from './duel';
import { duelSetupFor } from './run';
import {
  SAVE_KEY,
  type SaveStorage,
  emptySave,
  finishDuel,
  hasProgress,
  hasRuns,
  loadSave,
  parseSave,
  playerName,
  resetSave,
  resultCardText,
  resultModel,
  setMode,
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
    const save = startRun(setMode(emptySave(), 'hard'), 'dev', 'b', 42);
    writeSave(save, storage);
    assert.deepEqual(loadSave(storage), save);
  });

  it('starts over when the mode changes: no runs, no glossary', () => {
    const save = startRun(emptySave('easy', ['pm-1']), 'dev', 'a', 1);
    assert.ok(hasProgress(save));
    assert.equal(setMode(save, 'easy'), save);
    const hard = setMode(save, 'hard');
    assert.deepEqual(hard, emptySave('hard'));
    assert.equal(hasProgress(hard), false);
    // A glossary alone is progress too
    assert.ok(hasProgress(emptySave('easy', ['pm-1'])));
  });

  it('resets to an empty save and keeps the mode', () => {
    const save = startRun(setMode(emptySave(), 'hard'), 'pm', 'b', 1);
    assert.equal(hasRuns(save), true);
    assert.deepEqual(resetSave(save), emptySave('hard'));
    assert.equal(hasRuns(resetSave(save)), false);
  });

  it('returns null without a save, on corrupt data and on another version', () => {
    assert.equal(loadSave(fakeStorage()), null);
    assert.equal(loadSave(fakeStorage({ [SAVE_KEY]: '{not json' })), null);
    assert.equal(
      parseSave(JSON.stringify({ version: 1, mode: 'hard', runs: {} })),
      null,
    );
    assert.equal(
      parseSave(JSON.stringify({ version: 2, mode: 'hard', runs: [] })),
      null,
    );
  });

  it('plays easy with an odd mode and keeps only real pairs in the glossary', () => {
    assert.equal(
      parseSave(JSON.stringify({ version: 3, mode: 'brutal', runs: {} }))?.mode,
      'easy',
    );
    assert.equal(
      parseSave(JSON.stringify({ version: 3, mode: 'normal', runs: {} }))?.mode,
      'normal',
    );
    const parsed = parseSave(
      JSON.stringify({
        version: 2,
        mode: 'hard',
        runs: {},
        glossary: ['pm-1', 'nope', 3],
      }),
    );
    assert.equal(parsed?.mode, 'hard');
    assert.deepEqual(parsed?.glossary, ['pm-1']);
  });

  it('gives an old run a score of nothing and its speed points', () => {
    const run = startRun(emptySave(), 'pm', 'a', 1).runs.pm!;
    const { speed: _speed, ...stats } = run.stats;
    const raw = JSON.stringify({
      version: 2,
      mode: 'normal',
      runs: {
        pm: {
          ...run,
          mode: undefined,
          beaten: { 0: { flawless: true } },
          stats,
        },
      },
      glossary: [],
    });
    const parsed = parseSave(raw)!.runs.pm!;
    assert.deepEqual(parsed.beaten, { 0: { flawless: true, score: 0 } });
    assert.equal(parsed.stats.speed, 0);
  });

  it('reads a two-mode save: its normal had the ghost, so it is easy', () => {
    const old = (mode: string) =>
      parseSave(JSON.stringify({ version: 2, mode, runs: {} }))?.mode;
    assert.equal(old('normal'), 'easy');
    assert.equal(old('hard'), 'hard');
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
    assert.equal(playerName('pm', 'b'), 'Piet');
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
    // The glossary records what the duel collected, once each
    assert.deepEqual(save.glossary, duel.collected);
    assert.deepEqual(finishDuel(save, 'pm', 0, duel).glossary, duel.collected);
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
        0: { flawless: true, score: 1000 },
        1: { flawless: true, score: 1000 },
        2: { flawless: false, score: 1000 },
        3: { flawless: true, score: 1000 },
        4: { flawless: true, score: 1000 },
        5: { flawless: false, score: 1000 },
        6: { flawless: true, score: 1000 },
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
        speed: 0,
      },
    });
    assert.equal(
      text,
      [
        'Pushback · Dev',
        'Stakeholder beaten · 10 duels · 5 flawless · easy mode',
        'Score 7,000',
        'Exchanges 31–9 · Mic drops 6 · Glossary 24/48',
        'Missed counters: PM 3 · Dev 1 · Designer 5',
        'sebald.me/lab/pushback',
      ].join('\n'),
    );
  });

  it('says the boss took it offline on a lost run', () => {
    const run = startRun(emptySave(), 'pm', 'a', 1).runs.pm!;
    assert.match(
      resultCardText(run),
      /^Pushback · PM\nStakeholder took it offline · 0 duels · 0 flawless · easy mode\nScore 0\n/,
    );
  });
});

describe('resultModel', () => {
  it('lines up the numbers and counts the glossary by pool', () => {
    const run = startRun(emptySave(), 'dev', 'a', 1).runs.dev!;
    const model = resultModel(
      {
        ...run,
        finished: true,
        attempts: 6,
        beaten: {
          0: { flawless: true, score: 1000 },
          1: { flawless: false, score: 1000 },
        },
        stats: {
          exchangesWon: 23,
          exchangesLost: 9,
          micDrops: 3,
          missesByPool: { pm: 2, dev: 0, designer: 1 },
          speed: 0,
        },
      },
      ['pm-1', 'pm-2', 'dev-1', 'des-4', 'dev-mic-1'],
    );
    assert.equal(model.finished, true);
    assert.deepEqual(model.rows, [
      ['Duels', '6'],
      ['Flawless', '1'],
      ['Exchanges', '23–9'],
      ['Mic drops', '3'],
    ]);
    assert.deepEqual(model.pools, [
      { role: 'pm', collected: 2, total: 16, missed: 2 },
      { role: 'dev', collected: 1, total: 16, missed: 0 },
      { role: 'designer', collected: 1, total: 16, missed: 1 },
    ]);
    // The closers are not in the glossary's count
    assert.deepEqual(model.glossary, { collected: 4, total: 48 });
  });
});
