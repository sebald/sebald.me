import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isToggle, stepTo } from './stepper.keys.ts';

describe('a stepper', () => {
  it('is a switch only for Off and On', () => {
    assert.equal(isToggle(['Off', 'On']), true);
    assert.equal(isToggle(['On', 'Off']), false);
    assert.equal(isToggle(['Normal', 'Hard']), false);
    assert.equal(isToggle(['Slow', 'Normal', 'Fast']), false);
  });

  it('steps on with Right, Enter and Space, and back with Left, round past the ends', () => {
    assert.equal(stepTo('ArrowRight', 0, 3), 1);
    assert.equal(stepTo('Enter', 2, 3), 0);
    assert.equal(stepTo(' ', 1, 3), 2);
    assert.equal(stepTo('ArrowLeft', 0, 3), 2);
  });

  it('flips two values on every one of its keys', () => {
    for (const key of ['ArrowLeft', 'ArrowRight', 'Enter', ' '])
      assert.equal(stepTo(key, 0, 2), 1, key);
  });

  it('goes to the ends on Home and End', () => {
    assert.equal(stepTo('Home', 2, 3), 0);
    assert.equal(stepTo('End', 0, 2), 1);
  });

  it('leaves Up and Down, and steps nowhere with one value', () => {
    assert.equal(stepTo('ArrowUp', 0, 3), null);
    assert.equal(stepTo('ArrowDown', 0, 3), null);
    assert.equal(stepTo('ArrowRight', 0, 1), null);
  });
});
