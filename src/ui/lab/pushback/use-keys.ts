'use client';

import { useEffect } from 'react';

/** Key handlers for a screen, by `event.key`; active while mounted */
export const useKeys = (
  handlers: Record<string, (event: KeyboardEvent) => void>,
  active = true,
) => {
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      const handler = handlers[event.key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlers, active]);
};
