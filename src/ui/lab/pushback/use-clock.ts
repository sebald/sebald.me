'use client';

import { useEffect, useState } from 'react';

import { FRAME_MS } from '@/lib/lab/pushback/stage';

/** The visitor asked the OS for less motion: nothing blinks or slides */
export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A clock in 125 ms steps since mount, for a piece that animates on its
 * own (a character breathing, the ghost hovering). Stopped, it stays at
 * zero, which is every animation's resting frame.
 */
export const useClock = (running = true): number => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = -1;
    const start = performance.now();
    const loop = (now: number) => {
      const steps = Math.floor((now - start) / FRAME_MS);
      if (steps !== last) {
        last = steps;
        setElapsed(steps * FRAME_MS);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  return running ? elapsed : 0;
};
