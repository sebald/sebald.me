'use client';

import { useEffect, useEffectEvent } from 'react';

/**
 * Calls `onIdle` once nobody has pressed a key or touched the screen
 * for `ms`: the title's attract mode. Any input starts the wait again.
 */
export const useIdle = (ms: number, onIdle: () => void, active = true) => {
  // The latest callback, without starting the wait again on a render
  const idle = useEffectEvent(onIdle);
  useEffect(() => {
    if (!active) return;
    let timer = setTimeout(() => idle(), ms);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => idle(), ms);
    };
    window.addEventListener('keydown', reset, true);
    window.addEventListener('pointerdown', reset, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', reset, true);
      window.removeEventListener('pointerdown', reset, true);
    };
  }, [ms, active]);
};
