/**
 * The sound switches, per viewer and apart from the save: erasing the
 * save keeps them. Off by default; nothing plays until the player turns
 * it on.
 */
import { type KeyValueStorage, readJson, writeJson } from '../storage';

export interface SoundSettings {
  music: boolean;
  effects: boolean;
}

export const SOUND_KEY = 'pushback-sound';

export const DEFAULT_SOUND: SoundSettings = { music: false, effects: false };

/** What the settings need from `localStorage` */
export type SoundStorage = KeyValueStorage;

/** The stored switches, or the defaults for anything missing or unreadable */
export const parseSound = (raw: string | null): SoundSettings => {
  if (!raw) return DEFAULT_SOUND;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null) return DEFAULT_SOUND;
    const { music, effects } = value as Record<string, unknown>;
    return { music: music === true, effects: effects === true };
  } catch {
    return DEFAULT_SOUND;
  }
};

export const loadSound = (storage?: SoundStorage): SoundSettings =>
  readJson(SOUND_KEY, parseSound, DEFAULT_SOUND, storage);

/** Write the switches; silently does nothing without storage */
export const writeSound = (
  settings: SoundSettings,
  storage?: SoundStorage,
): void => writeJson(SOUND_KEY, settings, storage);
