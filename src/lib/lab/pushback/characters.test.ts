import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BOSS_SLOT_INDEX,
  CHARACTERS,
  SLOTS,
  characterById,
  drawRun,
  repertoire,
  roleOrder,
} from './characters';
import { ROLES, pairById } from './lines';

describe('roleOrder', () => {
  it('meets its own role first, then the two foreign ones', () => {
    assert.deepEqual(roleOrder('pm'), ['pm', 'dev', 'designer']);
    assert.deepEqual(roleOrder('dev'), ['dev', 'designer', 'pm']);
    assert.deepEqual(roleOrder('designer'), ['designer', 'pm', 'dev']);
  });
});

describe('drawRun', () => {
  it('draws two distinct characters per role in the role order', () => {
    const run = drawRun('pm', 7);
    assert.equal(run.slots.length, 7);
    const roles = run.slots.map(s => characterById(s.character).role);
    assert.deepEqual(roles, [
      'pm',
      'pm',
      'dev',
      'dev',
      'designer',
      'designer',
      'boss',
    ]);
    const ids = run.slots.map(s => s.character);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(run.outOfOffice.length, 3);
    assert.ok(run.outOfOffice.every(id => !ids.includes(id)));
  });

  it('applies the slot table by position', () => {
    const run = drawRun('dev', 1);
    assert.deepEqual(
      run.slots.map(s => s.slot),
      [...SLOTS],
    );
    assert.equal(run.slots[BOSS_SLOT_INDEX]?.character, 'stakeholder');
  });

  it('is deterministic under a seed and varies across seeds', () => {
    assert.deepEqual(drawRun('designer', 42), drawRun('designer', 42));
    const casts = new Set(
      Array.from({ length: 20 }, (_, seed) =>
        drawRun('designer', seed)
          .slots.map(s => s.character)
          .join(','),
      ),
    );
    assert.ok(casts.size > 1);
  });
});

describe('cast', () => {
  it('has three characters per role and the boss', () => {
    for (const role of ROLES) {
      assert.equal(CHARACTERS.filter(c => c.role === role).length, 3, role);
    }
    assert.equal(CHARACTERS.filter(c => c.role === 'boss').length, 1);
  });

  it('knows one or two pairs from other pools', () => {
    for (const character of CHARACTERS.filter(c => c.role !== 'boss')) {
      assert.ok(
        character.knows.length >= 1 && character.knows.length <= 2,
        character.id,
      );
      for (const id of character.knows) {
        assert.notEqual(
          pairById(id).role,
          character.role,
          `${character.id} ${id}`,
        );
      }
      assert.equal(repertoire(character).length, 8 + character.knows.length);
    }
    assert.deepEqual(repertoire(characterById('stakeholder')), []);
  });
});
