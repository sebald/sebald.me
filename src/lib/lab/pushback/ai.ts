/**
 * The opponent's choices and the player's menus, all seeded through an
 * `Rng` so a duel replays identically under the same seed.
 */
import type { Slot, Tier } from './characters';
import {
  type BossPairId,
  type PairId,
  ROLES,
  bossPairById,
  deckPool,
  isBossPairId,
  pairById,
  poolOf,
} from './lines';
import type { Rng } from './random';

/** How a duel started; sets the opponent's pick order */
export type Attempt = 'first' | 'retry' | 'replay';

/** The counter that answers a phrase */
export const answerTo = (phrase: PairId | BossPairId): PairId =>
  isBossPairId(phrase) ? bossPairById(phrase).answeredBy : phrase;

/**
 * The defender's menu: the right counter plus decoys, shuffled. Decoys
 * come from the deck's pools the slot allows; "two" is the phrase's own
 * pool plus one other, picked per exchange.
 */
export const buildMenu = (
  phrase: PairId | BossPairId,
  decoys: Slot['decoys'],
  size: number,
  rng: Rng,
  deck: readonly PairId[],
): PairId[] => {
  const answer = answerTo(phrase);
  const own = pairById(answer).role;
  let candidates: PairId[];
  switch (decoys) {
    case 'same':
      candidates = deckPool(deck, own);
      break;
    case 'two': {
      const other = rng.pick(ROLES.filter(role => role !== own))!;
      candidates = [...deckPool(deck, own), ...deckPool(deck, other)];
      break;
    }
    default:
      candidates = [...deck];
  }
  const wrong = candidates.filter(id => id !== answer);
  return rng.shuffle([answer, ...rng.sample(wrong, size - 1)]);
};

/**
 * Whether the opponent answers a phrase correctly: what is in its
 * repertoire (its own pool and what it knows; the boss knows it all) it
 * answers every time, the rest with the slot's accuracy, and `fatigue`
 * (the rules' rate times the exchanges so far) comes off both.
 */
export const aiAnswers = (
  phrase: PairId,
  repertoire: readonly PairId[] | 'all',
  accuracy: number,
  rng: Rng,
  fatigue = 0,
): boolean => {
  const known = repertoire === 'all' || repertoire.includes(phrase);
  return rng.chance((known ? 1 : accuracy) - fatigue);
};

/** A wrong counter from the phrase's pool in the deck, for the opponent's miss */
export const aiWrongCounter = (
  phrase: PairId,
  rng: Rng,
  deck: readonly PairId[],
): PairId => {
  const role = pairById(phrase).role;
  const inDeck = deckPool(deck, role).filter(id => id !== phrase);
  const pool = inDeck.length > 0 ? inDeck : poolOf(role).map(p => p.id);
  return rng.pick(pool.filter(id => id !== phrase))!;
};

/**
 * The opponent's next phrase. On a first attempt and a replay, pairs the
 * player has not collected come first (collecting). On a retry the
 * opponent alternates, collected first, so the first exchange is one the
 * player can win from memory (the earned retry). Within a group the pick
 * is random; nothing repeats within a duel until the pool is used up.
 */
export const aiPick = (
  pool: readonly PairId[],
  options: {
    collected: readonly PairId[];
    thrown: readonly PairId[];
    attempt: Attempt;
    /** How many phrases the opponent threw already in this duel */
    turn: number;
  },
  rng: Rng,
): PairId => {
  const thrown = new Set(options.thrown);
  let unused = pool.filter(id => !thrown.has(id));
  if (unused.length === 0) unused = [...pool];
  const collected = new Set(options.collected);
  const known = unused.filter(id => collected.has(id));
  const unknown = unused.filter(id => !collected.has(id));
  const order =
    options.attempt === 'retry' && options.turn % 2 === 0
      ? [known, unknown]
      : [unknown, known];
  return rng.pick(order.find(group => group.length > 0) ?? unused)!;
};

/**
 * Whether the opponent drops the mic now: tiers 1 and 2 as soon as it
 * can, tier 3 holds it until the hit would end the duel.
 */
export const aiDropsMic = (
  tier: Tier,
  options: {
    momentumFull: boolean;
    /** Steps the opponent still needs to win */
    remaining: number;
    worth: number;
  },
): boolean =>
  options.momentumFull && (tier !== 3 || options.worth >= options.remaining);

/** The player's hand: up to `size` collected phrases not yet spent */
export const drawHand = (
  collected: readonly PairId[],
  spent: readonly PairId[],
  size: number,
  rng: Rng,
): PairId[] => {
  const used = new Set(spent);
  const available = collected.filter(id => !used.has(id));
  return rng.sample(available.length > 0 ? available : collected, size);
};
