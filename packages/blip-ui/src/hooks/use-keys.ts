'use client';

import { useEffect } from 'react';

import { useFeedback } from '../providers/feedback';

/**
 * Key handlers for a screen, by `event.key`; active while mounted.
 * Escape goes back, so it sounds like it (`back`), unless `quiet` (a
 * screen with sounds of its own).
 */
export const useKeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  active = true,
  quiet = false,
) => {
  const play = useFeedback();
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        if (event.key === 'Escape' && !quiet) play('back');
        handler(event);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers, active, quiet, play]);
};
