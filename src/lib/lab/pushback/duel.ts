/**
 * One duel as a pure state machine: `reduce(state, action)` returns the
 * next state and never touches the DOM or a timer. The opponent's moves
 * happen inside the reducer (seeded), so the UI only dispatches what the
 * player does and the ticks of the silence bar.
 *
 * Phases: intro → attack ⇄ defend → resolve → (attack | defend | end).
 * Against the Stakeholder the opponent keeps the initiative; the only
 * attack phase the player gets is the interrupt at full momentum.
 */
import {
  type Attempt,
  aiAnswers,
  aiDropsMic,
  aiPick,
  aiWrongCounter,
  answerTo,
  buildMenu,
  drawHand,
} from './ai';
import {
  type Character,
  RULES,
  type Rules,
  type Slot,
  repertoire,
} from './characters';
import {
  BOSS_PAIRS,
  type BossPairId,
  type PairId,
  type Role,
  isBossPairId,
  pairById,
  poolOfPhrase,
} from './lines';
import { Rng, seedRng } from './random';

export type Side = 'player' | 'opponent';
export type Phase = 'intro' | 'attack' | 'defend' | 'resolve' | 'end';

export interface DuelSetup {
  /** The player's role */
  role: Role;
  character: Character;
  slot: Slot;
  attempt: Attempt;
  /** Pairs the player knows at the start */
  collected: readonly PairId[];
  seed: number;
  /** The silence bar switch (title screen) */
  silence: boolean;
  /** First duel of a run: shows the hint on the first exchange */
  tutorial?: boolean;
  /** Buddy mode is on: presentation only, but no flawless star */
  buddy?: boolean;
  rules?: Rules;
}

export interface Exchange {
  /** The attacker */
  by: Side;
  phrase: PairId | BossPairId;
  micDrop: boolean;
  /** The counter that answers it */
  answer: PairId;
}

export interface Outcome {
  winner: Side;
  /** What the defender chose; `fallback` when the silence bar ran out */
  picked: PairId | 'fallback' | null;
  /** Counter before the silence bar was half full (momentum) */
  fast: boolean;
  /** Steps the scale moves toward the winner */
  worth: number;
  /** The boss interrupt: no answer, "Let's take this offline." */
  offline: boolean;
}

export interface DuelStats {
  exchangesWon: number;
  exchangesLost: number;
  micDrops: number;
  missesByPool: Record<Role, number>;
}

export interface DuelState {
  setup: DuelSetup;
  rules: Rules;
  boss: boolean;
  phase: Phase;
  initiative: Side;
  /**
   * The shared scale: 0 in the middle, positive toward the player. The
   * player wins at `toWin`, the opponent at minus `toLose`.
   */
  scale: number;
  momentum: Record<Side, number>;
  /** Pairs the player knows, grows during the duel */
  collected: PairId[];
  /** Phrases the player threw this duel */
  spent: PairId[];
  /** The player's hand while attacking */
  hand: PairId[];
  /** Whether the player may drop the mic on this throw */
  micDropAvailable: boolean;
  exchange: Exchange | null;
  /** The player's counter options while defending */
  menu: PairId[];
  silence: { elapsed: number; limit: number } | null;
  outcome: Outcome | null;
  /** Phrases the opponent threw this duel */
  thrown: PairId[];
  /** Boss phrases still to come */
  bossQueue: BossPairId[];
  /** The player's misses against the boss */
  misses: number;
  /** Opponent throws so far (retry alternation) */
  turn: number;
  /** Exchanges so far */
  exchanges: number;
  winner: Side | null;
  /** Pool of the counter the player last missed (boss bark) */
  lastMissPool: Role | null;
  stats: DuelStats;
  rng: number;
}

export type DuelAction =
  | { type: 'begin' }
  | { type: 'throw'; phrase: PairId; micDrop?: boolean }
  | { type: 'counter'; phrase: PairId }
  | { type: 'tick'; ms: number }
  | { type: 'continue' };

export const emptyStats = (): DuelStats => ({
  exchangesWon: 0,
  exchangesLost: 0,
  micDrops: 0,
  missesByPool: { pm: 0, dev: 0, designer: 0 },
});

const other = (side: Side): Side => (side === 'player' ? 'opponent' : 'player');

export const createDuel = (setup: DuelSetup): DuelState => {
  const rules = setup.rules ?? RULES;
  const boss = setup.character.role === 'boss';
  const rng = new Rng(seedRng(setup.seed));
  const bossQueue = boss ? rng.shuffle(BOSS_PAIRS.map(p => p.id)) : [];
  return {
    setup,
    rules,
    boss,
    phase: 'intro',
    initiative: 'opponent',
    scale: 0,
    momentum: { player: 0, opponent: 0 },
    collected: [...setup.collected],
    spent: [],
    hand: [],
    micDropAvailable: false,
    exchange: null,
    menu: [],
    silence: null,
    outcome: null,
    thrown: [],
    bossQueue,
    misses: 0,
    turn: 0,
    exchanges: 0,
    winner: null,
    lastMissPool: null,
    stats: emptyStats(),
    rng: rng.state,
  };
};

