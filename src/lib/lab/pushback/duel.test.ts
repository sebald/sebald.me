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
  createDuel,
  isFlawless,
  reduce,
  showsHint,
  silenceLimit,
  toLose,
  toWin,
  wordCount,
} from './duel';
import { PAIRS, type PairId, pairById, poolOf } from './lines';

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

const throwFirst = (state: DuelState, micDrop = false) =>
  reduce(state, { type: 'throw', phrase: state.hand[0]!, micDrop });

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

  it('is available at full momentum and costs the bar', () => {
    const s = full();
    assert.equal(s.momentum.player, RULES.momentum);
    assert.ok(s.micDropAvailable);
    const dropped = throwFirst(s, true);
    assert.ok(dropped.exchange?.micDrop);
    assert.equal(dropped.stats.micDrops, 1);
    assert.equal(dropped.scale, 2 + RULES.micDrop.worth);
    assert.equal(dropped.momentum.player, 1);
  });

  it('countered, it pushes the scale back by the same two', () => {
    const strong: Slot = { ...weak, accuracy: 1 };
    let s = next(right(begin({ rules: { ...RULES, reach: 6 } })));
    s = next(throwFirst(s)); // lands against the weak slot: momentum full
    assert.equal(s.momentum.player, RULES.momentum);
    // The opponent answers everything from here on
    s = { ...s, setup: { ...s.setup, slot: strong } };
    const dropped = throwFirst(s, true);
    assert.ok(dropped.exchange?.micDrop);
    assert.equal(dropped.outcome?.winner, 'opponent');
    assert.equal(dropped.scale, 2 - RULES.micDrop.worth);
  });

  it('is not available before', () => {
    const s = next(right(begin()));
    assert.ok(!s.micDropAvailable);
    const thrown = throwFirst(s, true);
    assert.ok(!thrown.exchange?.micDrop);
    assert.equal(thrown.stats.micDrops, 0);
  });

  it('by the opponent grows the menu and moves the scale two either way', () => {
    // Tier 1 drops as soon as full: let the opponent win two exchanges
    const strong: Slot = { ...weak, accuracy: 1 };
    let s = next(right(begin({ slot: strong, rules: { ...RULES, reach: 9 } })));
    s = next(throwFirst(s)); // countered: opponent momentum 1
    s = next(wrong(s)); // landed: 2, the next throw drops the mic
    assert.equal(s.phase, 'defend');
    assert.ok(s.exchange?.micDrop);
    assert.equal(s.menu.length, RULES.micDrop.menu);
    assert.equal(s.momentum.opponent, 0);
    const before = s.scale;
    assert.equal(wrong(s).scale, before - RULES.micDrop.worth);
    assert.equal(right(s).scale, before + RULES.micDrop.worth);
  });
});

describe('the silence bar', () => {
  const timedSetup = { slot: timed, silence: true };

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
    // to read, eight to find the right one halfway down, seven in hard mode
    const menu = ['pm-1', 'pm-2', 'pm-3', 'pm-4', 'pm-5'] as const;
    const words = menu.reduce(
      (n, id) => n + wordCount(pairById(id).counter),
      0,
    );
    const limit = silenceLimit(RULES, menu, false);
    assert.equal(limit, Math.round((words / 4) * 0.8 * 8) * 125);
    assert.ok(limit >= 7000 && limit <= 11000, String(limit));
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
    const fast = right(reduce(begin(timedSetup), { type: 'tick', ms: 1000 }));
    const slow = right(reduce(begin(timedSetup), { type: 'tick', ms: 5000 }));
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
