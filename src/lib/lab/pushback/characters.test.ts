import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BOSS_SLOT,
  bossIndex,
  CHARACTERS,
  DECK_PER_POOL,
  SLOTS,
  characterById,
  drawDeck,
  drawRun,
  repertoireFor,
  roleOrder,
  stepMode,
} from './characters';
import { BOSS_ANSWERS, ROLES, deckPool, pairById } from './lines';
import { Rng, seedRng } from './random';

describe('roleOrder', () => {
  it('meets its own role first, then the two foreign ones', () => {
    assert.deepEqual(roleOrder('pm'), ['pm', 'dev', 'designer']);
    assert.deepEqual(roleOrder('dev'), ['dev', 'designer', 'pm']);
    assert.deepEqual(roleOrder('designer'), ['designer', 'pm', 'dev']);
  });
});

describe('drawDeck', () => {
  it('draws eight of each pool, two of them boss answers, in id order', () => {
    const deck = drawDeck(new Rng(seedRng(3)));
    assert.equal(deck.length, DECK_PER_POOL * ROLES.length);
    assert.equal(new Set(deck).size, deck.length);
    for (const role of ROLES) {
      const pool = deckPool(deck, role);
      assert.equal(pool.length, DECK_PER_POOL, role);
      assert.equal(pool.filter(id => BOSS_ANSWERS.has(id)).length, 2, role);
      const numbers = pool.map(id => Number(id.split('-')[1]));
      assert.deepEqual(
        numbers,
        [...numbers].sort((a, b) => a - b),
      );
    }
  });

  it('varies across seeds', () => {
    const decks = new Set(
      Array.from({ length: 10 }, (_, seed) =>
        drawDeck(new Rng(seedRng(seed + 1))).join(','),
      ),
    );
    assert.ok(decks.size > 5);
  });
});

describe('drawRun', () => {
  it('draws one colleague per role, the own role first, no face twice', () => {
    const run = drawRun('pm', 'a', 7);
    const roles = run.slots.map(s => characterById(s.character).role);
    assert.equal(roles[0], 'pm');
    assert.deepEqual(roles.slice(1, 3).sort(), ['designer', 'dev']);
    assert.equal(roles[3], 'boss');
    assert.equal(run.slots.length, 4);
    const ids = run.slots.map(s => s.character);
    assert.equal(new Set(ids).size, ids.length);
    const sheets = run.slots.map(s => characterById(s.character).sheet);
    assert.equal(new Set(sheets).size, sheets.length);
    // Jo is a PM look and a colleague's sheet: never across from herself
    assert.ok(!sheets.includes('pm-jo'));
    assert.equal(run.outOfOffice.length, 6);
    assert.ok(run.outOfOffice.every(id => !ids.includes(id)));
    assert.equal(run.deck.length, DECK_PER_POOL * ROLES.length);
  });

  it('applies the slot table by position', () => {
    const run = drawRun('dev', 'b', 1);
    assert.deepEqual(
      run.slots.map(s => s.slot),
      [SLOTS[0], SLOTS[1], SLOTS[2], BOSS_SLOT],
    );
    assert.equal(run.slots[bossIndex(run)]?.character, 'stakeholder');
    assert.equal(bossIndex(run), run.slots.length - 1);
  });

  it('is deterministic under a seed and varies across seeds', () => {
    assert.deepEqual(
      drawRun('designer', 'a', 42),
      drawRun('designer', 'a', 42),
    );
    const casts = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        drawRun('designer', 'b', seed)
          .slots.map(s => s.character)
          .join(','),
      ),
    );
    assert.ok(casts.size > 1);
    const orders = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        drawRun('designer', 'b', seed)
          .slots.map(s => characterById(s.character).role)
          .join(','),
      ),
    );
    assert.equal(orders.size, 2);
  });
});

describe('cast', () => {
  it('has three characters per role and the boss', () => {
    for (const role of ROLES) {
      assert.equal(CHARACTERS.filter(c => c.role === role).length, 3, role);
    }
    assert.equal(CHARACTERS.filter(c => c.role === 'boss').length, 1);
  });

  it('knows one or two pairs from other pools of the deck', () => {
    const deck = drawDeck(new Rng(seedRng(5)));
    for (const character of CHARACTERS.filter(c => c.role !== 'boss')) {
      assert.ok(character.knows >= 1 && character.knows <= 2, character.id);
      const lines = repertoireFor(character, deck, 9);
      assert.equal(lines.length, DECK_PER_POOL + character.knows);
      assert.deepEqual(lines, repertoireFor(character, deck, 9));
      for (const id of lines) {
        assert.ok(deck.includes(id), `${character.id} ${id}`);
      }
      const foreign = lines.filter(id => pairById(id).role !== character.role);
      assert.equal(foreign.length, character.knows);
    }
    assert.deepEqual(repertoireFor(characterById('stakeholder'), deck, 1), []);
  });
});

describe('stepMode', () => {
  it('steps left and right through the modes, stopping at the ends', () => {
    assert.equal(stepMode('normal', 1), 'hard');
    assert.equal(stepMode('normal', -1), 'easy');
    assert.equal(stepMode('hard', 1), 'hard');
    assert.equal(stepMode('easy', -1), 'easy');
  });
});
