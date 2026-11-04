'use client';

import { useEffect, useState } from 'react';

/**
 * The element that goes fullscreen (`Game`): around every screen, so
 * moving from one to the next (each renders its own stage) keeps it
 */
const root = () => document.querySelector<HTMLElement>('[data-pushback-root]');

/**
 * Whether the browser lets the game go fullscreen: Android's browsers and
 * desktops do, an iPhone does not (only video goes fullscreen there)
 */
export const canFullscreen = () =>
  typeof document !== 'undefined' &&
  document.fullscreenEnabled === true &&
  root() !== null;

export const isFullscreen = () =>
  typeof document !== 'undefined' && document.fullscreenElement !== null;

/** Into fullscreen or out of it; only from a tap or a key, as browsers ask */
export const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    void document.exitFullscreen().catch(() => {});
    return;
  }
  void root()
    ?.requestFullscreen({ navigationUI: 'hide' })
    .catch(() => {});
};

/** Whether the game is fullscreen, following the browser's own way out (back, a swipe) */
export const useFullscreen = (): boolean => {
  const [on, setOn] = useState(isFullscreen);
  useEffect(() => {
    const onChange = () => setOn(isFullscreen());
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  return on;
};
