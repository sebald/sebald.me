'use client';

import { useEffect, useEffectEvent } from 'react';

import { focusTakes, useOnTop } from './key-layer';

/** Keys that only modify or move the focus: not a press */
const MODIFIERS = new Set([
  'Shift',
  'Control',
  'Alt',
  'Meta',
  'CapsLock',
  'Tab',
]);

/**
 * Any key or a tap, for "press start", "tap to continue" and leaving a
 * demo. A tap counts on its click, not its press: whatever opens under
 * the finger would take the rest of it. It listens from a task after it
 * turns on, so the press that opened the screen does not count too, and
 * only on its layer (a dialog over it takes the presses). Plays nothing:
 * what it does decides how it sounds.
 */
export const useAnyKey = (onPress: () => void, active = true) => {
  const onTop = useOnTop();
  // The latest callback, without listening anew (and a task late) on a render
  const press = useEffectEvent(onPress);
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (MODIFIERS.has(event.key) || !onTop() || focusTakes(event)) return;
      event.preventDefault();
      press();
    };
    const onClick = () => {
      if (onTop()) press();
    };
    const start = setTimeout(() => {
      window.addEventListener('keydown', onKey, true);
      window.addEventListener('click', onClick);
    });
    return () => {
      clearTimeout(start);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('click', onClick);
    };
  }, [active, onTop]);
};
