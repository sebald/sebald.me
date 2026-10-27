import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BOSS_ANSWERS,
  BOSS_PAIRS,
  MAX_LINE_LENGTH,
  PAIRS,
  ROLES,
  allLines,
  pairById,
  poolOf,
  poolOfPhrase,
} from './lines';

describe('pairs', () => {
  it('has sixteen pairs per pool with unique ids', () => {
    for (const role of ROLES) {
      assert.equal(poolOf(role).length, 16, role);
    }
    assert.equal(new Set(PAIRS.map(p => p.id)).size, PAIRS.length);
  });

  it('numbers the ids per pool', () => {
    assert.deepEqual(
      poolOf('designer').map(p => p.id),
      Array.from({ length: 16 }, (_, n) => `des-${n + 1}`),
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
    for (const line of allLines()) {
      assert.ok(
        line.length <= MAX_LINE_LENGTH,
        `${line.length} chars: ${line}`,
      );
    }
  });
});
