'use client';

import { useFeedback } from '../providers/feedback';
import { useKeydown } from './key-layer';

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
  useKeydown(event => {
    const handler = handlers[event.key];
    if (!handler) return;
    event.preventDefault();
    if (event.key === 'Escape' && !quiet) play('back');
    handler(event);
  }, active);
};
