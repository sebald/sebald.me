// The game's data: what exists in it, and whole game states by name.

export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Half the price, rounded down */
  sellPrice: number;
}

const item = (
  id: string,
  name: string,
  description: string,
  price: number,
): Item => ({ id, name, description, price, sellPrice: Math.floor(price / 2) });

export const ITEMS: Item[] = [
  item('herb', 'Herb', 'A bitter leaf that closes small wounds.', 8),
  item('rope', 'Rope', 'Ten paces of hemp. Good for wells and ferries.', 12),
  item('lamp-oil', 'Lamp Oil', 'Keeps a lamp lit through the night.', 15),
  item('tonic', 'Tonic', 'Restores a good part of one ally’s HP.', 25),
  item('leather-cap', 'Leather Cap', 'Stiff, warm and a little too small.', 60),
  item(
    'iron-sword',
    'Iron Sword',
    'Heavy and honest. Wren’s favourite kind.',
    150,
  ),
];

/** What the shop sells: the ids of all six items */
export const SHOP_STOCK: string[] = ITEMS.map(({ id }) => id);

/** What a night at camp costs, in gold */
export const REST_COST = 20;

export const STATUSES = {
  poisoned: { label: 'Poisoned' },
  asleep: { label: 'Asleep' },
  guarded: { label: 'Guarded' },
};

export type StatusId = keyof typeof STATUSES;

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
}

export const ENEMIES: Enemy[] = [
  { id: 'bog-rat', name: 'Bog Rat', maxHp: 20 },
  { id: 'marsh-wisp', name: 'Marsh Wisp', maxHp: 9 },
];

export interface Quest {
  id: string;
  name: string;
  giver: string;
  description: string;
  /** What to do, in order */
  steps: string[];
}

export const QUESTS: Quest[] = [
  {
    id: 'lost-ferry',
    name: 'The Lost Ferry',
    giver: 'Ferrywoman Maud',
    description:
      'The ferry that crossed the river at Mossy Ford drifted off in the last flood. Without it nobody gets across, and Maud has no other work.',
    steps: [
      'Ask in Mossy Ford about the ferry',
      'Search the reeds south of the ford',
      'Bring the ferry back',
    ],
  },
  {
    id: 'wolves',
    name: 'Wolves at Hollow Gate',
    giver: 'Gatekeeper Tam',
    description:
      'Wolves have been seen at Hollow Gate after dark. Tam wants them driven off before the next caravan arrives.',
    steps: [
      'Speak to Tam at Hollow Gate',
      'Find the wolves’ den in the hills',
      'Drive the pack away',
    ],
  },
  {
    id: 'herbs',
    name: 'Herbs for Old Bess',
    giver: 'Old Bess',
    description:
      'Old Bess brews her remedies from marsh herbs, and her knees are too bad to pick them herself.',
    steps: ['Pick three herbs along the ford', 'Bring them to Old Bess'],
  },
];

export interface Options {
  /** 0 to 10 */
  music: number;
  /** 0 to 10 */
  sound: number;
  messageSpeed: 'slow' | 'normal' | 'fast';
}

export const DEFAULT_OPTIONS: Options = {
  music: 7,
  sound: 5,
  messageSpeed: 'normal',
};

export interface Member {
  id: string;
  name: string;
  role: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  statuses: StatusId[];
}

export interface PackEntry {
  /** An item's id */
  item: string;
  count: number;
}

export interface QuestProgress {
  /** A quest's id */
  quest: string;
  /** The index of the step the player is on */
  step: number;
  done: boolean;
}

export interface Save {
  place: string;
  /** The party leader's name */
  leader: string;
  level: number;
  /** In seconds */
  playtime: number;
  /** An ISO date */
  savedAt: string;
}

export interface FoeState {
  /** An enemy's id */
  enemy: string;
  hp: number;
  maxHp: number;
}

export interface Fight {
  enemies: FoeState[];
  /** A member's id */
  turn: string;
}

