/**
 * The cast, the slot table and the run draw. A character is a face, a
 * name, an intro bark and a swap; it throws from its whole pool.
 * Difficulty is not on the character but on the slot in the run (see
 * `docs/plans/pushback.md`, "The run").
 */
import { type Role, ROLES } from './lines';
import { Rng, seedRng } from './random';

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
  /** The look, in words, until the sheet and swap tables land */
  swap: string;
}

export const CHARACTERS: readonly Character[] = [
  {
    id: 'intern',
    name: 'The Intern',
    role: 'pm',
    intro: "Hi! Is this the meeting? I was told there'd be a meeting.",
    swap: 'Oversized lanyard, coffee',
  },
  {
    id: 'roadmap-owner',
    name: 'The Roadmap Owner',
    role: 'pm',
    intro: "I have a slot for you. It's now. Make it count.",
    swap: 'Gantt printout',
  },
  {
    id: 'head-of-product',
    name: 'The Head of Product',
    role: 'pm',
    intro: "I've heard about you. None of it was in the OKRs.",
    swap: 'Blazer, no notebook',
  },
  {
    id: 'junior',
    name: 'The Junior',
    role: 'dev',
    intro: "Give me a sec, the build's almost green.",
    swap: 'Hoodie up, energy drink',
  },
  {
    id: 'senior',
    name: 'The Senior',
    role: 'dev',
    intro: "I've seen this pattern before. It didn't end well then either.",
    swap: 'Mechanical keyboard under the arm',
  },
  {
    id: 'architect',
    name: 'The Architect',
    role: 'dev',
    intro: 'Before we start: is this scalable?',
    swap: 'Whiteboard marker, grey beard',
  },
  {
    id: 'freelancer',
    name: 'The Freelancer',
    role: 'designer',
    intro: "I'm only here until Thursday, so let's be quick.",
    swap: 'Tote bag',
  },
  {
    id: 'brand-designer',
    name: 'The Brand Designer',
    role: 'designer',
    intro: "That's not our blue.",
    swap: 'Pantone swatch',
  },
  {
    id: 'design-lead',
    name: 'The Design Lead',
    role: 'designer',
    intro: 'Let me stop you right there.',
    swap: 'Very small laptop',
  },
  {
    id: 'stakeholder',
    name: 'The Stakeholder',
    role: 'boss',
    intro: "Keep it short, I've got a call in five.",
    swap: 'Suit, phone in hand, never looks up',
  },
];

const characterIndex = new Map(CHARACTERS.map(c => [c.id, c]));

export const characterById = (id: CharacterId): Character => {
  const character = characterIndex.get(id);
  if (!character) throw new Error(`Unknown character ${id}`);
  return character;
};

export const STAKEHOLDER = characterById('stakeholder');

/** The scene a role's duels play in */
export const SCENE_OF: Record<Role | 'boss', SceneId> = {
  dev: 'floor',
  pm: 'meeting',
  designer: 'studio',
  boss: 'office',
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

const tier1: Slot = {
  tier: 1,
  accuracy: 0.6,
  menu: 4,
  decoys: 'any',
  silence: null,
};
const tier2: Slot = {
  tier: 2,
  accuracy: 0.75,
  menu: 5,
  decoys: 'two',
  silence: 8,
};
const tier3: Slot = {
  tier: 3,
  accuracy: 0.9,
  menu: 6,
  decoys: 'same',
  silence: 6,
};
export const BOSS_SLOT: Slot = {
  tier: 'boss',
  accuracy: 1,
  menu: 6,
  decoys: 'all',
  silence: 5,
};

/** The seven slots of a run, in order: the ramp is fixed, the faces are random */
export const SLOTS: readonly Slot[] = [
  tier1,
  tier1,
  tier2,
  tier2,
  tier3,
  tier3,
  BOSS_SLOT,
];

export const BOSS_SLOT_INDEX = SLOTS.length - 1;

// Rules
// ---------------

export interface Rules {
  /** Buy-in segments to win a regular duel */
  buyIn: number;
  /** Buy-in segments the player needs against the boss */
  bossBuyIn: number;
  /** Misses that lose the boss duel */
  bossMisses: number;
  /** Momentum steps until the mic drop is available */
  momentum: number;
  micDrop: {
    /** Buy-in segments a landed mic drop is worth */
    worth: number;
    /** Counter options the defender gets */
    menu: number;
    /** Factor on the silence seconds */
    silence: number;
  };
  /** Phrases in the player's hand */
  hand: number;
}

export const RULES: Rules = {
  buyIn: 3,
  bossBuyIn: 4,
  bossMisses: 3,
  momentum: 3,
  micDrop: { worth: 2, menu: 8, silence: 0.5 },
  hand: 4,
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
