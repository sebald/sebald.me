import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEMO_ACCURACY, demoAction, demoFor } from './attract';
import { createDuel } from './duel';
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

describe('demoAction', () => {
  const base = createDuel(demoFor(3).setup);
  const [a, b, c] = base.collected;
  const attack = { ...base, phase: 'attack' as const, hand: [a!, b!, c!] };
  const defend = {
    ...base,
    phase: 'defend' as const,
    menu: [a!, b!, c!],
    exchange: { answer: b! } as NonNullable<typeof base.exchange>,
  };

  it('throws the closer when one is on offer, without a random call', () => {
    let calls = 0;
    const move = demoAction({ ...attack, closer: c! }, () => (calls++, 0));
    assert.deepEqual(move, { type: 'throw', phrase: c });
    assert.equal(calls, 0);
  });

  it('throws a phrase from the hand otherwise', () => {
    assert.deepEqual(
      demoAction({ ...attack, closer: null }, () => 0.5),
      {
        type: 'throw',
        phrase: b,
      },
    );
  });

  it('answers under the accuracy, takes a decoy over it', () => {
    assert.deepEqual(
      demoAction(defend, () => DEMO_ACCURACY - 0.01),
      {
        type: 'counter',
        phrase: b,
      },
    );
    assert.deepEqual(
      demoAction(defend, () => 0.99),
      {
        type: 'counter',
        phrase: c,
      },
    );
  });

  it('answers when there is no decoy to take', () => {
    assert.deepEqual(
      demoAction({ ...defend, menu: [b!] }, () => 0.99),
      {
        type: 'counter',
        phrase: b,
      },
    );
  });

  it('does nothing outside a menu', () => {
    assert.equal(
      demoAction({ ...base, phase: 'resolve' }, () => 0),
      undefined,
    );
  });
});
