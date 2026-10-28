import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  MODES,
  RULES,
  STAKEHOLDER,
  type Slot,
  characterById,
  repertoireFor,
} from './characters';
import {
  type DuelSetup,
  type DuelState,
  SCORE,
  createDuel,
  duelScore,
  isFlawless,
  readingMs,
  reduce,
  showsHint,
  silenceLimit,
  speedPoints,
  toLose,
  toWin,
  wordCount,
} from './duel';
import {
  PAIRS,
  type PairId,
  closersOf,
  isCloserId,
  pairById,
  poolOf,
} from './lines';

const devPool = poolOf('dev').map(p => p.id);
const pmPool = poolOf('pm').map(p => p.id);
/** The tests play with every pair in the deck */
const deck = PAIRS.map(p => p.id);

/** A slot where the opponent never answers a foreign phrase */
const weak: Slot = {
  tier: 1,
  accuracy: 0,
  menu: 4,
  decoys: 'any',
  silence: false,
};
const timed: Slot = {
  tier: 2,
  accuracy: 0,
  menu: 5,
  decoys: 'two',
  silence: true,
};

const setup = (overrides: Partial<DuelSetup> = {}): DuelSetup => {
  const base = {
    role: 'pm' as const,
    character: characterById('junior'),
    slot: weak,
    attempt: 'first' as const,
    deck,
    collected: pmPool,
    seed: 1,
    silence: false,
    ...overrides,
  };
  return {
    repertoire: repertoireFor(base.character, base.deck, base.seed),
    ...base,
  };
};

const begin = (overrides?: Partial<DuelSetup>) =>
  reduce(createDuel(setup(overrides)), { type: 'begin' });

const right = (state: DuelState) =>
  reduce(state, { type: 'counter', phrase: state.exchange!.answer });

const wrong = (state: DuelState) =>
  reduce(state, {
    type: 'counter',
    phrase: state.menu.find(id => id !== state.exchange!.answer)!,
  });

const next = (state: DuelState) => reduce(state, { type: 'continue' });

const throwFirst = (state: DuelState) =>
  reduce(state, { type: 'throw', phrase: state.hand[0]! });

/** Throw the closer on offer: the mic drop */
const dropMic = (state: DuelState) =>
  reduce(state, { type: 'throw', phrase: state.closer! });

/** Play until the end with a strategy per phase */
const play = (
  state: DuelState,
  strategy: {
    defend: (state: DuelState) => DuelState;
    attack?: (state: DuelState) => DuelState;
  },
) => {
  let s = state;
  for (let guard = 0; guard < 100 && s.phase !== 'end'; guard++) {
    if (s.phase === 'defend') s = strategy.defend(s);
    else if (s.phase === 'attack') s = (strategy.attack ?? throwFirst)(s);
    else if (s.phase === 'resolve') s = next(s);
  }
  return s;
};

