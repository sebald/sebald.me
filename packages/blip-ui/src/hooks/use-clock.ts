'use client';

import { useEffect, useState } from 'react';

/** One step of the clock, 8 frames a second (`--bui-tick`) */
export const TICK_MS = 125;

/** The visitor asked the OS for less motion: nothing blinks or slides */
export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' &&
  matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A clock in `tick` steps since mount (125 ms by default), for a piece that animates on its
 * own (a character breathing, the ghost hovering). Stopped, it stays at
 * zero, which is every animation's resting frame.
 */
export const useClock = (running = true, tick = TICK_MS): number => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    let last = -1;
    const start = performance.now();
    const loop = (now: number) => {
      const steps = Math.floor((now - start) / tick);
      if (steps !== last) {
        last = steps;
        setElapsed(steps * tick);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running, tick]);
  return running ? elapsed : 0;
};
