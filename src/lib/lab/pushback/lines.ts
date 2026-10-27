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
export type PairId =
  `${(typeof POOL_PREFIX)[Role]}-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

/** A boss phrase, answered by a regular counter */
export interface BossPair {
  id: BossPairId;
  phrase: string;
  answeredBy: PairId;
}

export type BossPairId = `boss-${1 | 2 | 3 | 4 | 5 | 6}`;

/** Longest line that fits two rows of the dialogue box */
export const MAX_LINE_LENGTH = 70;

const pool = (role: Role, lines: [phrase: string, counter: string][]): Pair[] =>
  lines.map(([phrase, counter], index) => ({
    id: `${POOL_PREFIX[role]}-${(index + 1) as 1}`,
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
];

const pairIndex = new Map(PAIRS.map(pair => [pair.id, pair]));
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

/** The pairs of one pool */
export const poolOf = (role: Role): Pair[] =>
  PAIRS.filter(pair => pair.role === role);

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

/** Shown on the second exchange of a run: the strip under the opponent's name */
export const COMPOSURE_HINT =
  'The strip under their name is their composure. Every exchange wears it down, and a tired colleague fumbles their lines.';

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
  ...PAIRS.flatMap(pair => [pair.phrase, pair.counter]),
  ...BOSS_PAIRS.map(pair => pair.phrase),
  FALLBACK,
  HINT,
  OFFLINE,
  ...Object.values(PLAYER_BARKS).flatMap(bark => [bark.win, bark.lose]),
  ...Object.values(BOSS_LOSE_BARKS),
  ...Object.values(BOSS_WIN_BARKS),
];