describe('a regular duel', () => {
  it('opens with the opponent throwing from its repertoire', () => {
    const s = begin();
    assert.equal(s.phase, 'defend');
    assert.equal(s.exchange?.by, 'opponent');
    assert.ok(s.setup.repertoire.includes(s.exchange!.phrase as PairId));
    assert.equal(s.menu.length, 4);
    assert.ok(s.menu.includes(s.exchange!.answer));
  });

  it('a right counter pushes the scale, gains momentum and takes the initiative', () => {
    const s = right(begin());
    assert.equal(s.phase, 'resolve');
    assert.equal(s.scale, 1);
    assert.deepEqual(s.momentum, { player: 1, opponent: 0 });
    assert.equal(next(s).phase, 'attack');
  });

  it('a miss pushes the scale back, resets momentum and shows the counter', () => {
    const s = wrong(begin());
    assert.equal(s.scale, -1);
    assert.equal(s.momentum.player, 0);
    assert.equal(s.outcome?.winner, 'opponent');
    assert.equal(s.lastMissPool, 'dev');
    assert.equal(s.stats.missesByPool.dev, 1);
    assert.equal(next(s).phase, 'defend');
  });

  it('collects the defended pair, win or lose', () => {
    const won = right(begin());
    const lost = wrong(begin());
    for (const s of [won, lost]) {
      assert.equal(s.collected.length, pmPool.length + 1);
      assert.ok(s.collected.includes(s.exchange!.phrase as PairId));
    }
  });

  it('draws the hand from collected phrases only', () => {
    const s = next(right(begin()));
    assert.equal(s.hand.length, RULES.hand);
    assert.ok(s.hand.every(id => s.collected.includes(id)));
  });

  it('a landed phrase scores and keeps the initiative', () => {
    const s = throwFirst(next(right(begin())));
    assert.equal(s.outcome?.winner, 'player');
    assert.equal(s.scale, 2);
    assert.equal(s.momentum.player, 2);
    assert.ok(s.spent.length === 1);
    assert.equal(next(s).phase, 'attack');
  });

  it('a countered phrase hands the initiative over', () => {
    const strong: Slot = { ...weak, accuracy: 1 };
    const s = throwFirst(next(right(begin({ slot: strong }))));
    assert.equal(s.outcome?.winner, 'opponent');
    assert.equal(s.momentum.player, 0);
    assert.equal(s.momentum.opponent, 1);
    assert.equal(next(s).phase, 'defend');
  });

  it("ends when the scale reaches the player's side", () => {
    const s = play(begin(), { defend: right });
    assert.equal(s.phase, 'end');
    assert.equal(s.winner, 'player');
    assert.equal(s.scale, toWin(s));
    assert.ok(isFlawless(s));
    assert.equal(s.stats.exchangesWon, 3);
  });

  it("loses when the scale reaches the opponent's side", () => {
    const s = play(begin(), { defend: wrong });
    assert.equal(s.winner, 'opponent');
    assert.equal(s.scale, -toLose(s));
    assert.ok(!isFlawless(s));
  });

  it('the opponent tires: an equal duel still ends', () => {
    // Counters land and, at first, so do the opponent's: the scale swings
    // 1, 0, 1, 0… until fatigue makes a counter miss
    const strong: Slot = { ...weak, accuracy: 1 };
    const s = play(begin({ slot: strong }), { defend: right });
    assert.equal(s.phase, 'end');
    assert.equal(s.winner, 'player');
    assert.ok(s.exchanges <= 2 / RULES.fatigue + 2 * RULES.reach);
  });

  it('without fatigue two perfect duellists trade for ever', () => {
    const strong: Slot = { ...weak, accuracy: 1 };
    const tireless = { ...RULES, fatigue: 0 };
    let s = begin({ slot: strong, rules: tireless });
    for (let i = 0; i < 40; i++) {
      s = next(s.phase === 'defend' ? right(s) : throwFirst(s));
    }
    assert.equal(s.scale, 0);
    assert.notEqual(s.phase, 'end');
  });

  it('ignores actions out of phase', () => {
    const s = begin();
    assert.equal(reduce(s, { type: 'throw', phrase: 'pm-1' }), s);
    assert.equal(reduce(s, { type: 'continue' }), s);
    assert.equal(reduce(s, { type: 'counter', phrase: 'des-8' }), s);
  });

  it('replays identically under the same seed', () => {
    const a = play(begin({ seed: 99 }), { defend: right });
    const b = play(begin({ seed: 99 }), { defend: right });
    assert.deepEqual(a, b);
  });

  it('shows the hint on the first exchange of the tutorial only', () => {
    assert.ok(showsHint(begin({ tutorial: true })));
    assert.ok(!showsHint(begin()));
    assert.ok(!showsHint(next(right(begin({ tutorial: true })))));
  });
});

