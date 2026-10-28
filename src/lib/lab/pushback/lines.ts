/**
 * Every line in the game: the three pools of phrase/counter pairs, the
 * Stakeholder's phrases, and the barks. The tables in
 * `docs/plans/pushback.md` are the source; this file has to match them.
 *
 * Rules for a line: role-neutral (never names the target's role), under
 * 70 characters, no names, and a counter has to read as a reply even out
 * of context (the decoy menus and the boss depend on that).
 */

export type Role = 'pm' | 'dev' | 'designer';
export const ROLES: readonly Role[] = ['pm', 'dev', 'designer'];

export const ROLE_LABELS: Record<Role, string> = {
  pm: 'PM',
  dev: 'Dev',
  designer: 'Designer',
};

/** A phrase and the one counter that answers it */
export interface Pair {
  id: PairId;
  role: Role;
  phrase: string;
  counter: string;
}

/** Prefix of a pool's pair ids (`pm-1`, `dev-1`, `des-1`) */
export const POOL_PREFIX = { pm: 'pm', dev: 'dev', designer: 'des' } as const;
type PoolPrefix = (typeof POOL_PREFIX)[Role];

/** A pair of a pool: the sixteen regular ones per role */
export type PoolPairId =
  `${PoolPrefix}-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16}`;

/** A closer: the three mic-drop lines of a role (`pm-mic-1`) */
export type CloserId = `${PoolPrefix}-mic-${1 | 2 | 3}`;

/** Anything with a phrase and a counter: a pool pair or a closer */
export type PairId = PoolPairId | CloserId;

/** Pairs per pool */
export const POOL_SIZE = 16;

/** Closers per role */
export const CLOSERS_PER_ROLE = 3;

/** A boss phrase, answered by a regular counter */
export interface BossPair {
  id: BossPairId;
  phrase: string;
  answeredBy: PairId;
}

