/**
 * The cast, the slot table and the run draw. A character is a face, a
 * name, an intro bark and a sheet; it throws from its whole pool.
 * Difficulty is not on the character but on the slot in the run (see
 * `docs/plans/pushback.md`, "The run").
 */
import {
  BOSS_ANSWERS,
  type PairId,
  type Role,
  ROLES,
  deckPool,
  poolOf,
} from './lines';
import { Rng, seedRng } from './random';
import { PLAYER_SHEETS, type SheetId } from './sprites';

export type CharacterId =
  | 'intern'
  | 'roadmap-owner'
  | 'head-of-product'
  | 'junior'
  | 'senior'
  | 'architect'
  | 'freelancer'
  | 'brand-designer'
  | 'design-lead'
  | 'stakeholder';

export type SceneId = 'floor' | 'meeting' | 'studio' | 'office';

export interface Character {
  id: CharacterId;
  name: string;
  role: Role | 'boss';
  /** The intro bark */
  intro: string;
  /**
   * The sheet the character is drawn from, as Gemini drew it: one of its
   * role's looks, or the Stakeholder's own. Nothing is recoloured (a
   * tint broke the figure too easily) and nothing is pasted on (the
   * hand-held items looked wrong), so two colleagues on one sheet are
   * twins, which the run draw keeps apart.
   */
  sheet: SheetId;
  /**
   * How many pairs from other pools this character has picked up (one
   * or two): it throws them too and answers them every time. Which ones
   * follows from the run's deck and seed (`repertoireFor`). They make
   * the own-role duels less of a pure memory test and seed the glossary
   * across pools.
   */
  knows: number;
}

export const CHARACTERS: readonly Character[] = [
  {
    id: 'intern',
    name: 'The Intern',
    role: 'pm',
    intro: "Hi! Is this the meeting? I was told there'd be a meeting.",
    sheet: 'pm-jo',
    knows: 1,
  },
  {
    id: 'roadmap-owner',
    name: 'The Roadmap Owner',
    role: 'pm',
    intro: "I have a slot for you. It's now. Make it count.",
    sheet: 'pm-piet',
    knows: 2,
  },
  {
    id: 'head-of-product',
    name: 'The Head of Product',
    role: 'pm',
    intro: "I've heard about you. None of it was in the OKRs.",
    sheet: 'pm-nadia',
    knows: 2,
  },
  {
    id: 'junior',
    name: 'The Junior',
    role: 'dev',
    intro: "Give me a sec, the build's almost green.",
    sheet: 'dev-sam',
    knows: 1,
  },
  {
    id: 'senior',
    name: 'The Senior',
    role: 'dev',
    intro: "I've seen this pattern before. It didn't end well then either.",
    sheet: 'dev-lena',
    knows: 2,
  },
  {
    id: 'architect',
    name: 'The Architect',
    role: 'dev',
    intro: 'Before we start: is this scalable?',
    sheet: 'dev-bo',
    knows: 2,
  },
  {
    id: 'freelancer',
    name: 'The Freelancer',
    role: 'designer',
    intro: "I'm only here until Thursday, so let's be quick.",
    sheet: 'designer-theo',
    knows: 1,
  },
  {
    id: 'brand-designer',
    name: 'The Brand Designer',
    role: 'designer',
    intro: "That's not our blue.",
    sheet: 'designer-ines',
    knows: 2,
  },
  {
    id: 'design-lead',
    name: 'The Design Lead',
    role: 'designer',
    intro: 'Let me stop you right there.',
    sheet: 'designer-kim',
    knows: 2,
  },
  {
    id: 'stakeholder',
    name: 'The Stakeholder',
    role: 'boss',
    intro: "Keep it short, I've got a call in five.",
    sheet: 'boss',
    knows: 0,
  },
];

const characterIndex = new Map(CHARACTERS.map(c => [c.id, c]));

export const characterById = (id: CharacterId): Character => {
  const character = characterIndex.get(id);
  if (!character) throw new Error(`Unknown character ${id}`);
  return character;
};

export const STAKEHOLDER = characterById('stakeholder');

/** A small stable number per character, to salt the run seed with */
const characterSalt = (id: CharacterId): number =>
  [...id].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Everything a character throws and answers in a run: its own pool of
 * the deck plus the `knows` foreign pairs of the deck, picked by the
 * run's seed so a retry meets the same colleague.
 */
export const repertoireFor = (
  character: Character,
  deck: readonly PairId[],
  seed: number,
): PairId[] => {
  const { role } = character;
  if (role === 'boss') return [];
  const rng = new Rng(seedRng(seed + characterSalt(character.id)));
  const own = deckPool(deck, role);
  const foreign = deck.filter(id => !own.includes(id));
  return [...own, ...rng.sample(foreign, character.knows)];
};

/** The scene a role's duels play in */
export const SCENE_OF: Record<Role | 'boss', SceneId> = {
  dev: 'floor',
  pm: 'meeting',
  designer: 'studio',
  boss: 'office',
};