/** Steps the player must push the scale to win */
export const toWin = (state: DuelState): number =>
  state.boss ? state.rules.bossReach : state.rules.reach;

/** Steps the opponent must push the scale the other way to win */
export const toLose = (state: DuelState): number =>
  state.boss ? state.rules.bossMisses : state.rules.reach;

/** Whether the hint shows: first exchange of the first duel */
export const showsHint = (state: DuelState): boolean =>
  state.setup.tutorial === true &&
  state.exchanges === 0 &&
  state.phase === 'defend';

// Transitions
// ---------------

/** Words in a line, for the reading time */
export const wordCount = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

/**
 * How long the silence bar runs for a menu: the reading time of its
 * counters at the rules' pace, the rules' share of it, shorter on a mic
 * drop. In ms, rounded to the frame.
 */
export const silenceLimit = (
  rules: Rules,
  menu: readonly PairId[],
  micDrop: boolean,
): number => {
  const words = menu.reduce((n, id) => n + wordCount(pairById(id).counter), 0);
  const seconds =
    (words / rules.reading.wordsPerSecond) *
    rules.reading.share *
    (micDrop ? rules.micDrop.silence : 1);
  return Math.round(seconds * 8) * 125;
};

const silenceFor = (
  state: DuelState,
  menu: readonly PairId[],
  micDrop: boolean,
) =>
  state.setup.silence && state.setup.slot.silence
    ? { elapsed: 0, limit: silenceLimit(state.rules, menu, micDrop) }
    : null;

/** The opponent throws; the player gets a menu */
const opponentThrows = (state: DuelState): DuelState => {
  const rng = new Rng(state.rng);
  const { slot, character } = state.setup;
  let phrase: PairId | BossPairId;
  let micDrop = false;
  let bossQueue = state.bossQueue;
  if (state.boss) {
    // A long barrage goes round again, never repeating the last phrase
    if (bossQueue.length === 0) {
      const last = state.exchange?.phrase;
      bossQueue = rng.shuffle(
        BOSS_PAIRS.map(p => p.id).filter(id => id !== last),
      );
    }
    [phrase, ...bossQueue] = bossQueue as [BossPairId, ...BossPairId[]];
  } else {
    phrase = aiPick(
      repertoire(character),
      {
        collected: state.collected,
        thrown: state.thrown,
        attempt: state.setup.attempt,
        turn: state.turn,
      },
      rng,
    );
    micDrop = aiDropsMic(slot.tier, {
      momentumFull: state.momentum.opponent >= state.rules.momentum,
      remaining: toLose(state) + state.scale,
      worth: state.rules.micDrop.worth,
    });
  }
  const size =
    (micDrop ? state.rules.micDrop.menu : slot.menu) + state.rules.menuExtra;
  const menu = buildMenu(phrase, slot.decoys, size, rng);
  return {
    ...state,
    phase: 'defend',
    exchange: { by: 'opponent', phrase, micDrop, answer: answerTo(phrase) },
    menu,
    silence: silenceFor(state, menu, micDrop),
    outcome: null,
    thrown: isBossPairId(phrase) ? state.thrown : [...state.thrown, phrase],
    bossQueue,
    turn: state.turn + 1,
    momentum: micDrop ? { ...state.momentum, opponent: 0 } : state.momentum,
    rng: rng.state,
  };
};

/** The player gets the initiative: a hand, and the mic drop if full */
const playerAttacks = (state: DuelState): DuelState => {
  const rng = new Rng(state.rng);
  const hand = drawHand(state.collected, state.spent, state.rules.hand, rng);
  return {
    ...state,
    phase: 'attack',
    hand,
    micDropAvailable: state.momentum.player >= state.rules.momentum,
    exchange: null,
    menu: [],
    silence: null,
    outcome: null,
    rng: rng.state,
  };
};

const nextExchange = (state: DuelState): DuelState => {
  if (state.boss) {
    // The interrupt: full momentum is the only way to get a word in
    return state.momentum.player >= state.rules.momentum
      ? playerAttacks(state)
      : opponentThrows(state);
  }
  return state.initiative === 'player'
    ? playerAttacks(state)
    : opponentThrows(state);
};

