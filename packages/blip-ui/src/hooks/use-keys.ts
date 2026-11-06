'use client';

import { useEffect } from 'react';

import { useFeedback } from '../providers/feedback';
import { focusTakes, useOnTop } from './key-layer';

/**
 * Key handlers for a screen, by `event.key`; active while mounted and
 * on top (a dialog over the screen takes its keys while it is open).
 * Escape goes back, so it sounds like it (`back`), unless `quiet` (a
 * screen with sounds of its own).
 */
export const useKeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  active = true,
  quiet = false,
) => {
  const play = useFeedback();
  const onTop = useOnTop();
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (!onTop() || focusTakes(event)) return;
      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        if (event.key === 'Escape' && !quiet) play('back');
        handler(event);
      }
    };
    // In the capture phase: a dialog's popup stops the arrow keys on their
    // way up, and the keys are the top layer's wherever the focus is
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [handlers, active, quiet, play, onTop]);
};
