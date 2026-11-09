/**
 * The two small reads and writes behind the save and the sound switches:
 * `localStorage` when there is one, and JSON that never throws.
 */

/** What the game needs from `localStorage` */
export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** The given storage, else `localStorage`, else null (server, blocked) */
export const storageOrNull = (
  storage?: KeyValueStorage,
): KeyValueStorage | null => {
  if (storage) return storage;
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

/** What `parse` makes of the text stored under `key`, or `fallback` when storage is missing or throws */
export const readJson = <T>(
  key: string,
  parse: (raw: string | null) => T,
  fallback: T,
  storage?: KeyValueStorage,
): T => {
  const store = storageOrNull(storage);
  if (!store) return fallback;
  try {
    return parse(store.getItem(key));
  } catch {
    return fallback;
  }
};

/** Write `value` as JSON; silently does nothing without storage or on quota */
export const writeJson = (
  key: string,
  value: unknown,
  storage?: KeyValueStorage,
): void => {
  const store = storageOrNull(storage);
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private mode: the game still plays, it just won't persist
  }
};
