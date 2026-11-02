'use client';

import { useEffect, useSyncExternalStore } from 'react';

import type { Cue } from '@/lib/lab/pushback/audio/music';
import { DEFAULT_SOUND } from '@/lib/lab/pushback/audio/settings';

import { arm, getSettings, music, subscribe } from './audio/engine';

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
