'use client';

import { useEffect } from 'react';

import { effect } from './audio/engine';

/**
 * Key handlers for a screen, by `event.key`; active while mounted.
 * Escape goes back, so it sounds like it, unless `quiet` (the duel's
 * pause has sounds of its own).
 */
export const useKeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  active = true,
  quiet = false,
) => {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        if (event.key === 'Escape' && !quiet) effect('cancel');
        handler(event);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers, active, quiet]);
};
