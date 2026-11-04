/**
 * The save: one object in `localStorage`, versioned, holding the mode
 * switch, the one run in play, the roles shipped and the glossary. Everything here is pure except the two
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
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem'>;

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

const parseRun = (value: unknown): SavedRun | null =>
  isSavedRun(value) ? withBuddyFlag(value) : null;

/**
 * Versions 2 and 3 kept a run per role. One carries over: the unfinished
 * run played the most; the finished ones are shipped.
 */
const fromRuns = (
  value: Record<string, unknown>,
): Pick<Save, 'run' | 'shipped'> => {
  const runs = ROLES.map(role => parseRun(value[role])).filter(
    (run, i): run is SavedRun => run !== null && run.role === ROLES[i],
  );
  const shipped: Save['shipped'] = {};
  for (const run of runs) if (run.finished) shipped[run.role] = run.look;
  const open = runs
    .filter(run => !run.finished)
    .sort((a, b) => b.attempts - a.attempts);
  return { run: open[0] ?? null, shipped };
};

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
  // Version 2 knew two modes: its normal had the ghost, which is easy now;
  // 2 and 3 kept a run per role
  if (!isRecord(data) || ![2, 3, SAVE_VERSION].includes(Number(data.version)))
    return null;
  let runs: Pick<Save, 'run' | 'shipped'>;
  if (data.version === SAVE_VERSION) {
    runs = { run: parseRun(data.run), shipped: parseShipped(data.shipped) };
  } else {
    if (!isRecord(data.runs)) return null;
    runs = fromRuns(data.runs);
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
  return { version: SAVE_VERSION, mode, ...runs, glossary };
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
  const next = { ...recordDuel(run, index, duel), look: run.look };
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
