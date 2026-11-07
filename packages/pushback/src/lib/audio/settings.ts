/**
 * The sound switches, per viewer and apart from the save: erasing the
 * save keeps them. Off by default; nothing plays until the player turns
 * it on.
 */

export interface SoundSettings {
  music: boolean;
  effects: boolean;
}

export const SOUND_KEY = 'pushback-sound';

export const DEFAULT_SOUND: SoundSettings = { music: false, effects: false };

/** What the settings need from `localStorage` */
export type SoundStorage = Pick<Storage, 'getItem' | 'setItem'>;

const storageOrNull = (storage?: SoundStorage): SoundStorage | null => {
  if (storage) return storage;
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

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

export const loadSound = (storage?: SoundStorage): SoundSettings => {
  const store = storageOrNull(storage);
  if (!store) return DEFAULT_SOUND;
  try {
    return parseSound(store.getItem(SOUND_KEY));
  } catch {
    return DEFAULT_SOUND;
  }
};

/** Write the switches; silently does nothing without storage */
export const writeSound = (
  settings: SoundSettings,
  storage?: SoundStorage,
): void => {
  const store = storageOrNull(storage);
  if (!store) return;
  try {
    store.setItem(SOUND_KEY, JSON.stringify(settings));
  } catch {
    // Quota or private mode: the switches hold until the page closes
  }
};
