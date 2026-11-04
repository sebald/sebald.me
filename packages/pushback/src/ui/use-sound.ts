'use client';

import { useEffect, useSyncExternalStore } from 'react';

import type { Cue } from '../lib/audio/music';
import { DEFAULT_SOUND } from '../lib/audio/settings';
import {
  arm,
  canPlay,
  getSettings,
  music,
  subscribe,
  toggleSound,
} from './audio/engine';

/** The sound switches, live */
export const useSoundSettings = () =>
  useSyncExternalStore(subscribe, getSettings, () => DEFAULT_SOUND);

/** The game is on the page: once, at its root, so its screens can make sound */
export const useSoundArm = () => useEffect(() => arm(), []);

/**
 * The music this screen wants while it is shown; `undefined` leaves it to
 * a screen inside (the duel picks its own)
 */
export const useMusic = (cue: Cue | null | undefined, quiet = false) => {
  useEffect(() => {
    if (cue !== undefined) music(cue, { quiet });
  }, [cue, quiet]);
};

/**
 * M mutes and unmutes, on every screen and mid-duel. Taken before the
 * screens hear it, so it is not the any key that starts or ends the demo.
 */
export const useMuteKey = () =>
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'm') return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat)
        return;
      if (!canPlay()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleSound();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);
