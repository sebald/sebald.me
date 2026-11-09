/**
 * The save: one object in `localStorage`, versioned, holding the mode
 * switch, the one run in play, the roles shipped and the glossary. Everything here is pure except the two
 * storage calls, which take the storage as an argument so tests can pass
 * a fake and the server (no `window`) gets an empty save.
 */
import { type Look, LOOKS, MODE_ORDER, type Mode } from './characters';
import type { DuelState } from './duel';
import { type PairId, type Role, ROLES, isPairId } from './lines';
import { type RunState, createRunState, recordDuel } from './run';
import { type KeyValueStorage, readJson, writeJson } from './storage';

export const SAVE_KEY = 'pushback';
export const SAVE_VERSION = 4;

export interface SavedRun extends RunState {
  look: Look;
}

export interface Save {
  version: typeof SAVE_VERSION;
  /** The mode switch on the title screen */
  mode: Mode;
  /**
   * The run in play, one at a time: a new one replaces it. A finished
   * run stays until then, so its result can still be read.
   */
  run: SavedRun | null;
  /**
   * The roles the Stakeholder has signed off, with the look that did
   * it: the stamp on the select screen, which outlives the runs
   */
  shipped: Partial<Record<Role, Look>>;
  /**
   * Every pair collected in any run: the glossary, which outlives the
   * runs. A record only; a new run starts cold with a fresh deck.
   */
  glossary: PairId[];
}

/** What the save needs from `localStorage` */
export type SaveStorage = KeyValueStorage;

export const emptySave = (
  mode: Mode = 'easy',
  glossary: PairId[] = [],
): Save => ({
  version: SAVE_VERSION,
  mode,
  run: null,
  shipped: {},
  glossary,
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSavedRun = (value: unknown): value is SavedRun =>
  isRecord(value) &&
  ROLES.includes(value.role as Role) &&
  (value.look === 'a' || value.look === 'b') &&
  isRecord(value.run) &&
  Array.isArray((value.run as { slots?: unknown }).slots) &&
  Array.isArray((value.run as { deck?: unknown }).deck) &&
  isRecord(value.beaten) &&
  Array.isArray(value.lost) &&
  Array.isArray(value.collected) &&
  typeof value.finished === 'boolean' &&
  typeof value.attempts === 'number' &&
  isRecord(value.stats);

/** A stored run, with a mode only if it is one */
const parseRun = (value: unknown): SavedRun | null =>
  isSavedRun(value)
    ? {
        ...value,
        mode: MODE_ORDER.includes(value.mode as Mode) ? value.mode : undefined,
      }
    : null;

const parseShipped = (value: unknown): Save['shipped'] => {
  const shipped: Save['shipped'] = {};
  if (!isRecord(value)) return shipped;
  for (const role of ROLES) {
    const look = value[role];
    if (look === 'a' || look === 'b') shipped[role] = look;
  }
  return shipped;
};

/** Parse a stored save; anything corrupt or from another version is dropped */
export const parseSave = (raw: string | null): Save | null => {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(data) || data.version !== SAVE_VERSION) return null;
  const glossary = Array.isArray(data.glossary)
    ? data.glossary.filter((id): id is PairId => isPairId(id))
    : [];
  // A save with an odd mode plays easy
  const mode: Mode = MODE_ORDER.includes(data.mode as Mode)
    ? (data.mode as Mode)
    : 'easy';
  return {
    version: SAVE_VERSION,
    mode,
    run: parseRun(data.run),
    shipped: parseShipped(data.shipped),
    glossary,
  };
};

/** The save, or null when there is none (or no storage) */
export const loadSave = (storage?: SaveStorage): Save | null =>
  readJson(SAVE_KEY, parseSave, null, storage);

/** Write the save; silently does nothing without storage */
export const writeSave = (save: Save, storage?: SaveStorage): void =>
  writeJson(SAVE_KEY, save, storage);

/** Start a run for a role with a look; it replaces the one in play */
export const startRun = (
  save: Save,
  role: Role,
  look: Look,
  seed: number = Date.now(),
): Save => ({
  ...save,
  run: { ...createRunState(role, look, seed), look, mode: save.mode },
});

/**
 * Fold a finished duel of the run into the save; beating the Stakeholder
 * ships the role
 */
export const finishDuel = (
  save: Save,
  index: number,
  duel: DuelState,
): Save => {
  const { run } = save;
  if (!run) return save;
  const known = new Set(save.glossary);
  const next = recordDuel(run, index, duel);
  return {
    ...save,
    run: next,
    shipped: next.finished
      ? { ...save.shipped, [next.role]: next.look }
      : save.shipped,
    glossary: [
      ...save.glossary,
      ...duel.collected.filter(id => !known.has(id)),
    ],
  };
};

/**
 * Switch the mode. A run is played in one mode, so its score means one
 * thing: switching starts over, the run, the stamps and the glossary gone
 */
export const setMode = (save: Save, mode: Mode): Save =>
  mode === save.mode ? save : emptySave(mode);

/** Whether switching the mode or a reset would throw anything away */
export const hasProgress = (save: Save): boolean =>
  save.run !== null ||
  Object.keys(save.shipped).length > 0 ||
  save.glossary.length > 0;

/** The run in play, if it is not over yet: what Continue picks up */
export const openRun = (save: Save): SavedRun | null =>
  save.run && !save.run.finished ? save.run : null;

/** Drop the run, the stamps and the glossary; the mode stays as it was */
export const resetSave = (save: Save): Save => emptySave(save.mode);

/** The player's name on the select screen and the result card */
export const playerName = (role: Role, look: Look): string =>
  LOOKS[role][look].name;
