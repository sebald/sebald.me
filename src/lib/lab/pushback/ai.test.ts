import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  aiAnswers,
  aiDropsMic,
  aiPick,
  answerTo,
  buildMenu,
  drawHand,
} from './ai';
import { type PairId, pairById, poolOf } from './lines';
import { Rng, seedRng } from './random';

const rng = (seed = 1) => new Rng(seedRng(seed));
const pool = poolOf('dev').map(p => p.id);

describe('buildMenu', () => {
  it('contains the right counter once and has the asked size', () => {
    const menu = buildMenu('pm-2', 'any', 4, rng());
    assert.equal(menu.length, 4);
    assert.equal(menu.filter(id => id === 'pm-2').length, 1);
    assert.equal(new Set(menu).size, 4);
  });

  it('draws same-pool decoys from the phrase pool only', () => {
    const menu = buildMenu('des-3', 'same', 6, rng(3));
    assert.ok(menu.every(id => pairById(id).role === 'designer'));
  });

  it('draws two-pool decoys from the own pool and one other', () => {
    const menu = buildMenu('dev-1', 'two', 8, rng(5));
    const roles = new Set(menu.map(id => pairById(id).role));
    assert.ok(roles.has('dev'));
    assert.equal(roles.size, 2);
  });

  it('answers a boss phrase with its mapped counter', () => {
    assert.equal(answerTo('boss-4'), 'dev-4');
    const menu = buildMenu('boss-4', 'all', 6, rng());
    assert.ok(menu.includes('dev-4'));
  });

  it('is deterministic under a seed', () => {
    assert.deepEqual(
      buildMenu('pm-1', 'any', 6, rng(9)),
      buildMenu('pm-1', 'any', 6, rng(9)),
    );
  });
});

describe('aiAnswers', () => {
  it('always answers its repertoire and the boss answers everything', () => {
    for (let seed = 0; seed < 50; seed++) {
      assert.ok(aiAnswers('dev-3', pool, 0, rng(seed)));
      assert.ok(aiAnswers('pm-3', 'all', 0, rng(seed)));
    }
  });

  it('answers foreign pools with the slot accuracy', () => {
    const r = rng(11);
    let right = 0;
    for (let i = 0; i < 2000; i++) if (aiAnswers('pm-1', pool, 0.6, r)) right++;
    assert.ok(right > 1100 && right < 1300, `${right}`);
  });

  it('tires: fatigue comes off the repertoire and the foreign pools alike', () => {
    for (let seed = 0; seed < 50; seed++) {
      assert.ok(aiAnswers('dev-3', pool, 0, rng(seed), 0));
      assert.ok(!aiAnswers('dev-3', pool, 0, rng(seed), 1));
      assert.ok(!aiAnswers('pm-3', pool, 0.6, rng(seed), 0.6));
    }
    const r = rng(12);
    let right = 0;
    for (let i = 0; i < 2000; i++)
      if (aiAnswers('dev-3', pool, 0, r, 0.3)) right++;
    assert.ok(right > 1300 && right < 1500, `${right}`);
  });
});

describe('aiPick', () => {
  const collected: PairId[] = ['dev-1', 'dev-2', 'dev-3'];

  it('throws uncollected pairs first on a first attempt and a replay', () => {
    for (const attempt of ['first', 'replay'] as const) {
      for (let turn = 0; turn < 5; turn++) {
        const pick = aiPick(
          pool,
          { collected, thrown: [], attempt, turn },
          rng(turn),
        );
        assert.ok(!collected.includes(pick), `${attempt} ${turn} ${pick}`);
      }
    }
  });

  it('alternates on a retry, collected first', () => {
    const even = aiPick(
      pool,
      { collected, thrown: [], attempt: 'retry', turn: 0 },
      rng(),
    );
    const odd = aiPick(
      pool,
      { collected, thrown: [], attempt: 'retry', turn: 1 },
      rng(),
    );
    assert.ok(collected.includes(even));
    assert.ok(!collected.includes(odd));
  });

  it('never repeats within a duel until the pool is used up', () => {
    const thrown: PairId[] = [];
    for (let turn = 0; turn < 8; turn++) {
      const pick = aiPick(
        pool,
        { collected: pool, thrown, attempt: 'first', turn },
        rng(turn),
      );
      assert.ok(!thrown.includes(pick));
      thrown.push(pick);
    }
    assert.equal(new Set(thrown).size, 8);
    const again = aiPick(
      pool,
      { collected: pool, thrown, attempt: 'first', turn: 8 },
      rng(),
    );
    assert.ok(pool.includes(again));
  });
});

describe('aiDropsMic', () => {
  const base = { momentumFull: true, remaining: 3, worth: 2 };

  it('tiers 1 and 2 drop as soon as the bar is full', () => {
    assert.ok(aiDropsMic(1, base));
    assert.ok(aiDropsMic(2, base));
    assert.ok(!aiDropsMic(2, { ...base, momentumFull: false }));
  });

  it('tier 3 holds it until the hit would end the duel', () => {
    assert.ok(!aiDropsMic(3, base));
    assert.ok(aiDropsMic(3, { ...base, remaining: 2 }));
  });
});

describe('drawHand', () => {
  it('draws only collected phrases, unspent first, and shrinks', () => {
    const hand = drawHand(collected3(), ['dev-1'], 4, rng());
    assert.deepEqual([...hand].sort(), ['dev-2', 'dev-3']);
  });

  it('brings spent phrases back once all are used', () => {
    const hand = drawHand(collected3(), collected3(), 4, rng());
    assert.equal(hand.length, 3);
  });
});

const collected3 = (): PairId[] => ['dev-1', 'dev-2', 'dev-3'];