/**
 * Where the duellists stand in each scene: the x of the left edge of the
 * 72 px sprite cell, player on the left, opponent on the right. The
 * composition rule keeps x 60 to 170 and 310 to 420 clear; scenes may
 * move the stands a little once they exist.
 */
export interface Stands {
  left: number;
  right: number;
  /**
   * The scene column the band starts at, when it is not centred on the
   * duellists: a stand moved without moving the room
   */
  view?: number;
}

export const STANDS: Record<SceneId, Stands> = {
  // All four put the figures 160 apart (the office's Stakeholder
  // eight closer) (cells at stage x 44 and 204, so
  // sixty-five pixels of room to either edge), the ghost between them.
  // The left desk ends at x 128, the right one starts at 323; the shelf
  // with the build light sits between the duellists
  floor: { left: 117, right: 277 },
  // The chair ends at x 120; the table (243 to 398) stands behind
  meeting: { left: 127, right: 287 },
  // The chair ends at x 120, the desk starts at 333
  studio: { left: 123, right: 283 },
  // The cabinet ends at x 90, the desk spans 250 to 340 with the chair
  // behind its right end, where the Stakeholder stands: eight pixels in
  // from the chair, two and a half percent of the stage toward the
  // middle, with the room where the duellists 160 apart put it
  office: { left: 145, right: 297, view: 101 },
};

// Player looks
// ---------------

/** The two looks of a playable role; each is its own model sheet */
export type Look = 'a' | 'b';

export const LOOKS: Record<Role, Record<Look, { name: string }>> = {
  pm: { a: { name: 'Jo' }, b: { name: 'Piet' } },
  dev: { a: { name: 'Sam' }, b: { name: 'Lena' } },
  designer: { a: { name: 'Ines' }, b: { name: 'Theo' } },
};

// Slots
// ---------------

export type Tier = 1 | 2 | 3 | 'boss';

export interface Slot {
  tier: Tier;
  /** AI accuracy on foreign pools before fatigue; its own pool starts at 1 */
  accuracy: number;
  /** Counter options on defence */
  menu: number;
  /** Where the decoys come from */
  decoys: 'any' | 'two' | 'same' | 'all';
  /** The silence bar runs on defence (its length follows the menu's text) */
  silence: boolean;
}

export const BOSS_SLOT: Slot = {
  tier: 'boss',
  accuracy: 1,
  menu: 6,
  decoys: 'all',
  silence: true,
};

/**
 * The seven slots of a run, in order: the ramp is fixed, the faces are
 * random. Plausible decoys test memory and obvious decoys test reasoning,
 * so the decoys follow what the player knows of the pool: the own pool
 * (known from the start) gets obvious ones, and each foreign pool's
 * first colleague is lenient (that duel collects the pool) and the
 * second strict.
 */
export const SLOTS: readonly Slot[] = [
  { tier: 1, accuracy: 0.6, menu: 4, decoys: 'any', silence: false },
  { tier: 2, accuracy: 0.7, menu: 5, decoys: 'any', silence: true },
  { tier: 3, accuracy: 0.85, menu: 6, decoys: 'any', silence: true },
  BOSS_SLOT,
];

/** The colleagues of a run: one per role, then the boss */
export const MAX_COLLEAGUES = SLOTS.length - 1;

// The deck
// ---------------

/** Pairs of each pool in a run's deck */
export const DECK_PER_POOL = 8;

/** Of those, pairs whose counter answers a boss phrase, so the boss has lines */
export const DECK_BOSS_ANSWERS = 2;

/**
 * The lines in play this run: of each pool, a few pairs the Stakeholder
 * can throw and the rest at random, so every run reads differently and
 * the glossary fills over several of them. In pool order, each pool in
 * id order.
 */
export const drawDeck = (rng: Rng): PairId[] =>
  ROLES.flatMap(role => {
    const pool = poolOf(role).map(p => p.id);
    const answers = pool.filter(id => BOSS_ANSWERS.has(id));
    const rest = pool.filter(id => !BOSS_ANSWERS.has(id));
    const drawn = new Set([
      ...rng.sample(answers, DECK_BOSS_ANSWERS),
      ...rng.sample(rest, DECK_PER_POOL - DECK_BOSS_ANSWERS),
    ]);
    return pool.filter(id => drawn.has(id));
  });

// Rules
// ---------------

