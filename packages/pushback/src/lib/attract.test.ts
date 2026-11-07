import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { demoFor } from './attract';
import { PLAYER_SHEETS } from './sprites';

describe('demoFor', () => {
  it('pits a look against a colleague of another role on another sheet', () => {
    for (let seed = 1; seed < 40; seed++) {
      const { look, setup } = demoFor(seed);
      assert.notEqual(setup.character.role, setup.role);
      assert.notEqual(setup.character.role, 'boss');
      assert.notEqual(setup.character.sheet, PLAYER_SHEETS[setup.role][look]);
      assert.equal(setup.silence, false);
      assert.equal(setup.buddy, false);
      assert.equal(setup.tutorial, false);
      assert.ok(setup.collected.length >= 16);
    }
  });

  it('is the same demo for the same seed', () => {
    assert.deepEqual(demoFor(7), demoFor(7));
  });
});
