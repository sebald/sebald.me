/**
 * A run: the draw, which slots are beaten, what the player has collected
 * and the numbers for the result card. `save.ts` persists this shape.
 */
import type { Attempt } from './ai';
import {
  type Look,
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
  emptyStats,
  isFlawless,
} from './duel';
import { type PairId, type Role, deckPool } from './lines';

export interface RunState {
  role: Role;
  run: Run;
  /** By slot index */
  beaten: Record<number, { flawless: boolean }>;
  /** Slots lost at least once, by index (a retry is earned) */
  lost: number[];
  /** Starts as the role's own pool of the deck; every run starts cold */
  collected: PairId[];
  /** The boss is beaten */
  finished: boolean;
  /** Duels played, retries and replays included */
  attempts: number;
  /** A duel of this run was played with the ghost, i.e. in normal mode */
  buddy: boolean;
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
    collected: deckPool(run.deck, role),
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
  options: { seed: number; silence: boolean; buddy?: boolean; rules?: Rules },
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
    beaten[index] = { flawless };
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
    stats: addStats(state.stats, duel.stats),
  };
};
