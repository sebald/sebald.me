import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CHARACTERS } from './characters';
import {
  BOSS_ANSWERS,
  BOSS_PAIRS,
  CLOSERS,
  CLOSERS_PER_ROLE,
  MAX_LINE_LENGTH,
  PAIRS,
  POOL_SIZE,
  ROLES,
  allLines,
  inTurn,
  closersOf,
  isCloserId,
  isPairId,
  pairById,
  poolOf,
  poolOfPhrase,
  poolPairs,
} from './lines';

describe('pairs', () => {
  it('has twenty pairs per pool with unique ids', () => {
    for (const role of ROLES) {
      assert.equal(poolOf(role).length, POOL_SIZE, role);
    }
    assert.equal(new Set(PAIRS.map(p => p.id)).size, PAIRS.length);
  });

  it('has three closers per role, with ids of their own', () => {
    for (const role of ROLES) {
      const own = closersOf(role);
      assert.equal(own.length, CLOSERS_PER_ROLE);
      assert.ok(own.every(pair => isCloserId(pair.id) && isPairId(pair.id)));
      assert.ok(own.every(pair => pairById(pair.id) === pair));
    }
    assert.equal(new Set(CLOSERS.map(p => p.id)).size, CLOSERS.length);
    assert.ok(PAIRS.every(pair => !isCloserId(pair.id)));
    assert.deepEqual(
      poolPairs([...PAIRS, ...CLOSERS].map(p => p.id)).length,
      PAIRS.length,
    );
  });

  it('numbers the ids per pool', () => {
    assert.deepEqual(
      poolOf('designer').map(p => p.id),
      Array.from({ length: POOL_SIZE }, (_, n) => `des-${n + 1}`),
    );
  });
});

describe('boss pairs', () => {
  it('each boss phrase has exactly one answering pair that exists', () => {
    for (const boss of BOSS_PAIRS) {
      assert.ok(pairById(boss.answeredBy), boss.id);
    }
    assert.equal(new Set(BOSS_PAIRS.map(b => b.id)).size, BOSS_PAIRS.length);
  });

  it('answers four boss phrases from each pool, each with its own counter', () => {
    assert.equal(BOSS_ANSWERS.size, BOSS_PAIRS.length);
    for (const role of ROLES) {
      assert.equal(
        poolOf(role).filter(p => BOSS_ANSWERS.has(p.id)).length,
        4,
        role,
      );
    }
  });

  it('counts a boss phrase as the pool of its counter', () => {
    assert.equal(poolOfPhrase('boss-1'), 'pm');
    assert.equal(poolOfPhrase('boss-5'), 'dev');
    assert.equal(poolOfPhrase('des-2'), 'designer');
  });
});

describe('lines', () => {
  it('fit two rows of the dialogue box', () => {
    const intros = CHARACTERS.flatMap(character => character.intros);
    for (const line of [...allLines(), ...intros]) {
      assert.ok(
        line.length <= MAX_LINE_LENGTH,
        `${line.length} chars: ${line}`,
      );
    }
  });
  it('gives every character three intros', () => {
    for (const character of CHARACTERS) {
      assert.equal(character.intros.length, 3, character.id);
    }
  });

  it('opens no two counters of a pool the same way', () => {
    const opening = (line: string) =>
      line
        .toLowerCase()
        .split(/[ ,.]+/)
        .slice(0, 2)
        .join(' ');
    for (const role of ROLES) {
      const counters = [...poolOf(role), ...closersOf(role)].map(
        p => p.counter,
      );
      const seen = new Map<string, string>();
      for (const counter of counters) {
        const word = opening(counter);
        assert.ok(!seen.has(word), `${seen.get(word)} / ${counter}`);
        seen.set(word, counter);
      }
    }
  });

  it('picks a line in turn and wraps', () => {
    const lines = ['a', 'b', 'c'];
    assert.equal(inTurn(lines), 'a');
    assert.equal(inTurn(lines, 4), 'b');
    assert.equal(inTurn(lines, -1), 'b');
  });
});