describe('the mic drop', () => {
  const full = (): DuelState => {
    // A counter and a landed phrase fill momentum; a wide reach so the
    // duel does not end on the drop
    let s = next(right(begin({ rules: { ...RULES, reach: 6 } })));
    s = next(throwFirst(s));
    return s;
  };

  it('offers a closer of the role at full momentum, and throwing it costs the bar', () => {
    const s = full();
    assert.equal(s.momentum.player, RULES.momentum);
    assert.ok(s.closer && isCloserId(s.closer));
    assert.equal(pairById(s.closer!).role, s.setup.role);
    assert.ok(!s.hand.includes(s.closer!));
    const dropped = dropMic(s);
    assert.ok(dropped.exchange?.micDrop);
    assert.equal(dropped.exchange?.phrase, s.closer);
    assert.equal(dropped.stats.micDrops, 1);
    assert.equal(dropped.scale, 2 + RULES.micDrop.worth);
    assert.equal(dropped.momentum.player, 1);
  });

  it('a phrase from the hand at full momentum is not a mic drop', () => {
    const s = full();
    const thrown = throwFirst(s);
    assert.ok(!thrown.exchange?.micDrop);
    assert.equal(thrown.stats.micDrops, 0);
    assert.equal(thrown.momentum.player, RULES.momentum);
  });

  it('offers the three closers in turn, the same one until it is thrown', () => {
    const rules = { ...RULES, reach: 9 };
    let s = next(right(begin({ rules })));
    s = next(throwFirst(s)); // momentum full: a closer on offer
    const first = s.closer!;
    s = next(throwFirst(s)); // not thrown: still on offer
    assert.equal(s.closer, first);
    s = next(dropMic(s)); // thrown: momentum 1, nothing on offer
    assert.equal(s.closer, null);
    s = next(throwFirst(s));
    s = next(throwFirst(s)); // full again: the next closer
    assert.ok(s.closer && s.closer !== first);
  });

  it('countered, it pushes the scale back by the same two', () => {
    const strong: Slot = { ...weak, accuracy: 1 };
    let s = next(right(begin({ rules: { ...RULES, reach: 6 } })));
    s = next(throwFirst(s)); // lands against the weak slot: momentum full
    assert.equal(s.momentum.player, RULES.momentum);
    // The opponent answers everything from here on
    s = { ...s, setup: { ...s.setup, slot: strong } };
    const dropped = dropMic(s);
    assert.ok(dropped.exchange?.micDrop);
    assert.equal(dropped.outcome?.winner, 'opponent');
    assert.equal(dropped.scale, 2 - RULES.micDrop.worth);
  });

  it('is not on offer before, and a closer thrown then is ignored', () => {
    const s = next(right(begin()));
    assert.equal(s.closer, null);
    const closer = closersOf(s.setup.role)[0]!.id;
    assert.equal(reduce(s, { type: 'throw', phrase: closer }), s);
  });

  it('is answered at the slot accuracy, never from the repertoire', () => {
    // The weak slot answers nothing foreign, so a closer lands every
    // time, although the opponent answers its own pool without fail
    let s = next(right(begin({ rules: { ...RULES, reach: 9 } })));
    s = next(throwFirst(s));
    for (let i = 0; i < 5; i++) {
      const dropped = dropMic({ ...s, setup: { ...s.setup, seed: i } });
      assert.equal(dropped.outcome?.winner, 'player');
    }
  });

  it('by the opponent grows the menu and moves the scale two either way', () => {
    // Tier 1 drops as soon as full: let the opponent win two exchanges
    const strong: Slot = { ...weak, accuracy: 1 };
    let s = next(right(begin({ slot: strong, rules: { ...RULES, reach: 9 } })));
    s = next(throwFirst(s)); // countered: opponent momentum 1
    s = next(wrong(s)); // landed: 2, the next throw drops the mic
    assert.equal(s.phase, 'defend');
    assert.ok(s.exchange?.micDrop);
    // With one of the opponent's closers, whose counter is in the menu
    assert.ok(isCloserId(s.exchange!.phrase));
    assert.equal(pairById(s.exchange!.phrase as PairId).role, 'dev');
    assert.ok(s.menu.includes(s.exchange!.answer));
    assert.equal(s.menu.length, RULES.micDrop.menu);
    assert.equal(s.momentum.opponent, 0);
    const before = s.scale;
    assert.equal(wrong(s).scale, before - RULES.micDrop.worth);
    assert.equal(right(s).scale, before + RULES.micDrop.worth);
  });
});

