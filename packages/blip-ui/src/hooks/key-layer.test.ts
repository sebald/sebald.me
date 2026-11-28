import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { focusTakes, holdsKeys, joinKeyScope } from './key-layer.ts';

/** A stand-in for an element: events, and a place on the page */
class Fake extends EventTarget {
  constructor(private at: number) {
    super();
  }
  compareDocumentPosition(other: Fake) {
    return other.at > this.at ? 4 : 2;
  }
}
const menu = (at: number) => new Fake(at) as unknown as HTMLElement;
const press = (element: HTMLElement, type: string) =>
  element.dispatchEvent(new Event(type));

describe('keys between menus on one layer', () => {
  it('go to the only menu with no click first', () => {
    const only = menu(0);
    const leave = joinKeyScope('menu', null, only);
    assert.equal(holdsKeys('menu', null, only), true);
    leave();
  });

  it('go to the first menu on the page until one is used', () => {
    const second = menu(2);
    const first = menu(1);
    const leaves = [
      joinKeyScope('menu', null, second),
      joinKeyScope('menu', null, first),
    ];
    assert.equal(holdsKeys('menu', null, first), true);
    assert.equal(holdsKeys('menu', null, second), false);
    leaves.forEach(leave => leave());
  });

  it('follow the last pointer press, and the focus moving in', () => {
    const a = menu(1);
    const b = menu(2);
    const leaves = [
      joinKeyScope('menu', null, a),
      joinKeyScope('menu', null, b),
    ];
    press(b, 'pointerdown');
    assert.deepEqual(
      [holdsKeys('menu', null, a), holdsKeys('menu', null, b)],
      [false, true],
    );
    press(a, 'focusin');
    assert.deepEqual(
      [holdsKeys('menu', null, a), holdsKeys('menu', null, b)],
      [true, false],
    );
    leaves.forEach(leave => leave());
  });

  it('fall back to the first when the claimed menu goes', () => {
    const a = menu(1);
    const b = menu(2);
    const leaveA = joinKeyScope('menu', null, a);
    const leaveB = joinKeyScope('menu', null, b);
    press(b, 'pointerdown');
    leaveB();
    assert.equal(holdsKeys('menu', null, a), true);
    leaveA();
  });

  it('are kept apart per layer, so a dialog has its own', () => {
    const layer = Symbol('dialog');
    const screen = menu(1);
    const dialog = menu(2);
    const leaves = [
      joinKeyScope('menu', null, screen),
      joinKeyScope('menu', layer, dialog),
    ];
    press(screen, 'pointerdown');
    assert.equal(holdsKeys('menu', layer, dialog), true);
    assert.equal(holdsKeys('menu', null, screen), true);
    leaves.forEach(leave => leave());
  });

  it('are kept apart per kind, so tabs in a menu keep theirs', () => {
    const tabs = menu(1);
    const list = menu(2);
    const leaves = [
      joinKeyScope('tabs', null, tabs),
      joinKeyScope('menu', null, list),
    ];
    press(list, 'pointerdown');
    assert.equal(holdsKeys('tabs', null, tabs), true);
    leaves.forEach(leave => leave());
  });

  it('are nobody’s once every menu has left', () => {
    const only = menu(0);
    joinKeyScope('menu', null, only)();
    assert.equal(holdsKeys('menu', null, only), false);
  });
});

/** A focused stepper, as `focusTakes` reads it: its slot, role and attributes */
const stepper = (role: 'switch' | 'slider') => {
  const attributes: Record<string, string> = {
    role,
    'data-slot': 'stepper',
    ...(role === 'slider' ? { 'aria-orientation': 'horizontal' } : {}),
  };
  const element = {
    getAttribute: (name: string) => attributes[name] ?? null,
    closest: (selector: string) =>
      selector
        .split(',')
        .some(one => one === `[role=${role}]` || one === '[data-slot=stepper]')
        ? element
        : null,
  };
  return element;
};
const keyOn = (target: unknown, key: string) =>
  ({ key, target }) as unknown as KeyboardEvent;

describe('a focused stepper', () => {
  for (const role of ['switch', 'slider'] as const)
    it(`takes Left, Right, Enter and Space, and leaves Up and Down (${role})`, () => {
      const target = stepper(role);
      for (const key of ['ArrowLeft', 'ArrowRight', 'Enter', ' '])
        assert.equal(focusTakes(keyOn(target, key)), true, key);
      for (const key of ['ArrowUp', 'ArrowDown'])
        assert.equal(focusTakes(keyOn(target, key)), false, key);
    });
});
