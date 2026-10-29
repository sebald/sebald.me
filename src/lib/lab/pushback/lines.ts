/**
 * Every line in the game: the three pools of phrase/counter pairs, the
 * Stakeholder's phrases, and the barks. The tables in
 * `docs/plans/pushback-lines.md` are the source; this file has to match them.
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

/** A pair of a pool: the twenty regular ones per role */
export type PoolPairId =
  `${PoolPrefix}-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20}`;

/** A closer: the three mic-drop lines of a role (`pm-mic-1`) */
export type CloserId = `${PoolPrefix}-mic-${1 | 2 | 3}`;

/** Anything with a phrase and a counter: a pool pair or a closer */
export type PairId = PoolPairId | CloserId;

/** Pairs per pool */
export const POOL_SIZE = 20;

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
      "Great idea! I've put it on the roadmap. Q4. Of next year.",
      "That's not a roadmap, that's a horoscope.",
    ],
    [
      'Trust me, no customer has ever asked for that.',
      'Asked, no. Complained about, every Monday.',
    ],
    [
      "We don't have time to do it right.",
      "Funny how there's always time to do it again.",
    ],
    [
      "Let's ship the MVP and iterate.",
      'Iterate is a big word for “leave it like that”.',
    ],
    [
      "It's low-hanging fruit.",
      "If it's that low, why has nobody picked it in three years?",
    ],
    [
      "The competition already has this. We're falling behind!",
      'They also have a support forum. Have a read.',
    ],
    [
      'I need a quick win for the steering meeting.',
      'Quick wins are why the backlog is full of slow losses.',
    ],
    [
      "It's all in the ticket.",
      'The ticket is one line long. And a screenshot.',
    ],
    [
      "Let's park that in the backlog.",
      'The backlog is where ideas go to die. With a ticket number.',
    ],
    [
      "Just a ballpark. I won't hold you to it.",
      'The last ballpark is in a customer contract.',
    ],
    [
      'Management wants to know when it goes live.',
      "It's been live since March. Nobody noticed.",
    ],
    [
      'This is a must-have for the launch.',
      'So were the last nine. The launch moved. Twice.',
    ],
    [
      "Let's set up a sync to align on this.",
      "We're so aligned we all agree nobody knows.",
    ],
    ["Don't shoot the messenger.", "You're a very creative messenger."],
    [
      'We need to be more agile here.',
      "Any more agile and we'll need a physio.",
    ],
    [
      "It's a small change, how hard can it be?",
      'Small changes are how big outages introduce themselves.',
    ],
    [
      "Let's circle back on that.",
      "We've circled it so often it's a roundabout.",
    ],
    [
      'Quick question, got a sec?',
      'Your last quick question had a follow-up meeting.',
    ],
    [
      'We need to think outside the box.',
      "We can't even find the box. It's somewhere in Confluence.",
    ],
    ["Let's put a pin in that.", 'That idea has more pins than a voodoo doll.'],
  ]),
  ...pool('dev', [
    ['Works on my machine.', "Then we'll ship your machine."],
    [
      "That's not a bug. That's a feature.",
      'Lovely. Put it on the pricing page.',
    ],
    [
      "Honestly, it'd be faster to start from scratch.",
      "That's what you said about the current version.",
    ],
    [
      'Have you tried turning it off and on again?',
      "Twice. Now it's off for good.",
    ],
    [
      'Whoever wrote this legacy code should be fired.',
      'Legacy? You wrote it last sprint.',
    ],
    [
      "We'd need a migration for that.",
      'Last time you migrated, the data emigrated.',
    ],
    [
      'Well, it meets the acceptance criteria.',
      "The criteria were met. The users weren't.",
    ],
    [
      "I'll leave a TODO and come back to it.",
      'Your TODOs are old enough to have TODOs.',
    ],
    ['The code is self-documenting.', 'So is a ransom note.'],
    [
      'Looks like an infrastructure problem to me.',
      "Infrastructure is just someone else's code you can't read.",
    ],
    [
      "Let's split that out into a microservice.",
      'Great. Now the bug is distributed too.',
    ],
    ['The tests pass.', 'The tests test that the tests pass.'],
    ["It's a known issue.", 'Known? It has a fan club by now.'],
    [
      "That's not how the framework wants it.",
      "Give it a week. It'll change its mind.",
    ],
    ["Sorry, that's out of scope.", 'Out of scope, into production.'],
    ["I haven't changed anything.", 'Git says otherwise. Tuesday, 11:40.'],
    [
      "Ignore that red test. It's just flaky.",
      "It's been flaky so long it's load-bearing.",
    ],
    [
      "Don't worry, it's only a temporary fix.",
      'Nothing is more permanent than a temporary fix.',
    ],
    ['Just google it.', 'I did. The top answer is your post from 2019.'],
    ["Easy fix. I'll do it tonight.", 'Easy fixes always come with a sequel.'],
  ]),
  ...pool('designer', [
    [
      'This is off-brand.',
      'The brand changed twice while you were saying that.',
    ],
    ['It looked perfect in Figma.', 'Figma never met a German product name.'],
    [
      'Did you check the latest version of the file?',
      'Final, final_v2 or final_REALLY_this_one?',
    ],
    ["It's one pixel off.", 'And the deadline is one week off. Pick one.'],
    [
      "That's way too complicated for our users.",
      "Our users run their business in Excel. They'll cope.",
    ],
    [
      "Let's do a round of user research first.",
      'We did. The users asked us to stop asking.',
    ],
    [
      'The spacing is inconsistent.',
      "So is the design system. I'm matching it.",
    ],
    [
      'This needs more whitespace.',
      "Any more whitespace and it's a loading screen.",
    ],
    [
      "Something's off, but I can't say what.",
      'Noted. One vague feeling, no steps to reproduce.',
    ],
    ['Can we make it pop more?', 'Bigger, bolder, and slightly on fire?'],
    ['It really needs a dark mode.', 'Great. The bugs will be harder to see.'],
    [
      'Just build it like the prototype.',
      'Sure. Clicking anywhere goes to the next screen?',
    ],
    ['It needs a nice loading animation.', 'Or the page could just load.'],
    [
      "Let's map the user journey first.",
      'The journey map is longer than the journey.',
    ],
    [
      "Users don't read. They scan.",
      'They read it when it says “Delete account”.',
    ],
    [
      'I liked the first version better.',
      'The first version is the one you rejected.',
    ],
    ['We need a design system for that.', "We have three. That's the problem."],
    [
      "Let's use an icon instead of the label.",
      'Perfect. A button that plays charades.',
    ],
    [
      'We should A/B test that first.',
      'Users already picked C: closing the tab.',
    ],
    [
      'The confetti really sells it.',
      'Confetti for a password reset is a lot.',
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
    phrase: "Can't we just call it a feature?",
    answeredBy: 'dev-2',
  },
  {
    id: 'boss-4',
    phrase: 'Have you tried unplugging it? That always works at home.',
    answeredBy: 'dev-4',
  },
  {
    id: 'boss-5',
    phrase: "Put it on my to-do list. I'll get to it.",
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
    phrase: "I showed it to my partner and they didn't get it.",
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
    ["I haven't said no since 2015.", "We can tell. It's all in the product."],
    ['My Gantt chart goes all the way to 2031.', 'So does our technical debt.'],
    [
      "I've written more user stories than Tolkien.",
      'And not one of them has a happy ending.',
    ],
  ]),
  ...closers('dev', [
    [
      'I code in vim. Without syntax highlighting.',
      "That explains the bugs. They're camouflaged.",
    ],
    [
      'I once dropped the production database. Calmly.',
      'The users were less calm.',
    ],
    [
      'Eleven years, zero tests, zero incidents.',
      "Zero incidents reported. That's different.",
    ],
  ]),
  ...closers('designer', [
    [
      "I've done fifty user interviews this month.",
      'And quoted the one who agreed with you.',
    ],
    [
      'I named every colour in this palette. Personally.',
      '“Slightly sadder grey” is not a token.',
    ],
    [
      'My empathy is so strong I cried at a form.',
      'So did the users. At the same form.',
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
export const HINT = 'Pick the reply that answers it.';

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

/**
 * The line of a list whose turn it is: intros and barks rotate with the
 * duel's `encounter`, so a replay doesn't open with the same words
 */
export const inTurn = (lines: readonly string[], encounter = 0): string =>
  lines[Math.abs(encounter) % lines.length]!;

/** The player's line at the end of a duel, picked in turn */
export const PLAYER_BARKS: Record<
  Role,
  { win: readonly string[]; lose: readonly string[] }
> = {
  pm: {
    win: [
      "I'll add that to the release notes.",
      "Great sync, everyone. I'll send a summary.",
      'Marking that one as shipped.',
      "That's going in my quarterly review.",
    ],
    lose: [
      'Noted. Parking it for now.',
      "Good feedback. I'll circle back.",
      "Fine. I'll update the roadmap.",
      "Let's take the learnings and move on.",
    ],
  },
  dev: {
    win: [
      'Closed as fixed.',
      'Merged. Nobody reviewed it.',
      'Deployed on a Friday. Feeling lucky.',
      'LGTM.',
    ],
    lose: [
      'Rolling back my dignity.',
      'That was a breaking change. For me.',
      "Error 418. I'm a teapot.",
      "I'll blame the cache. It's always the cache.",
    ],
  },
  designer: {
    win: [
      'Shipped. Pixel-perfect.',
      "That's going in my portfolio.",
      'Nailed it. On the grid.',
      'Design review: approved. By me.',
    ],
    lose: [
      "I'll take it back to the moodboard.",
      "I'll go stare at some kerning.",
      'Fine. Make the logo bigger.',
      "I'll be in the corner, adjusting a shadow.",
      'Fine. Ship it in Comic Sans.',
    ],
  },
};

/** The Stakeholder loses; keyed to the player's role (the ending) */
export const BOSS_LOSE_BARKS: Record<Role, string> = {
  pm: 'Fine. Put it in the next steering deck. I used to write those.',
  dev: 'Fine. Put it in the next steering deck. I used to review those.',
  designer: 'Fine. Put it in the next steering deck. I used to draw those.',
};

/** The Stakeholder wins; keyed to the pool of the last missed counter, picked in turn */
export const BOSS_WIN_BARKS: Record<Role, readonly string[]> = {
  pm: ['Have you aligned this with product?', 'Did product sign off on this?'],
  dev: [
    'Have you talked to engineering about this?',
    'What does engineering say?',
  ],
  designer: ['Has design seen this?', 'Did design approve this?'],
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
  ...Object.values(PLAYER_BARKS).flatMap(bark => [...bark.win, ...bark.lose]),
  ...Object.values(BOSS_LOSE_BARKS),
  ...Object.values(BOSS_WIN_BARKS).flat(),
  ...Object.values(MENU_PROMPTS),
  ...BUDDY_BARKS,
  BUDDY_MISS_BARK,
];
