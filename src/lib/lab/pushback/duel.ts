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
  aiCloser,
  aiDropsMic,
  aiPick,
  aiWrongCounter,
  answerTo,
  buildMenu,
  drawHand,
} from './ai';
import {
  type Character,
  type Mode,
  RULES,
  type Rules,
  type Slot,
} from './characters';
import {
  BOSS_PAIRS,
  type BossPairId,
  type PairId,
  type Role,
  closersOf,
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
  /** The lines in play this run; menus, decoys and the boss draw from it */
  deck: readonly PairId[];
  /** What the opponent throws and always answers (`repertoireFor`) */
  repertoire: readonly PairId[];
  /** Pairs the player knows at the start */
  collected: readonly PairId[];
  seed: number;
  /**
   * Moves on with every duel of a run, from the run's seed: the intro and
   * the barks are picked in turn by it (`inTurn`)
   */
  encounter?: number;
  /** The silence bar switch (title screen) */
  silence: boolean;
  /** First duel of a run: shows the hint on the first exchange */
  tutorial?: boolean;
  /** Buddy mode is on: presentation only, but no flawless star */
  buddy?: boolean;
  rules?: Rules;
  /** The mode the duel is played in, for the result card */
  mode?: Mode;
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
  /** Speed points: a share of `SCORE.speed` per right counter, by time left */
  speed: number;
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
  /**
   * The closer on offer while attacking at full momentum: throwing it
   * is the mic drop. Null when momentum is short.
   */
  closer: PairId | null;
  exchange: Exchange | null;
  /** The player's counter options while defending */
  menu: PairId[];
  silence: { elapsed: number; limit: number } | null;
  /**
   * How long the player has been on this defence, in ms, timer or not:
   * the score's speed points
   */
  answerMs: number;
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
  | { type: 'throw'; phrase: PairId }
  | { type: 'counter'; phrase: PairId }
  | { type: 'tick'; ms: number }
  | { type: 'continue' };

export const emptyStats = (): DuelStats => ({
  exchangesWon: 0,
  exchangesLost: 0,
  micDrops: 0,
  missesByPool: { pm: 0, dev: 0, designer: 0 },
  speed: 0,
});

const other = (side: Side): Side => (side === 'player' ? 'opponent' : 'player');

export const createDuel = (setup: DuelSetup): DuelState => {
  const rules = setup.rules ?? RULES;
  const boss = setup.character.role === 'boss';
  const rng = new Rng(seedRng(setup.seed));
  const bossQueue = boss ? rng.shuffle(bossPhrasesIn(setup.deck)) : [];
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
    closer: null,
    exchange: null,
    menu: [],
    silence: null,
    answerMs: 0,
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

/** The boss phrases whose counter is in the deck (all of them for an odd deck) */
export const bossPhrasesIn = (deck: readonly PairId[]): BossPairId[] => {
  const inDeck = BOSS_PAIRS.filter(p => deck.includes(p.answeredBy));
  return (inDeck.length > 0 ? inDeck : BOSS_PAIRS).map(p => p.id);
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

/**
 * The points of a duel, before the mode's factor (`Rules.score`): every
 * exchange won, up to `speed` more for a right counter by how much of
 * the menu's reading time was left, a mic drop, the win, a flawless win
 * and the Stakeholder. A lost duel scores nothing.
 */
export const SCORE = {
  exchange: 100,
  speed: 100,
  micDrop: 200,
  win: 500,
  flawless: 500,
  boss: 1000,
} as const;

/**
 * The time a median reader needs for a menu's counters, in ms: the
 * yardstick for speed points, the same in every mode, timer or not
 */
export const readingMs = (menu: readonly PairId[]): number =>
  (menu.reduce((n, id) => n + wordCount(pairById(id).counter), 0) /
    RULES.reading.wordsPerSecond) *
  1000;

/** Speed points for a right counter after `answerMs` of `reading` ms */
export const speedPoints = (answerMs: number, reading: number): number =>
  reading <= 0
    ? 0
    : Math.round(SCORE.speed * Math.max(0, 1 - answerMs / reading));

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
  state.setup.silence && state.setup.slot.silence && state.rules.timer
    ? { elapsed: 0, limit: silenceLimit(state.rules, menu, micDrop) }
    : null;

/** The opponent throws; the player gets a menu */
const opponentThrows = (state: DuelState): DuelState => {
  const rng = new Rng(state.rng);
  const { slot } = state.setup;
  let phrase: PairId | BossPairId;
  let micDrop = false;
  let bossQueue = state.bossQueue;
  if (state.boss) {
    // A long barrage goes round again, never repeating the last phrase
    if (bossQueue.length === 0) {
      const last = state.exchange?.phrase;
      bossQueue = rng.shuffle(
        bossPhrasesIn(state.setup.deck).filter(id => id !== last),
      );
    }
    [phrase, ...bossQueue] = bossQueue as [BossPairId, ...BossPairId[]];
  } else {
    micDrop = aiDropsMic(slot.tier, {
      momentumFull: state.momentum.opponent >= state.rules.momentum,
      remaining: toLose(state) + state.scale,
      worth: state.rules.micDrop.worth,
    });
    // A mic drop is one of the opponent's closers, else a pool phrase
    phrase = micDrop
      ? aiCloser(state.setup.character.role as Role, state.thrown, rng)
      : aiPick(
          state.setup.repertoire,
          {
            collected: state.collected,
            thrown: state.thrown,
            attempt: state.setup.attempt,
            turn: state.turn,
          },
          rng,
        );
  }
  const size =
    (micDrop ? state.rules.micDrop.menu : slot.menu) + state.rules.menuExtra;
  const menu = buildMenu(phrase, slot.decoys, size, rng, state.setup.deck);
  return {
    ...state,
    phase: 'defend',
    exchange: { by: 'opponent', phrase, micDrop, answer: answerTo(phrase) },
    menu,
    silence: silenceFor(state, menu, micDrop),
    answerMs: 0,
    outcome: null,
    thrown: isBossPairId(phrase) ? state.thrown : [...state.thrown, phrase],
    bossQueue,
    turn: state.turn + 1,
    momentum: micDrop ? { ...state.momentum, opponent: 0 } : state.momentum,
    rng: rng.state,
  };
};

/**
 * The closer the player is offered at full momentum: their role's three
 * in turn, from a start set by the duel's seed, moving on with every
 * mic drop thrown, so the one on offer stays until it is used.
 */
export const closerFor = (state: DuelState): PairId => {
  const own = closersOf(state.setup.role);
  return own[(Math.abs(state.setup.seed) + state.stats.micDrops) % own.length]!
    .id;
};

/** The player gets the initiative: a hand, and a closer if full */
const playerAttacks = (state: DuelState): DuelState => {
  const rng = new Rng(state.rng);
  const hand = drawHand(state.collected, state.spent, state.rules.hand, rng);
  return {
    ...state,
    phase: 'attack',
    hand,
    closer:
      state.momentum.player >= state.rules.momentum ? closerFor(state) : null,
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
  const speed = right ? speedPoints(state.answerMs, readingMs(state.menu)) : 0;
  const scored =
    speed > 0
      ? {
          ...state,
          stats: { ...state.stats, speed: state.stats.speed + speed },
        }
      : state;
  return resolve(scored, {
    winner: right ? 'player' : 'opponent',
    picked,
    fast: right && fast,
    // A mic drop moves the scale two steps, landed or countered
    worth: exchange.micDrop ? state.rules.micDrop.worth : 1,
    offline: false,
  });
};

const playerThrows = (state: DuelState, phrase: PairId): DuelState => {
  const rng = new Rng(state.rng);
  // Throwing the closer is the mic drop; at the boss every throw is the
  // interrupt, which is one too
  const exchange: Exchange = {
    by: 'player',
    phrase,
    micDrop: phrase === state.closer || state.boss,
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
    closer: null,
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
  const { slot, repertoire, deck } = state.setup;
  const answered = aiAnswers(
    phrase,
    repertoire,
    slot.accuracy,
    rng,
    state.rules.fatigue * state.exchanges,
  );
  const picked = answered ? phrase : aiWrongCounter(phrase, rng, deck);
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
    case 'throw': {
      const offered =
        state.hand.includes(action.phrase) || action.phrase === state.closer;
      if (state.phase !== 'attack' || !offered) return state;
      return playerThrows(state, action.phrase);
    }
    case 'counter':
      if (state.phase !== 'defend' || !state.menu.includes(action.phrase)) {
        return state;
      }
      return playerCounters(state, action.phrase);
    case 'tick': {
      if (state.phase !== 'defend') return state;
      const answerMs = state.answerMs + action.ms;
      if (!state.silence) return { ...state, answerMs };
      const elapsed = state.silence.elapsed + action.ms;
      if (elapsed >= state.silence.limit) {
        return playerCounters(
          { ...state, answerMs, silence: { ...state.silence, elapsed } },
          'fallback',
        );
      }
      return { ...state, answerMs, silence: { ...state.silence, elapsed } };
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

/**
 * A finished duel's score: its points (`SCORE`) times the mode's factor,
 * on tens. Nothing for a loss.
 */
export const duelScore = (state: DuelState): number => {
  if (state.winner !== 'player') return 0;
  const { stats } = state;
  const points =
    stats.exchangesWon * SCORE.exchange +
    stats.speed +
    stats.micDrops * SCORE.micDrop +
    SCORE.win +
    (isFlawless(state) ? SCORE.flawless : 0) +
    (state.boss ? SCORE.boss : 0);
  return Math.round((points * state.rules.score) / 10) * 10;
};
