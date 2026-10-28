/**
 * The save: one object in `localStorage`, versioned, holding the mode
 * switch and one run per role. Everything here is pure except the two
 * storage calls, which take the storage as an argument so tests can pass
 * a fake and the server (no `window`) gets an empty save.
 */
import {
  type Look,
  LOOKS,
  MODE_LABELS,
  MODE_ORDER,
  type Mode,
} from './characters';
import type { DuelState } from './duel';
import {
  PAIRS,
  POOL_SIZE,
  pairById,
  poolPairs,
  type PairId,
  ROLE_LABELS,
  type Role,
  ROLES,
  isPairId,
} from './lines';
import { type RunState, createRunState, recordDuel, runScore } from './run';

export const SAVE_KEY = 'pushback';
export const SAVE_VERSION = 3;

export interface SavedRun extends RunState {
  look: Look;
}

export interface Save {
  version: typeof SAVE_VERSION;
  /** The mode switch on the title screen */
  mode: Mode;
  runs: Partial<Record<Role, SavedRun>>;
  /**
   * Every pair collected in any run: the glossary, which outlives the
   * runs. A record only; a new run starts cold with a fresh deck.
   */
  glossary: PairId[];
}

/** What the save needs from `localStorage` */
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;

export const emptySave = (
  mode: Mode = 'easy',
  glossary: PairId[] = [],
): Save => ({
  version: SAVE_VERSION,
  mode,
  runs: {},
  glossary,
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
  Array.isArray((value.run as { deck?: unknown }).deck) &&
  isRecord(value.beaten) &&
  Array.isArray(value.lost) &&
  Array.isArray(value.collected) &&
  typeof value.finished === 'boolean' &&
  typeof value.attempts === 'number' &&
  isRecord(value.stats);

/**
 * Fill in what older saves lack: the buddy flag, the speed points and
 * a score on every beaten slot (none before the score existed)
 */
const withBuddyFlag = (run: SavedRun): SavedRun => ({
  ...run,
  buddy: run.buddy === true,
  mode: MODE_ORDER.includes(run.mode as Mode) ? run.mode : undefined,
  beaten: Object.fromEntries(
    Object.entries(run.beaten).map(([index, b]) => [
      index,
      { flawless: b.flawless === true, score: Number(b.score) || 0 },
    ]),
  ),
  stats: { ...run.stats, speed: Number(run.stats.speed) || 0 },
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
  // Version 2 knew two modes: its normal had the ghost, which is easy now
  if (!isRecord(data) || (data.version !== SAVE_VERSION && data.version !== 2))
    return null;
  if (!isRecord(data.runs)) return null;
  const runs: Save['runs'] = {};
  for (const role of ROLES) {
    const run = data.runs[role];
    if (isSavedRun(run) && run.role === role) runs[role] = withBuddyFlag(run);
  }
  const glossary = Array.isArray(data.glossary)
    ? data.glossary.filter((id): id is PairId => isPairId(id))
    : [];
  // A save with an odd mode plays easy
  const mode: Mode =
    data.version === 2
      ? data.mode === 'hard'
        ? 'hard'
        : 'easy'
      : MODE_ORDER.includes(data.mode as Mode)
        ? (data.mode as Mode)
        : 'easy';
  return {
    version: SAVE_VERSION,
    mode,
    runs,
    glossary,
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
  runs: {
    ...save.runs,
    [role]: { ...createRunState(role, look, seed), look, mode: save.mode },
  },
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
  const known = new Set(save.glossary);
  return {
    ...save,
    runs: {
      ...save.runs,
      [role]: { ...recordDuel(run, index, duel), look: run.look },
    },
    glossary: [
      ...save.glossary,
      ...duel.collected.filter(id => !known.has(id)),
    ],
  };
};

/**
 * Switch the mode. A run is played in one mode, so its score means one
 * thing: switching ends every run (the glossary, a record across runs,
 * stays)
 */
export const setMode = (save: Save, mode: Mode): Save =>
  mode === save.mode ? save : { ...save, mode, runs: {} };

/** Whether there is anything a reset would throw away */
export const hasRuns = (save: Save): boolean =>
  Object.keys(save.runs).length > 0;

/** Drop every run and the glossary; the mode switch stays as it was */
export const resetSave = (save: Save): Save => emptySave(save.mode);

/** The player's name on the select screen and the result card */
export const playerName = (role: Role, look: Look): string =>
  LOOKS[role][look].name;

/** The result card as plain text, the Wordle trick */
export const resultCardText = (
  run: RunState,
  glossary: readonly PairId[] = run.collected,
): string => {
  const flawless = Object.values(run.beaten).filter(b => b.flawless).length;
  const { stats } = run;
  return [
    `Pushback · ${ROLE_LABELS[run.role]}`,
    `${run.finished ? 'Stakeholder beaten' : 'Stakeholder took it offline'} · ${run.attempts} duels · ${flawless} flawless · ${MODE_LABELS[runMode(run)].toLowerCase()} mode`,
    `Score ${formatScore(runScore(run))}`,
    `Exchanges ${stats.exchangesWon}–${stats.exchangesLost} · Mic drops ${stats.micDrops} · Glossary ${poolPairs(glossary).length}/${PAIRS.length}`,
    `Missed counters: PM ${stats.missesByPool.pm} · Dev ${stats.missesByPool.dev} · Designer ${stats.missesByPool.designer}`,
    'sebald.me/lab/pushback',
  ].join('\n');
};

/** The mode a run was played in: the last duel's, or what an old save's flag says */
export const runMode = (run: RunState): Mode =>
  run.mode ?? (run.buddy ? 'easy' : 'hard');

/** A score with thousands separated: 12,340 */
export const formatScore = (score: number): string =>
  score.toLocaleString('en-US');

/** One pool on the result screen: what of it is collected, what was missed */
export interface ResultPool {
  role: Role;
  collected: number;
  total: number;
  missed: number;
}

/** What the result screen shows: the ledger and the glossary by pool */
export interface ResultModel {
  finished: boolean;
  score: number;
  mode: Mode;
  rows: [label: string, value: string][];
  pools: ResultPool[];
  glossary: { collected: number; total: number };
}

export const resultModel = (
  run: RunState,
  glossary: readonly PairId[] = run.collected,
): ResultModel => {
  const flawless = Object.values(run.beaten).filter(b => b.flawless).length;
  const { stats } = run;
  const pairs = poolPairs(glossary);
  return {
    finished: run.finished,
    score: runScore(run),
    mode: runMode(run),
    rows: [
      ['Duels', String(run.attempts)],
      ['Flawless', String(flawless)],
      ['Exchanges', `${stats.exchangesWon}–${stats.exchangesLost}`],
      ['Mic drops', String(stats.micDrops)],
    ],
    pools: ROLES.map(role => ({
      role,
      collected: pairs.filter(id => pairById(id).role === role).length,
      total: POOL_SIZE,
      missed: stats.missesByPool[role],
    })),
    glossary: { collected: pairs.length, total: PAIRS.length },
  };
};