export type BossPairId =
  `boss-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

/** Longest line that fits two rows of the dialogue box */
export const MAX_LINE_LENGTH = 70;

const pool = (role: Role, lines: [phrase: string, counter: string][]): Pair[] =>
  lines.map(([phrase, counter], index) => ({
    id: `${POOL_PREFIX[role]}-${(index + 1) as 1}`,
    role,
    phrase,
    counter,
  }));

const closers = (
  role: Role,
  lines: [phrase: string, counter: string][],
): Pair[] =>
  lines.map(([phrase, counter], index) => ({
    id: `${POOL_PREFIX[role]}-mic-${(index + 1) as 1}`,
    role,
    phrase,
    counter,
  }));

export const PAIRS: readonly Pair[] = [
  ...pool('pm', [
    [
      "I've put your idea on the roadmap. Q4. Of next year.",
      'Same quarter you promised the last one, then.',
    ],
    [
      "The customer doesn't care about that.",
      "The customer hasn't been told. That part is your job.",
    ],
    [
      "We don't have time to do it right.",
      "We'll have time to do it twice, then.",
    ],
    [
      'Can we just ship it and iterate?',
      "We shipped it. You're looking at the iteration.",
    ],
    [
      'This is a two-pointer, tops.',
      "Then you won't mind if I estimate your roadmap.",
    ],
    [
      'Our competitor already has this feature.',
      'And their users are already complaining about it.',
    ],
    [
      'I need a quick win for the steering meeting.',
      'Quick wins are why the backlog is full of slow losses.',
    ],
    [
      'Have you even read the PRD?',
      'Have you? It contradicts itself on page two.',
    ],
    [
      "Let's park that in the backlog.",
      'The backlog is where ideas go to be forgotten politely.',
    ],
    [
      'Can you give me a rough estimate? No commitment.',
      "Sure. And you'll quote it as a deadline by lunch.",
    ],
    [
      "Stakeholders are asking why it's not live yet.",
      "Tell them it's live. They haven't opened the app since May.",
    ],
    [
      'This is a must-have for the launch.',
      'So were the last nine. The launch moved. Twice.',
    ],
    [
      "Let's align on this in a quick sync.",
      'We aligned yesterday. Then you changed the goal.',
    ],
    [
      "I'm just the messenger here.",
      "Messengers don't rewrite the message on the way.",
    ],
    [
      "We'll validate it after launch.",
      'Launch is the expensive way to validate.',
    ],
    [
      "It's a small change, how hard can it be?",
      'Small on the slide. Big in the code. Ask anyone.',
    ],
  ]),
  ...pool('dev', [
    ['Works on my machine.', "Then we'll ship your machine."],
    [
      "That's not a bug, that's undocumented behaviour.",
      'Then document it. In the changelog. Under "bugs".',
    ],
    [
      'That would take three sprints and a rewrite.',
      'Funny, the prototype took an afternoon.',
    ],
    [
      'Have you tried turning it off and on again?',
      'Yes. The feature stayed off. Users noticed.',
    ],
    [
      'The legacy code is the problem, not me.',
      'You wrote the legacy code. In March.',
    ],
    [
      "We'd need a migration for that.",
      'You need a migration for a button label.',
    ],
    [
      "It's technically correct.",
      'Technically correct and nobody can use it. Well done.',
    ],
    [
      "I'll fix it in a follow-up PR.",
      'That follow-up has been open since the last reorg.',
    ],
    ["Can't reproduce.", 'Then come to my desk. It reproduces fine there.'],
    [
      "That's a config issue, not a code issue.",
      "You wrote the config. It's checked into the code.",
    ],
    [
      "We'll need to refactor first.",
      'You said that before the last two features. They shipped.',
    ],
    ['The tests pass.', 'The tests test that the tests pass.'],
    ["It's a known issue.", "Known since when? It's new to the users."],
    [
      "The framework doesn't support that.",
      "The framework's docs do. Page one.",
    ],
    [
      "That's out of scope for this ticket.",
      'Then the ticket is out of scope for the feature.',
    ],
    [
      "I didn't touch that part of the code.",
      'Git says otherwise. Tuesday, 11:40.',
    ],
  ]),
  ...pool('designer', [
    [
      'This is off-brand.',
      'The brand changed twice while you were saying that.',
    ],
    [
      "That's not how it looks in Figma.",
      "Figma doesn't have to load on a train.",
    ],
    [
      'Did you even open the design file?',
      'I did. Which of the forty pages is the real one?',
    ],
    ["It's one pixel off.", 'And the deadline is one week off. Pick one.'],
    [
      'Users will never understand that.',
      'They understood the old version. You redesigned it.',
    ],
    [
      'We should test this with real users first.',
      'The last test loved it. You redesigned it anyway.',
    ],
    [
      'The spacing is inconsistent.',
      "So is the design system. I'm matching it.",
    ],
    [
      'This needs more whitespace.',
      "The sidebar is ninety percent whitespace. It's called empty.",
    ],
    [
      "It doesn't feel right.",
      "Feelings aren't specs. Tell me what to change.",
    ],
    [
      'Can we make it pop more?',
      "It pops. It's the only thing on the page that does.",
    ],
    [
      'I need the real content before I can design it.',
      'You designed the last three with lorem ipsum.',
    ],
    [
      "That interaction isn't in the prototype.",
      "The prototype also doesn't have an error state.",
    ],
    [
      "We can't ship it without the animation.",
      "The animation is why it can't ship on a phone.",
    ],
    [
      'The user flow is broken.',
      'The flow has one step. Which part is broken?',
    ],
    [
      'Nobody reads the text anyway.',
      "They read it when it says 'Delete account'.",
    ],
    [
      "Let's go back to the original concept.",
      'Which one? There were five original concepts.',
    ],
  ]),
];

export const BOSS_PAIRS: readonly BossPair[] = [
  {
    id: 'boss-1',
    phrase: "I don't see why this can't be done by Friday.",
    answeredBy: 'pm-3',
  },
  {
    id: 'boss-2',
    phrase: "The competitor's demo looked much slicker.",
    answeredBy: 'pm-6',
  },
  {
    id: 'boss-3',
    phrase: 'I never approved any of this.',
    answeredBy: 'dev-2',
  },
  {
    id: 'boss-4',
    phrase: 'Just switch it off until the investors have left.',
    answeredBy: 'dev-4',
  },
  {
    id: 'boss-5',
    phrase: "We'll revisit the budget for that next quarter.",
    answeredBy: 'dev-8',
  },
  {
    id: 'boss-6',
    phrase: 'My nephew says the whole app looks dated.',
    answeredBy: 'des-1',
  },
  {
    id: 'boss-7',
    phrase: 'I was told this was a small change.',
    answeredBy: 'pm-16',
  },
  {
    id: 'boss-8',
    phrase: 'This is non-negotiable for the launch.',
    answeredBy: 'pm-12',
  },
  {
    id: 'boss-9',
    phrase: 'I was told all the tests pass.',
    answeredBy: 'dev-12',
  },
  {
    id: 'boss-10',
    phrase: 'Make the logo bigger.',
    answeredBy: 'des-10',
  },
  {
    id: 'boss-11',
    phrase: "I showed it to my wife and she didn't get it.",
    answeredBy: 'des-9',
  },
  {
    id: 'boss-12',
    phrase: 'Can we lose all that text?',
    answeredBy: 'des-15',
  },
];

/**
 * The closers: three mic-drop lines per role, louder than the pool's,
 * with a counter each. The one on offer is the mic drop: with full
 * momentum it joins the player's hand, in gold, and throwing it is the
 * drop; an opponent at full momentum throws one of its role's. Outside
 * every deck and repertoire, so nobody answers them from memory: a
 * colleague counters a closer at the slot's accuracy, tired or not. The
 * player knows their own three from the start and collects the foreign
 * six on defence like any pair.
 */
export const CLOSERS: readonly Pair[] = [
  ...closers('pm', [
    [
      'I have the numbers, the slides and the room. Pick one.',
      'You have the room because everyone else left it.',
    ],
    [
      "The roadmap isn't a suggestion.",
      "It isn't a plan either. It's a wish list with dates.",
    ],
    [
      "Say no to this and you're saying no to the customer.",
      'The customer said no first. I have the recording.',
    ],
  ]),
  ...closers('dev', [
    [
      "Works on my machine. We're shipping my machine.",
      'Your machine is why we have an on-call rota.',
    ],
    [
      'Four hundred review comments. I wrote every one of them.',
      'And I resolved every one of them. Unread. Approved.',
    ],
    [
      "It's not a bug. It's the spec, compiled.",
      'Then the bug is in the spec. Assigning it to you.',
    ],
  ]),
  ...closers('designer', [
    [
      "I have forty screens that say you're wrong.",
      'I have one user who says you are. Shall we watch the tape?',
    ],
    [
      'Every pixel here is intentional.',
      'Including the ones that moved since Tuesday?',
    ],
    [
      "This isn't a preference. It's the system.",
      'The system has eight button styles. Which one is it?',
    ],
  ]),
];

/** The pairs whose counters answer a boss phrase; a run's deck keeps some of each pool */
export const BOSS_ANSWERS: ReadonlySet<PairId> = new Set(
  BOSS_PAIRS.map(pair => pair.answeredBy),
);

const pairIndex = new Map([...PAIRS, ...CLOSERS].map(pair => [pair.id, pair]));
const closerIndex = new Map(CLOSERS.map(pair => [pair.id, pair]));
const bossIndex = new Map(BOSS_PAIRS.map(pair => [pair.id, pair]));

export const pairById = (id: PairId): Pair => {
  const pair = pairIndex.get(id);
  if (!pair) throw new Error(`Unknown pair ${id}`);
  return pair;
};

export const bossPairById = (id: BossPairId): BossPair => {
  const pair = bossIndex.get(id);
  if (!pair) throw new Error(`Unknown boss pair ${id}`);
  return pair;
};

export const isBossPairId = (id: string): id is BossPairId =>
  bossIndex.has(id as BossPairId);

export const isPairId = (id: unknown): id is PairId =>
  typeof id === 'string' && pairIndex.has(id as PairId);

export const isCloserId = (id: string): id is CloserId =>
  closerIndex.has(id as CloserId);

/** The pairs of one pool (the closers are not in it) */
export const poolOf = (role: Role): Pair[] =>
  PAIRS.filter(pair => pair.role === role);

/** The three closers of a role */
export const closersOf = (role: Role): Pair[] =>
  CLOSERS.filter(pair => pair.role === role);

/** The pool pairs among some ids: what the glossary counts */
export const poolPairs = (ids: readonly PairId[]): PoolPairId[] =>
  ids.filter((id): id is PoolPairId => !isCloserId(id));

/** The ids of one pool within a run's deck, in the deck's order */
export const deckPool = (deck: readonly PairId[], role: Role): PairId[] =>
  deck.filter(id => pairById(id).role === role);

/** The pool a phrase belongs to; a boss phrase counts as its counter's */
export const poolOfPhrase = (id: PairId | BossPairId): Role =>
  isBossPairId(id)
    ? pairById(bossPairById(id).answeredBy).role
    : pairById(id).role;

// Barks and fallbacks
// ---------------

/** Spoken by the defender when the silence bar runs out; counts as a miss */
export const FALLBACK = "Uh… that's a good point.";

/** Shown on the first exchange of a run */
export const HINT = 'Pick the reply that answers it';

/** Above the options, what the menu is for */
export const MENU_PROMPTS = {
  attack: 'Your turn. Pick a phrase to throw.',
  /** A closer is on offer: the gold line */
  micDrop: 'Full momentum. The gold line drops the mic.',
  defend: 'Pick your counter.',
} as const;

/** The Stakeholder's line when the player interrupts with a mic drop */
export const OFFLINE = "Let's take this offline.";

/**
 * The onboarding buddy: the ghost of the player's predecessor in the
 * role. It appears when the player hesitates on defence and whispers
 * the reply by dimming the wrong counters; the line is the dig that comes
 * with the help. One per appearance, in turn.
 */
export const BUDDY_BARKS: readonly string[] = [
  'Let me help you, new hire.',
  'I had this one on my second day.',
  'Read it again. Slowly. I have time. I have nothing but time.',
  "I'm not haunting you. I'm onboarding you.",
];

/** The buddy, when the player misses after the whisper */
export const BUDDY_MISS_BARK = 'I dimmed them. I literally dimmed them.';

export const PLAYER_BARKS: Record<Role, { win: string; lose: string }> = {
  pm: {
    win: "I'll add that to the release notes.",
    lose: 'Noted. Parking it for now.',
  },
  dev: {
    win: 'Closed as fixed.',
    lose: "Fine. I'll open a ticket.",
  },
  designer: {
    win: 'Shipped. Pixel-perfect.',
    lose: "I'll take it back to the moodboard.",
  },
};

/** The Stakeholder loses; keyed to the player's role (the ending) */
export const BOSS_LOSE_BARKS: Record<Role, string> = {
  pm: 'Fine. Put it in the next steering deck. I used to write those.',
  dev: 'Fine. Put it in the next steering deck. I used to review those.',
  designer: 'Fine. Put it in the next steering deck. I used to draw those.',
};

/** The Stakeholder wins; keyed to the pool of the last missed counter */
export const BOSS_WIN_BARKS: Record<Role, string> = {
  pm: 'Have you aligned this with product?',
  dev: 'Have you talked to engineering about this?',
  designer: 'Has design seen this?',
};

/** Blurbs on the role-select screen */
export const ROLE_BLURBS: Record<Role, string> = {
  pm: 'Has a roadmap and is not afraid to use it.',
  dev: 'Will fix it in the next sprint. Which sprint is a detail.',
  designer: 'Has opinions about your line height.',
};

/** Every line that can appear in the dialogue box, for the length check */
export const allLines = (): string[] => [
  ...[...PAIRS, ...CLOSERS].flatMap(pair => [pair.phrase, pair.counter]),
  ...BOSS_PAIRS.map(pair => pair.phrase),
  FALLBACK,
  HINT,
  OFFLINE,
  ...Object.values(PLAYER_BARKS).flatMap(bark => [bark.win, bark.lose]),
  ...Object.values(BOSS_LOSE_BARKS),
  ...Object.values(BOSS_WIN_BARKS),
];