export interface Rules {
  /**
   * The shared scale: it starts in the middle and every won exchange
   * pushes it one step toward the winner. A duellist wins by pushing it
   * this many steps to their side.
   */
  reach: number;
  /** Steps the player must push the Stakeholder */
  bossReach: number;
  /** Steps the Stakeholder needs: misses push, counters push back */
  bossMisses: number;
  /** Momentum steps until the mic drop is available */
  momentum: number;
  /** Momentum lost on a lost exchange: all of it, or this many steps */
  momentumLoss: 'all' | number;
  micDrop: {
    /** Steps a mic drop moves the scale, landed or countered */
    worth: number;
    /** Counter options the defender gets */
    menu: number;
    /** Factor on the silence bar's length */
    silence: number;
  };
  /**
   * The silence bar is a share of the time a median reader needs for
   * the menu's text: adults read about 240 words a minute (Brysbaert,
   * 2019), and the right counter sits halfway down the list on average,
   * so a little over half the text is what finding it takes.
   */
  reading: {
    wordsPerSecond: number;
    share: number;
  };
  /** Phrases in the player's hand */
  hand: number;
  /**
   * The opponent runs out of comebacks: the chance to counter anything,
   * its own pool included, drops by this much per exchange. Two equal
   * duellists would otherwise trade their own defences for ever.
   */
  fatigue: number;
  /** Counter options added to every menu, the boss's included */
  menuExtra: number;
  /**
   * The silence bar runs where the slot has one; off, nobody is rushed
   * and every won defence counts as fast
   */
  timer: boolean;
  /** Factor on a duel's score: what the mode is worth */
  score: number;
}

export const RULES: Rules = {
  reach: 3,
  bossReach: 4,
  bossMisses: 3,
  momentum: 2,
  momentumLoss: 'all',
  micDrop: { worth: 2, menu: 8, silence: 0.75 },
  reading: { wordsPerSecond: 4, share: 1.1 },
  hand: 4,
  fatigue: 0.1,
  menuExtra: 0,
  timer: true,
  score: 1.5,
};

/**
 * The three ways to play, one switch on the title screen. Easy has the
 * ghost of the player's predecessor whisper along and no silence bar.
 * Normal has neither the ghost nor a hurry: the bar runs from the second
 * colleague on, at 1.1 of the time a median reader needs. Hard has a bar
 * at 0.7 of it, two more options on every menu, colleagues who tire
 * slowly and a Stakeholder who leaves after two misses. Flawless stars
 * are only earned without the ghost; the score counts a mode's worth.
 */
export type Mode = 'easy' | 'normal' | 'hard';

export const MODE_ORDER: readonly Mode[] = ['easy', 'normal', 'hard'];

export const MODES: Record<Mode, { buddy: boolean; rules: Rules }> = {
  easy: { buddy: true, rules: { ...RULES, timer: false, score: 1 } },
  normal: { buddy: false, rules: RULES },
  hard: {
    buddy: false,
    rules: {
      ...RULES,
      bossMisses: 2,
      fatigue: 0.07,
      reading: { ...RULES.reading, share: 0.7 },
      menuExtra: 2,
      score: 2,
    },
  },
};

/** The mode after this one on the title's switch */
export const nextMode = (mode: Mode): Mode =>
  MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length]!;

/** The mode a step left or right of this one, stopping at the ends */
export const stepMode = (mode: Mode, step: 1 | -1): Mode =>
  MODE_ORDER[
    Math.max(
      0,
      Math.min(MODE_ORDER.length - 1, MODE_ORDER.indexOf(mode) + step),
    )
  ]!;

export const MODE_LABELS: Record<Mode, string> = {
  easy: 'Easy',
  normal: 'Normal',
  hard: 'Hard',
};

// Runs
// ---------------

/** The order a role meets the others in: own, then the two foreign ones */
export const roleOrder = (role: Role): Role[] => {
  const index = ROLES.indexOf(role);
  return [role, ROLES[(index + 1) % 3]!, ROLES[(index + 2) % 3]!];
};

export interface RunSlot {
  character: CharacterId;
  slot: Slot;
}

export interface Run {
  seed: number;
  /** The lines in play: `DECK_PER_POOL` pairs of each pool */
  deck: PairId[];
  /** The colleagues, then the boss last */
  slots: RunSlot[];
  /** The characters out of office this run */
  outOfOffice: CharacterId[];
}

/** The boss is the last slot */
export const bossIndex = (run: Run): number => run.slots.length - 1;

/**
 * Draw a run: the deck, then one colleague per role, the own role first
 * and the two foreign ones in random order, so that no face shows
 * twice. Two colleagues share a sheet until each has one of its own,
 * and the player's own look is a colleague's sheet too, so the draw
 * skips any character on the player's sheet or on a sheet the run
 * already has. A role with nobody left gives the run one duel fewer;
 * the slot table applies by position.
 */
export const drawRun = (role: Role, look: Look, seed: number): Run => {
  const rng = new Rng(seedRng(seed));
  const deck = drawDeck(rng);
  const slots: RunSlot[] = [];
  const outOfOffice: CharacterId[] = [];
  const taken = new Set<SheetId>([PLAYER_SHEETS[role][look]]);
  const [own, ...foreign] = roleOrder(role);
  for (const opponentRole of [own!, ...rng.shuffle(foreign)]) {
    const cast = rng.shuffle(CHARACTERS.filter(c => c.role === opponentRole));
    let drawn = false;
    for (const character of cast) {
      if (!drawn && !taken.has(character.sheet)) {
        taken.add(character.sheet);
        slots.push({ character: character.id, slot: SLOTS[slots.length]! });
        drawn = true;
      } else {
        outOfOffice.push(character.id);
      }
    }
  }
  slots.push({ character: 'stakeholder', slot: BOSS_SLOT });
  return { seed, deck, slots, outOfOffice };
};