describe('the silence bar', () => {
  const timedSetup = { slot: timed, silence: true };

  it('does not run where the mode has no timer, and every counter is fast', () => {
    const s = begin({ ...timedSetup, rules: MODES.easy.rules });
    assert.equal(s.silence, null);
    const won = right(reduce(s, { type: 'tick', ms: 60_000 }));
    assert.equal(won.momentum.player, 1);
  });

  it('runs only when the switch is on and the slot has the bar', () => {
    assert.equal(begin().silence, null);
    assert.equal(begin({ slot: timed }).silence, null);
    const s = begin(timedSetup);
    assert.deepEqual(s.silence, {
      elapsed: 0,
      limit: silenceLimit(RULES, s.menu, false),
    });
  });

  it("is the rules' share of the menu's reading time, on the frame", () => {
    // Five counters of eight words at four words a second: ten seconds
    // to read, eleven with normal's margin, seven in hard mode
    const menu = ['pm-1', 'pm-2', 'pm-3', 'pm-4', 'pm-5'] as const;
    const words = menu.reduce(
      (n, id) => n + wordCount(pairById(id).counter),
      0,
    );
    const limit = silenceLimit(RULES, menu, false);
    assert.equal(limit, Math.round((words / 4) * 1.1 * 8) * 125);
    assert.ok(limit >= 9000 && limit <= 15000, String(limit));
    assert.equal(
      silenceLimit(MODES.hard.rules, menu, false),
      Math.round((words / 4) * 0.7 * 8) * 125,
    );
    assert.equal(
      wordCount('  Same quarter you promised the last one, then. '),
      8,
    );
  });

  it('plays the fallback as a miss when it runs out', () => {
    const s = reduce(begin(timedSetup), { type: 'tick', ms: 20000 });
    assert.equal(s.phase, 'resolve');
    assert.equal(s.outcome?.picked, 'fallback');
    assert.equal(s.outcome?.winner, 'opponent');
  });

  it('gives momentum for a fast counter only', () => {
    const half = begin(timedSetup).silence!.limit / 2;
    const fast = right(reduce(begin(timedSetup), { type: 'tick', ms: 1000 }));
    const slow = right(
      reduce(begin(timedSetup), { type: 'tick', ms: half + 125 }),
    );
    assert.equal(fast.momentum.player, 1);
    assert.equal(slow.momentum.player, 0);
    assert.equal(slow.scale, 1);
  });

  it('runs shorter on a mic drop', () => {
    const strong: Slot = { ...timed, accuracy: 1 };
    let s = next(
      right(
        begin({ slot: strong, silence: true, rules: { ...RULES, reach: 9 } }),
      ),
    );
    s = next(throwFirst(s));
    s = next(wrong(s));
    assert.ok(s.exchange?.micDrop);
    assert.equal(
      s.silence?.limit,
      silenceLimit({ ...RULES, reach: 9 }, s.menu, true),
    );
    assert.ok(s.silence!.limit < silenceLimit(RULES, s.menu, false));
  });
});

