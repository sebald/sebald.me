/**
 * The cast, the slot table and the run draw. A character is a face, a
 * name, an intro bark and a sheet; it throws from its whole pool.
 * Difficulty is not on the character but on the slot in the run (see
 * `docs/plans/pushback.md`, "The run").
 */
import { type PairId, type Role, ROLES, poolOf } from './lines';
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
   * One or two pairs from other pools this character has picked up: it
   * throws them too and answers them every time. They make the own-role
   * duels less of a pure memory test and seed the glossary across pools.
   */
  knows: PairId[];
}

export const CHARACTERS: readonly Character[] = [
  {
    id: 'intern',
    name: 'The Intern',
    role: 'pm',
    intro: "Hi! Is this the meeting? I was told there'd be a meeting.",
    sheet: 'pm-jo',
    knows: ['dev-1'],
  },
  {
    id: 'roadmap-owner',
    name: 'The Roadmap Owner',
    role: 'pm',
    intro: "I have a slot for you. It's now. Make it count.",
    sheet: 'pm-piet',
    knows: ['des-5', 'dev-3'],
  },
  {
    id: 'head-of-product',
    name: 'The Head of Product',
    role: 'pm',
    intro: "I've heard about you. None of it was in the OKRs.",
    sheet: 'pm-jo',
    knows: ['dev-8', 'des-1'],
  },
  {
    id: 'junior',
    name: 'The Junior',
    role: 'dev',
    intro: "Give me a sec, the build's almost green.",
    sheet: 'dev-sam',
    knows: ['des-2'],
  },
  {
    id: 'senior',
    name: 'The Senior',
    role: 'dev',
    intro: "I've seen this pattern before. It didn't end well then either.",
    sheet: 'dev-lena',
    knows: ['pm-3', 'des-7'],
  },
  {
    id: 'architect',
    name: 'The Architect',
    role: 'dev',
    intro: 'Before we start: is this scalable?',
    sheet: 'dev-sam',
    knows: ['pm-5', 'des-8'],
  },
  {
    id: 'freelancer',
    name: 'The Freelancer',
    role: 'designer',
    intro: "I'm only here until Thursday, so let's be quick.",
    sheet: 'designer-theo',
    knows: ['pm-4'],
  },
  {
    id: 'brand-designer',
    name: 'The Brand Designer',
    role: 'designer',
    intro: "That's not our blue.",
    sheet: 'designer-ines',
    knows: ['pm-6', 'dev-6'],
  },
  {
    id: 'design-lead',
    name: 'The Design Lead',
    role: 'designer',
    intro: 'Let me stop you right there.',
    sheet: 'designer-theo',
    knows: ['dev-7', 'pm-7'],
  },
  {
    id: 'stakeholder',
    name: 'The Stakeholder',
    role: 'boss',
    intro: "Keep it short, I've got a call in five.",
    sheet: 'boss',
    knows: [],
  },
];

const characterIndex = new Map(CHARACTERS.map(c => [c.id, c]));

export const characterById = (id: CharacterId): Character => {
  const character = characterIndex.get(id);
  if (!character) throw new Error(`Unknown character ${id}`);
  return character;
};

export const STAKEHOLDER = characterById('stakeholder');

/** Everything a character throws and answers: its own pool plus what it knows */
export const repertoire = (character: Character): PairId[] =>
  character.role === 'boss'
    ? []
    : [...poolOf(character.role).map(p => p.id), ...character.knows];

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
export const STANDS: Record<SceneId, { left: number; right: number }> = {
  // The desk islands reach in to x 112 and from x 369; the shelf with the
  // build light sits between the duellists
  floor: { left: 119, right: 286 },
  // The fern stands at x 62 to 115 against the wall, the glass wall from 397
  meeting: { left: 94, right: 324 },
  // The printer ends at x 94, the desk starts at 371
  studio: { left: 104, right: 282 },
  // The cabinet ends at x 68, the desk spans 157 to 324, the putter is at 434
  office: { left: 75, right: 332 },
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
  { tier: 1, accuracy: 0.6, menu: 4, decoys: 'any', silence: false },
  { tier: 2, accuracy: 0.7, menu: 5, decoys: 'any', silence: true },
  { tier: 2, accuracy: 0.75, menu: 5, decoys: 'any', silence: true },
  { tier: 3, accuracy: 0.9, menu: 6, decoys: 'any', silence: true },
  { tier: 3, accuracy: 0.9, menu: 6, decoys: 'same', silence: true },
  BOSS_SLOT,
];

/** The most colleagues a run has: two per role, then the boss */
export const MAX_COLLEAGUES = SLOTS.length - 1;

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
}

export const RULES: Rules = {
  reach: 3,
  bossReach: 4,
  bossMisses: 3,
  momentum: 2,
  momentumLoss: 'all',
  micDrop: { worth: 2, menu: 8, silence: 0.75 },
  reading: { wordsPerSecond: 4, share: 0.6 },
  hand: 4,
  fatigue: 0.1,
  menuExtra: 0,
};

/**
 * The two ways to play, one switch on the title screen. Normal has the
 * ghost of the player's predecessor whisper along; hard has no ghost, a
 * silence bar at half the reading time instead of 0.6, two more options
 * on every menu, colleagues who tire slowly and a Stakeholder who
 * leaves after two misses. Flawless
 * stars are only earned without the ghost.
 */
export type Mode = 'normal' | 'hard';

export const MODES: Record<Mode, { buddy: boolean; rules: Rules }> = {
  normal: { buddy: true, rules: RULES },
  hard: {
    buddy: false,
    rules: {
      ...RULES,
      bossMisses: 2,
      fatigue: 0.07,
      reading: { ...RULES.reading, share: 0.5 },
      menuExtra: 2,
    },
  },
};

export const MODE_LABELS: Record<Mode, string> = {
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
  /** The colleagues, then the boss last */
  slots: RunSlot[];
  /** The characters out of office this run */
  outOfOffice: CharacterId[];
}

/** The boss is the last slot */
export const bossIndex = (run: Run): number => run.slots.length - 1;

/**
 * Draw a run: up to two characters per role, in the role order, so that
 * no face shows twice. Two colleagues share a sheet until each has one
 * of its own, and the player's own look is a colleague's sheet too, so
 * the draw skips any character on the player's sheet or on a sheet the
 * run already has. A role with fewer than two left gives the run fewer
 * duels; the slot table still applies by role, its first slot first.
 */
export const drawRun = (role: Role, look: Look, seed: number): Run => {
  const rng = new Rng(seedRng(seed));
  const slots: RunSlot[] = [];
  const outOfOffice: CharacterId[] = [];
  const taken = new Set<SheetId>([PLAYER_SHEETS[role][look]]);
  roleOrder(role).forEach((opponentRole, roleIndex) => {
    const cast = rng.shuffle(CHARACTERS.filter(c => c.role === opponentRole));
    let drawn = 0;
    for (const character of cast) {
      if (drawn < 2 && !taken.has(character.sheet)) {
        taken.add(character.sheet);
        slots.push({
          character: character.id,
          slot: SLOTS[roleIndex * 2 + drawn]!,
        });
        drawn++;
      } else {
        outOfOffice.push(character.id);
      }
    }
  });
  slots.push({ character: 'stakeholder', slot: BOSS_SLOT });
  return { seed, slots, outOfOffice };
};