export interface GameState {
  place: string;
  /** In seconds */
  playtime: number;
  gold: number;
  party: Member[];
  pack: PackEntry[];
  quests: QuestProgress[];
  /** Three slots, each empty (`null`) or holding a save */
  slots: [Save | null, Save | null, Save | null];
  options: Options;
  /** `null` when there is no fight */
  fight: Fight | null;
}

const member = (
  id: string,
  name: string,
  role: string,
  level: number,
  [hp, maxHp]: [number, number],
  [mp, maxMp]: [number, number],
  statuses: StatusId[] = [],
): Member => ({ id, name, role, level, hp, maxHp, mp, maxMp, statuses });

const START: GameState = {
  place: 'Mossy Ford',
  playtime: 3 * 60 + 25,
  gold: 120,
  party: [
    member('wren', 'Wren', 'fighter', 4, [42, 50], [6, 10]),
    member('oda', 'Oda', 'mender', 4, [18, 34], [21, 30]),
    member('pim', 'Pim', 'scout', 3, [27, 38], [4, 12]),
  ],
  pack: [
    { item: 'herb', count: 3 },
    { item: 'rope', count: 1 },
    { item: 'tonic', count: 1 },
  ],
  quests: [
    { quest: 'lost-ferry', step: 1, done: false },
    { quest: 'wolves', step: 0, done: false },
    { quest: 'herbs', step: 1, done: true },
  ],
  slots: [
    {
      place: 'Mossy Ford',
      leader: 'Wren',
      level: 4,
      playtime: 3 * 60 + 25,
      savedAt: '2026-11-02T18:40:00.000Z',
    },
    null,
    null,
  ],
  options: DEFAULT_OPTIONS,
  fight: null,
};

const FIGHT: GameState = {
  ...START,
  party: START.party.map(m =>
    m.id === 'wren' ? { ...m, statuses: ['poisoned'] } : m,
  ),
  fight: {
    enemies: [
      { enemy: 'bog-rat', hp: 14, maxHp: 20 },
      { enemy: 'marsh-wisp', hp: 9, maxHp: 9 },
    ],
    turn: 'oda',
  },
};

export type FixtureName =
  | 'start'
  | 'exact'
  | 'broke'
  | 'empty'
  | 'full'
  | 'fight'
  | 'fallen';

/** Whole game states by name; `?state=<name>` opens a screen on one */
export const FIXTURES: Record<FixtureName, GameState> = {
  // Mossy Ford, 3:25 played, 120 gold, one save
  start: START,
  // Exactly the Tonic's price
  exact: { ...START, gold: 25 },
  // Less than a night at camp and less than the cheapest item
  broke: { ...START, gold: 5 },
  // A new game: nothing done, nothing saved, everyone at full strength
  empty: {
    ...START,
    playtime: 0,
    gold: 50,
    party: START.party.map(m => ({ ...m, hp: m.maxHp, mp: m.maxMp })),
    pack: [],
    quests: [],
    slots: [null, null, null],
  },
  // Every slot holds a save
  full: {
    ...START,
    slots: [
      START.slots[0],
      {
        place: 'Hollow Gate',
        leader: 'Wren',
        level: 3,
        playtime: 2 * 60 + 1,
        savedAt: '2026-10-28T09:15:00.000Z',
      },
      {
        place: 'Reedmarsh',
        leader: 'Wren',
        level: 4,
        playtime: 3 * 60 + 53,
        savedAt: '2026-11-03T20:05:00.000Z',
      },
    ],
  },
  // In a fight with the Bog Rat and the Marsh Wisp; Wren is poisoned
  fight: FIGHT,
  // The same, with Pim at 0 HP: nothing else marks Pim as fallen
  fallen: {
    ...FIGHT,
    party: FIGHT.party.map(m => (m.id === 'pim' ? { ...m, hp: 0 } : m)),
  },
};