/** Score the exchange and move to `resolve` */
const resolve = (state: DuelState, outcome: Outcome): DuelState => {
  const { exchange } = state;
  if (!exchange) return state;
  const { winner } = outcome;
  const loser = other(winner);
  const step = winner === 'player' ? outcome.worth : -outcome.worth;
  const scale = Math.max(
    -toLose(state),
    Math.min(toWin(state), state.scale + step),
  );
  const momentum = {
    ...state.momentum,
    [loser]:
      state.rules.momentumLoss === 'all'
        ? 0
        : Math.max(0, state.momentum[loser] - state.rules.momentumLoss),
  };
  const winnerGains =
    winner === exchange.by || outcome.fast || state.setup.slot.silence === null;
  if (winnerGains && !outcome.offline) {
    momentum[winner] = Math.min(momentum[winner] + 1, state.rules.momentum);
  }

  const stats: DuelStats = {
    ...state.stats,
    missesByPool: { ...state.stats.missesByPool },
  };
  let lastMissPool = state.lastMissPool;
  let misses = state.misses;
  if (winner === 'player') stats.exchangesWon++;
  else stats.exchangesLost++;
  if (exchange.by === 'player' && exchange.micDrop) stats.micDrops++;
  const playerMissed = exchange.by === 'opponent' && winner === 'opponent';
  if (playerMissed) {
    const pool = poolOfPhrase(exchange.phrase);
    stats.missesByPool[pool]++;
    lastMissPool = pool;
    misses++;
  }

  // A pair the player defended against is collected, win or lose
  let collected = state.collected;
  if (
    exchange.by === 'opponent' &&
    !isBossPairId(exchange.phrase) &&
    !collected.includes(exchange.phrase)
  ) {
    collected = [...collected, exchange.phrase];
  }

  let duelWinner: Side | null = null;
  if (scale >= toWin(state)) duelWinner = 'player';
  else if (scale <= -toLose(state)) duelWinner = 'opponent';

  return {
    ...state,
    phase: 'resolve',
    initiative: winner,
    scale,
    momentum,
    collected,
    outcome,
    silence: null,
    stats,
    lastMissPool,
    misses,
    exchanges: state.exchanges + 1,
    winner: duelWinner,
  };
};

const playerCounters = (
  state: DuelState,
  picked: PairId | 'fallback',
): DuelState => {
  const { exchange, silence } = state;
  if (!exchange) return state;
  const right = picked === exchange.answer;
  const fast = silence === null || silence.elapsed < silence.limit / 2;
  return resolve(state, {
    winner: right ? 'player' : 'opponent',
    picked,
    fast: right && fast,
    // A mic drop moves the scale two steps, landed or countered
    worth: exchange.micDrop ? state.rules.micDrop.worth : 1,
    offline: false,
  });
};

const playerThrows = (
  state: DuelState,
  phrase: PairId,
  micDrop: boolean,
): DuelState => {
  const rng = new Rng(state.rng);
  const micDropUsed = micDrop && state.micDropAvailable;
  const exchange: Exchange = {
    by: 'player',
    phrase,
    micDrop: micDropUsed || state.boss,
    answer: phrase,
  };
  const spent = [...state.spent, phrase];
  const momentum = exchange.micDrop
    ? { ...state.momentum, player: 0 }
    : state.momentum;
  const thrown: DuelState = {
    ...state,
    exchange,
    spent,
    hand: [],
    micDropAvailable: false,
    momentum,
  };
  if (state.boss) {
    // The Stakeholder doesn't look up
    return {
      ...resolve(thrown, {
        winner: 'player',
        picked: null,
        fast: true,
        worth: state.rules.micDrop.worth,
        offline: true,
      }),
      rng: rng.state,
    };
  }
  const { slot, character } = state.setup;
  const answered = aiAnswers(
    phrase,
    state.boss ? 'all' : repertoire(character),
    slot.accuracy,
    rng,
    state.rules.fatigue * state.exchanges,
  );
  const picked = answered ? phrase : aiWrongCounter(phrase, rng);
  return {
    ...resolve(thrown, {
      winner: answered ? 'opponent' : 'player',
      picked,
      fast: true,
      worth: exchange.micDrop ? state.rules.micDrop.worth : 1,
      offline: false,
    }),
    rng: rng.state,
  };
};

export const reduce = (state: DuelState, action: DuelAction): DuelState => {
  switch (action.type) {
    case 'begin':
      return state.phase === 'intro' ? nextExchange(state) : state;
    case 'throw':
      if (state.phase !== 'attack' || !state.hand.includes(action.phrase)) {
        return state;
      }
      return playerThrows(state, action.phrase, action.micDrop === true);
    case 'counter':
      if (state.phase !== 'defend' || !state.menu.includes(action.phrase)) {
        return state;
      }
      return playerCounters(state, action.phrase);
    case 'tick': {
      if (state.phase !== 'defend' || !state.silence) return state;
      const elapsed = state.silence.elapsed + action.ms;
      if (elapsed >= state.silence.limit) {
        return playerCounters(
          { ...state, silence: { ...state.silence, elapsed } },
          'fallback',
        );
      }
      return { ...state, silence: { ...state.silence, elapsed } };
    }
    case 'continue':
      if (state.phase !== 'resolve') return state;
      if (state.winner) {
        return { ...state, phase: 'end', exchange: null, menu: [], hand: [] };
      }
      return nextExchange(state);
  }
};

/** Whether the player never lost an exchange */
export const isFlawless = (state: DuelState): boolean =>
  state.winner === 'player' && state.stats.exchangesLost === 0;
