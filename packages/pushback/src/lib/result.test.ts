import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PairId } from './lines';
import { resultCardText, resultModel } from './result';
import { emptySave, startRun } from './save';

describe('resultCardText', () => {
  it('prints the card from the spec', () => {
    const run = startRun(emptySave(), 'dev', 'a', 1).run!;
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
        ...Array.from({ length: 16 }, (_, i) => `pm-${i + 1}` as PairId),
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
        'Exchanges 31–9 · Mic drops 6 · Glossary 24/60',
        'Missed counters: PM 3 · Dev 1 · Designer 5',
        'sebald.me/lab/pushback',
      ].join('\n'),
    );
  });

  it('says the boss took it offline on a lost run', () => {
    const run = startRun(emptySave(), 'pm', 'a', 1).run!;
    assert.match(
      resultCardText(run),
      /^Pushback · PM\nStakeholder took it offline · 0 duels · 0 flawless · easy mode\nScore 0\n/,
    );
  });
});

describe('resultModel', () => {
  it('lines up the numbers and counts the glossary by pool', () => {
    const run = startRun(emptySave(), 'dev', 'a', 1).run!;
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
      { role: 'pm', collected: 2, total: 20, missed: 2 },
      { role: 'dev', collected: 1, total: 20, missed: 0 },
      { role: 'designer', collected: 1, total: 20, missed: 1 },
    ]);
    // The closers are not in the glossary's count
    assert.deepEqual(model.glossary, { collected: 4, total: 60 });
  });
});
