/**
 * The save: one object in `localStorage`, versioned, holding the mode
 * switch and one run per role. Everything here is pure except the two
 * storage calls, which take the storage as an argument so tests can pass
 * a fake and the server (no `window`) gets an empty save.
 */
import { type Look, LOOKS, type Mode } from './characters';
import type { DuelState } from './duel';
import { PAIRS, ROLE_LABELS, type Role, ROLES } from './lines';
import { type RunState, createRunState, recordDuel } from './run';

export const SAVE_KEY = 'pushback';
export const SAVE_VERSION = 1;

export interface SavedRun extends RunState {
  look: Look;
}

export interface Save {
  version: typeof SAVE_VERSION;
  /** The mode switch on the title screen */
  mode: Mode;
  runs: Partial<Record<Role, SavedRun>>;
}

/** What the save needs from `localStorage` */
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const emptySave = (mode: Mode = 'normal'): Save => ({
  version: SAVE_VERSION,
  mode,
  runs: {},
});

const storageOrNull = (storage?: SaveStorage): SaveStorage | null => {
  if (storage) return storage;
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isSavedRun = (value: unknown): value is SavedRun =>
  isRecord(value) &&
  ROLES.includes(value.role as Role) &&
  (value.look === 'a' || value.look === 'b') &&
  isRecord(value.run) &&
  Array.isArray((value.run as { slots?: unknown }).slots) &&
  isRecord(value.beaten) &&
  Array.isArray(value.lost) &&
  Array.isArray(value.collected) &&
  typeof value.finished === 'boolean' &&
  typeof value.attempts === 'number' &&
  isRecord(value.stats);

/** Saves from before buddy mode have no flag on the run */
const withBuddyFlag = (run: SavedRun): SavedRun => ({
  ...run,
  buddy: run.buddy === true,
});

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
  if (!isRecord(data.runs)) return null;
  const runs: Save['runs'] = {};
  for (const role of ROLES) {
    const run = data.runs[role];
    if (isSavedRun(run) && run.role === role) runs[role] = withBuddyFlag(run);
  }
  // Saves from before the mode switch (silence and buddy flags) play normal
  return {
    version: SAVE_VERSION,
    mode: data.mode === 'hard' ? 'hard' : 'normal',
    runs,
  };
};

/** The save, or null when there is none (or no storage) */
export const loadSave = (storage?: SaveStorage): Save | null => {
  const store = storageOrNull(storage);
  if (!store) return null;
  try {
    return parseSave(store.getItem(SAVE_KEY));
  } catch {
    return null;
  }
};

/** Write the save; silently does nothing without storage */
export const writeSave = (save: Save, storage?: SaveStorage): void => {
  const store = storageOrNull(storage);
  if (!store) return;
  try {
    store.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Quota or private mode: the game still plays, it just won't persist
  }
};

/** Start (or restart) a run for a role with a look */
export const startRun = (
  save: Save,
  role: Role,
  look: Look,
  seed: number = Date.now(),
): Save => ({
  ...save,
  runs: { ...save.runs, [role]: { ...createRunState(role, seed), look } },
});

/** Fold a finished duel of a role's run into the save */
export const finishDuel = (
  save: Save,
  role: Role,
  index: number,
  duel: DuelState,
): Save => {
  const run = save.runs[role];
  if (!run) return save;
  return {
    ...save,
    runs: {
      ...save.runs,
      [role]: { ...recordDuel(run, index, duel), look: run.look },
    },
  };
};

export const setMode = (save: Save, mode: Mode): Save => ({
  ...save,
  mode,
});

/** Whether there is anything a reset would throw away */
export const hasRuns = (save: Save): boolean =>
  Object.keys(save.runs).length > 0;

/** Drop every run; the mode switch stays as it was */
export const resetSave = (save: Save): Save => emptySave(save.mode);

/** The player's name on the select screen and the result card */
export const playerName = (role: Role, look: Look): string =>
  LOOKS[role][look].name;

/** The result card as plain text, the Wordle trick */
export const resultCardText = (run: RunState): string => {
  const flawless = Object.values(run.beaten).filter(b => b.flawless).length;
  const { stats } = run;
  return [
    `Pushback · ${ROLE_LABELS[run.role]}`,
    `${run.finished ? 'Stakeholder beaten' : 'Stakeholder took it offline'} · ${run.attempts} duels · ${flawless} flawless${run.buddy ? ' · with a ghost' : ' · hard mode'}`,
    `Exchanges ${stats.exchangesWon}–${stats.exchangesLost} · Mic drops ${stats.micDrops} · Glossary ${run.collected.length}/${PAIRS.length}`,
    `Missed counters: PM ${stats.missesByPool.pm} · Dev ${stats.missesByPool.dev} · Designer ${stats.missesByPool.designer}`,
    'sebald.me/lab/pushback',
  ].join('\n');
};
