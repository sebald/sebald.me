/**
 * The cast, the slot table and the run draw. A character is a face, a
 * name, an intro bark and a swap; it throws from its whole pool.
 * Difficulty is not on the character but on the slot in the run (see
 * `docs/plans/pushback.md`, "The run").
 */
import { type PairId, type Role, ROLES, poolOf } from './lines';
import { Rng, seedRng } from './random';
import type { Swap } from './sprites';

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
   * How the character is drawn: one of its role's two base sheets in the
   * colours Gemini drew, and a prop from the item sheet. The Stakeholder
   * has a sheet of their own. Nothing is recoloured: a tint broke the
   * figure too easily (skin and hair caught, pixels gone see-through).
   */
  swap: Swap;
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
    swap: { base: 'pm-jo', prop: 'coffee' },
    knows: ['dev-1'],
  },
  {
    id: 'roadmap-owner',
    name: 'The Roadmap Owner',
    role: 'pm',
    intro: "I have a slot for you. It's now. Make it count.",
    swap: { base: 'pm-piet', prop: 'gantt' },
    knows: ['des-5', 'dev-3'],
  },
  {
    id: 'head-of-product',
    name: 'The Head of Product',
    role: 'pm',
    intro: "I've heard about you. None of it was in the OKRs.",
    swap: { base: 'pm-jo' },
    knows: ['dev-8', 'des-1'],
  },
  {
    id: 'junior',
    name: 'The Junior',
    role: 'dev',
    intro: "Give me a sec, the build's almost green.",
    swap: { base: 'dev-sam', prop: 'energy-drink' },
    knows: ['des-2'],
  },
  {
    id: 'senior',
    name: 'The Senior',
    role: 'dev',
    intro: "I've seen this pattern before. It didn't end well then either.",
    swap: { base: 'dev-lena', prop: 'keyboard' },
    knows: ['pm-3', 'des-7'],
  },
  {
    id: 'architect',
    name: 'The Architect',
    role: 'dev',
    intro: 'Before we start: is this scalable?',
    swap: { base: 'dev-sam', prop: 'marker' },
    knows: ['pm-5', 'des-8'],
  },
  {
    id: 'freelancer',
    name: 'The Freelancer',
    role: 'designer',
    intro: "I'm only here until Thursday, so let's be quick.",
    swap: { base: 'designer-theo', prop: 'tote' },
    knows: ['pm-4'],
  },
  {
    id: 'brand-designer',
    name: 'The Brand Designer',
    role: 'designer',
    intro: "That's not our blue.",
    swap: { base: 'designer-ines', prop: 'swatches' },
    knows: ['pm-6', 'dev-6'],
  },
  {
    id: 'design-lead',
    name: 'The Design Lead',
    role: 'designer',
    intro: 'Let me stop you right there.',
    swap: { base: 'designer-theo', prop: 'tiny-laptop' },
    knows: ['dev-7', 'pm-7'],
  },
  {
    id: 'stakeholder',
    name: 'The Stakeholder',
    role: 'boss',
    intro: "Keep it short, I've got a call in five.",
    swap: { base: 'boss' },
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
  // The desk islands reach in to x 117 and from x 363; the shelf with the
  // build light sits between the duellists
  floor: { left: 124, right: 284 },
  // The fern stands at x 70 to 120 against the wall, the glass wall from 390
  meeting: { left: 100, right: 320 },
  // The printer ends at x 100, the desk starts at 365
  studio: { left: 110, right: 280 },
  // The cabinet ends at x 75, the desk spans 160 to 320, the putter is at 425
  office: { left: 82, right: 328 },
};

// Player looks
// ---------------

/** The two looks of a playable role; each is its own model sheet */
export type Look = 'a' | 'b';

export const LOOKS: Record<Role, Record<Look, { name: string }>> = {
  pm: { a: { name: 'Jo' }, b: { name: 'Ravi' } },
  dev: { a: { name: 'Sam' }, b: { name: 'Lena' } },
  designer: { a: { name: 'Ines' }, b: { name: 'Theo' } },
};

// Slots
// ---------------

export type Tier = 1 | 2 | 3 | 'boss';

export interface Slot {
  tier: Tier;
  /** AI accuracy on foreign pools; its own pool is always right */
  accuracy: number;
  /** Counter options on defence */
  menu: number;
  /** Where the decoys come from */
  decoys: 'any' | 'two' | 'same' | 'all';
  /** Silence bar in seconds, null = off */
  silence: number | null;
}

export const BOSS_SLOT: Slot = {
  tier: 'boss',
  accuracy: 1,
  menu: 6,
  decoys: 'all',
  silence: 5,
};

/**
 * The seven slots of a run, in order: the ramp is fixed, the faces are
 * random. Plausible decoys test memory and obvious decoys test reasoning,
 * so the decoys follow what the player knows of the pool: a fresh pool
 * gets obvious ones, the own pool plausible ones.
 */
export const SLOTS: readonly Slot[] = [
  { tier: 1, accuracy: 0.6, menu: 4, decoys: 'any', silence: null },
  { tier: 1, accuracy: 0.6, menu: 4, decoys: 'any', silence: null },
  { tier: 2, accuracy: 0.7, menu: 5, decoys: 'any', silence: 10 },
  { tier: 2, accuracy: 0.75, menu: 5, decoys: 'any', silence: 8 },
  { tier: 3, accuracy: 0.9, menu: 6, decoys: 'same', silence: 6 },
  { tier: 3, accuracy: 0.9, menu: 6, decoys: 'same', silence: 6 },
  BOSS_SLOT,
];

export const BOSS_SLOT_INDEX = SLOTS.length - 1;

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
    /** Factor on the silence seconds */
    silence: number;
  };
  /** Phrases in the player's hand */
  hand: number;
  /**
   * The meeting ends: from this many exchanges on, the duel ends as soon
   * as the scale is off centre, to whoever leads. Null for no limit.
   */
  maxExchanges: number | null;
}

export const RULES: Rules = {
  reach: 3,
  bossReach: 4,
  bossMisses: 3,
  momentum: 2,
  momentumLoss: 'all',
  micDrop: { worth: 2, menu: 8, silence: 0.5 },
  hand: 4,
  maxExchanges: 8,
};

// Runs
// ---------------

/** The order a role meets the others in: foreign, foreign, own */
export const roleOrder = (role: Role): Role[] => {
  const index = ROLES.indexOf(role);
  return [ROLES[(index + 1) % 3]!, ROLES[(index + 2) % 3]!, role];
};

export interface RunSlot {
  character: CharacterId;
  slot: Slot;
}

export interface Run {
  seed: number;
  /** Six colleagues and the boss */
  slots: RunSlot[];
  /** The characters out of office this run, one per role */
  outOfOffice: CharacterId[];
}

/** Draw a run: two of the three characters per role, in the role order */
export const drawRun = (role: Role, seed: number): Run => {
  const rng = new Rng(seedRng(seed));
  const slots: RunSlot[] = [];
  const outOfOffice: CharacterId[] = [];
  roleOrder(role).forEach((opponentRole, roleIndex) => {
    const cast = CHARACTERS.filter(c => c.role === opponentRole).map(c => c.id);
    const [a, b, out] = rng.shuffle(cast);
    slots.push(
      { character: a!, slot: SLOTS[roleIndex * 2]! },
      { character: b!, slot: SLOTS[roleIndex * 2 + 1]! },
    );
    outOfOffice.push(out!);
  });
  slots.push({ character: 'stakeholder', slot: BOSS_SLOT });
  return { seed, slots, outOfOffice };
};