describe('the boss barrage', () => {
  const boss = (overrides: Partial<DuelSetup> = {}) =>
    begin({
      character: STAKEHOLDER,
      slot: {
        tier: 'boss',
        accuracy: 1,
        menu: 6,
        decoys: 'all',
        silence: false,
      },
      collected: [...pmPool, ...devPool],
      ...overrides,
    });

  it('the player needs four steps, the Stakeholder three', () => {
    const s = boss();
    assert.equal(toWin(s), RULES.bossReach);
    assert.equal(toLose(s), RULES.bossMisses);
    assert.equal(s.phase, 'defend');
    assert.equal(s.menu.length, 6);
  });

  it('ends under every outcome, the barrage going round', () => {
    for (let pattern = 0; pattern < 512; pattern++) {
      let phrase = 0;
      const s = play(boss(), {
        defend: state => ((pattern >> phrase++) & 1 ? right : wrong)(state),
        attack: state => throwFirst(state),
      });
      assert.equal(s.phase, 'end', `pattern ${pattern}`);
      assert.equal(s.winner, s.scale > 0 ? 'player' : 'opponent');
    }
  });

  it('keeps the initiative: a right counter leads to the next phrase', () => {
    const s = next(right(boss()));
    assert.equal(s.phase, 'defend');
    assert.equal(s.exchange?.by, 'opponent');
  });

  it('grants the interrupt at full momentum only, worth two and offline', () => {
    let s = boss({ rules: { ...RULES, bossReach: 9 } });
    s = next(right(s));
    assert.equal(s.phase, 'defend');
    s = next(right(s));
    assert.equal(s.phase, 'attack');
    assert.equal(s.momentum.player, RULES.momentum);
    const dropped = throwFirst(s);
    assert.ok(dropped.outcome?.offline);
    assert.equal(dropped.scale, 2 + RULES.micDrop.worth);
    assert.equal(dropped.momentum.player, 0);
    assert.equal(next(dropped).phase, 'defend');
  });

  it('two fast counters and the interrupt win flawless in three exchanges', () => {
    const s = play(boss(), { defend: right });
    assert.equal(s.winner, 'player');
    assert.equal(s.exchanges, 3);
    assert.ok(isFlawless(s));
    assert.equal(s.stats.micDrops, 1);
  });

  it('keys the loss to the pool of the last missed counter', () => {
    const s = play(boss(), { defend: wrong });
    assert.equal(s.winner, 'opponent');
    assert.equal(s.exchanges, RULES.bossMisses);
    assert.ok(s.lastMissPool !== null);
  });

  it('does not collect boss phrases', () => {
    const s = right(boss());
    assert.equal(s.collected.length, pmPool.length + devPool.length);
  });
});

describe('the score', () => {
  it('gives speed points by the share of the reading time left', () => {
    assert.equal(speedPoints(0, 10_000), SCORE.speed);
    assert.equal(speedPoints(2500, 10_000), 75);
    assert.equal(speedPoints(10_000, 10_000), 0);
    assert.equal(speedPoints(30_000, 10_000), 0);
  });

  it('adds speed points for a right counter, timer or not', () => {
    const s = begin({ rules: MODES.easy.rules });
    const reading = readingMs(s.menu);
    const ticked = reduce(s, { type: 'tick', ms: Math.round(reading / 2) });
    assert.equal(ticked.answerMs, Math.round(reading / 2));
    const done = right(ticked);
    assert.equal(done.stats.speed, speedPoints(ticked.answerMs, reading));
    assert.ok(done.stats.speed > 0);
    // A miss scores nothing
    assert.equal(wrong(begin()).stats.speed, 0);
  });

  it('scores a won duel by its points times the mode, nothing for a loss', () => {
    const won: DuelState = {
      ...createDuel(setup()),
      phase: 'end',
      winner: 'player',
      stats: {
        exchangesWon: 3,
        exchangesLost: 0,
        micDrops: 1,
        missesByPool: { pm: 0, dev: 0, designer: 0 },
        speed: 180,
      },
    };
    // 3 × 100 + 180 + 200 + 500 win + 500 flawless = 1680
    assert.equal(duelScore({ ...won, rules: MODES.easy.rules }), 1680);
    assert.equal(duelScore({ ...won, rules: MODES.normal.rules }), 2520);
    assert.equal(duelScore({ ...won, rules: MODES.hard.rules }), 3360);
    assert.equal(duelScore({ ...won, winner: 'opponent' }), 0);
  });
});
