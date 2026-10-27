/**
 * Attract mode: the duel the title screen plays by itself when nobody
 * touches it for a while, the way an arcade cabinet draws people over.
 * The demo is a real duel, played by the AI on both sides, no ghost, no
 * silence bar, and nothing of it is saved.
 */
import {
  CHARACTERS,
  type Character,
  type Look,
  RULES,
  SLOTS,
  drawDeck,
  repertoireFor,
} from './characters';
import type { DuelSetup } from './duel';
import { ROLES, type Role, deckPool } from './lines';
import { Rng, seedRng } from './random';
import { PLAYER_SHEETS } from './sprites';

/** Seconds of nothing on the title screen before the demo starts */
export const ATTRACT_AFTER_MS = 20_000;

/** How the demo's player waits before picking, so the menu can be seen */
export const DEMO_PICK_MS = 1600;

/** The demo's player answers right this often */
export const DEMO_ACCURACY = 0.7;

/** Once the duel is over, this long before the title returns */
export const DEMO_END_MS = 3000;

export interface Demo {
  look: Look;
  setup: DuelSetup;
}

/**
 * A demo duel from a seed: a role and a look at random, against a
 * colleague of another role who is not on the player's sheet, at the
 * second tier (five options, a tired opponent in a few exchanges), with
 * both pools known so the demo answers and attacks well.
 */
export const demoFor = (seed: number): Demo => {
  const rng = new Rng(seedRng(seed));
  const role = rng.shuffle([...ROLES])[0]!;
  const look = rng.shuffle(['a', 'b'] as const)[0]!;
  const sheet = PLAYER_SHEETS[role][look];
  const cast: Character[] = CHARACTERS.filter(
    c => c.role !== role && c.role !== 'boss' && c.sheet !== sheet,
  );
  const character = rng.shuffle(cast)[0]!;
  const deck = drawDeck(rng);
  return {
    look,
    setup: {
      role,
      character,
      slot: { ...SLOTS[1]!, silence: false },
      attempt: 'first',
      deck,
      repertoire: repertoireFor(character, deck, seed),
      collected: [
        ...deckPool(deck, role),
        ...deckPool(deck, character.role as Role),
      ],
      seed,
      silence: false,
      buddy: false,
      rules: RULES,
      tutorial: false,
    },
  };
};
