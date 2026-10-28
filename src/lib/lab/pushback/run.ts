/**
 * A run: the draw, which slots are beaten, what the player has collected
 * and the numbers for the result card. `save.ts` persists this shape.
 */
import type { Attempt } from './ai';
import {
  type Look,
  type Mode,
  type Rules,
  type Run,
  type RunSlot,
  bossIndex,
  characterById,
  drawRun,
  repertoireFor,
} from './characters';
import {
  type DuelSetup,
  type DuelState,
  type DuelStats,
  duelScore,
  emptyStats,
  isFlawless,
} from './duel';
import { type PairId, type Role, closersOf, deckPool } from './lines';

export interface RunState {
  role: Role;
  run: Run;
  /** By slot index, with the best score a win of it got */
  beaten: Record<number, { flawless: boolean; score: number }>;
  /** Slots lost at least once, by index (a retry is earned) */
  lost: number[];
  /**
   * Starts as the role's own pool of the deck and its three closers;
   * every run starts cold
   */
  collected: PairId[];
  /** The boss is beaten */
  finished: boolean;
  /** Duels played, retries and replays included */
  attempts: number;
  /** A duel of this run was played with the ghost, i.e. in easy mode */
  buddy: boolean;
  /** The mode of the last duel played, for the result card */
  mode?: Mode;
  stats: DuelStats;
}

export const createRunState = (
  role: Role,
  look: Look,
  seed: number,
): RunState => {
  const run = drawRun(role, look, seed);
  return {
    role,
    run,
    beaten: {},
    lost: [],
    collected: [...deckPool(run.deck, role), ...closersOf(role).map(p => p.id)],
    finished: false,
    attempts: 0,
    buddy: false,
    stats: emptyStats(),
  };
};

/** The slot the roster selects: the first unbeaten one */
export const nextSlot = (state: RunState): number =>
  state.run.slots.findIndex((_, index) => !state.beaten[index]);

/** The Stakeholder is reachable once every colleague is beaten */
export const bossUnlocked = (state: RunState): boolean =>
  state.run.slots
    .slice(0, bossIndex(state.run))
    .every((_, index) => state.beaten[index]);

export const canPlay = (state: RunState, index: number): boolean =>
  index >= 0 &&
  index < state.run.slots.length &&
  (index !== bossIndex(state.run) || bossUnlocked(state));

/** How a duel at this slot starts, which sets the opponent's pick order */
export const attemptFor = (state: RunState, index: number): Attempt => {
  if (state.beaten[index]) return 'replay';
  if (state.lost.includes(index)) return 'retry';
  return 'first';
};

/** Everything `createDuel` needs for a slot of this run */
export const duelSetupFor = (
  state: RunState,
  index: number,
  options: {
    seed: number;
    silence: boolean;
    buddy?: boolean;
    rules?: Rules;
    mode?: Mode;
  },
): DuelSetup => {
  const slot: RunSlot | undefined = state.run.slots[index];
  if (!slot) throw new Error(`No slot ${index}`);
  const character = characterById(slot.character);
  return {
    role: state.role,
    character,
    slot: slot.slot,
    attempt: attemptFor(state, index),
    deck: state.run.deck,
    repertoire: repertoireFor(character, state.run.deck, state.run.seed),
    collected: state.collected,
    seed: options.seed,
    silence: options.silence,
    buddy: options.buddy === true,
    rules: options.rules,
    mode: options.mode,
    tutorial: index === 0 && !state.beaten[0] && !state.lost.includes(0),
  };
};

const addStats = (a: DuelStats, b: DuelStats): DuelStats => ({
  exchangesWon: a.exchangesWon + b.exchangesWon,
  exchangesLost: a.exchangesLost + b.exchangesLost,
  micDrops: a.micDrops + b.micDrops,
  missesByPool: {
    pm: a.missesByPool.pm + b.missesByPool.pm,
    dev: a.missesByPool.dev + b.missesByPool.dev,
    designer: a.missesByPool.designer + b.missesByPool.designer,
  },
  speed: a.speed + b.speed,
});

/** Fold a finished duel back into the run */
export const recordDuel = (
  state: RunState,
  index: number,
  duel: DuelState,
): RunState => {
  if (duel.phase !== 'end' || !duel.winner) return state;
  const won = duel.winner === 'player';
  const beaten = { ...state.beaten };
  if (won) {
    const flawless =
      (isFlawless(duel) && duel.setup.buddy !== true) ||
      beaten[index]?.flawless === true;
    beaten[index] = {
      flawless,
      score: Math.max(duelScore(duel), beaten[index]?.score ?? 0),
    };
  }
  const lost =
    !won && !state.lost.includes(index) ? [...state.lost, index] : state.lost;
  return {
    ...state,
    beaten,
    lost,
    collected: duel.collected,
    finished: state.finished || (won && index === bossIndex(state.run)),
    attempts: state.attempts + 1,
    buddy: state.buddy || duel.setup.buddy === true,
    mode: duel.setup.mode ?? state.mode,
    stats: addStats(state.stats, duel.stats),
  };
};

/** A run's score: the best win of every colleague beaten, added up */
export const runScore = (state: RunState): number =>
  Object.values(state.beaten).reduce((sum, b) => sum + (b.score ?? 0), 0);
