import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { holdsKeys, joinKeyScope } from './key-layer.ts';

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
    const leave = joinKeyScope(null, only);
    assert.equal(holdsKeys(null, only), true);
    leave();
  });

  it('go to the first menu on the page until one is used', () => {
    const second = menu(2);
    const first = menu(1);
    const leaves = [joinKeyScope(null, second), joinKeyScope(null, first)];
    assert.equal(holdsKeys(null, first), true);
    assert.equal(holdsKeys(null, second), false);
    leaves.forEach(leave => leave());
  });

  it('follow the last pointer press, and the focus moving in', () => {
    const a = menu(1);
    const b = menu(2);
    const leaves = [joinKeyScope(null, a), joinKeyScope(null, b)];
    press(b, 'pointerdown');
    assert.deepEqual([holdsKeys(null, a), holdsKeys(null, b)], [false, true]);
    press(a, 'focusin');
    assert.deepEqual([holdsKeys(null, a), holdsKeys(null, b)], [true, false]);
    leaves.forEach(leave => leave());
  });

  it('fall back to the first when the claimed menu goes', () => {
    const a = menu(1);
    const b = menu(2);
    const leaveA = joinKeyScope(null, a);
    const leaveB = joinKeyScope(null, b);
    press(b, 'pointerdown');
    leaveB();
    assert.equal(holdsKeys(null, a), true);
    leaveA();
  });

  it('are kept apart per layer, so a dialog has its own', () => {
    const layer = Symbol('dialog');
    const screen = menu(1);
    const dialog = menu(2);
    const leaves = [joinKeyScope(null, screen), joinKeyScope(layer, dialog)];
    press(screen, 'pointerdown');
    assert.equal(holdsKeys(layer, dialog), true);
    assert.equal(holdsKeys(null, screen), true);
    leaves.forEach(leave => leave());
  });

  it('are nobody’s once every menu has left', () => {
    const only = menu(0);
    joinKeyScope(null, only)();
    assert.equal(holdsKeys(null, only), false);
  });
});
