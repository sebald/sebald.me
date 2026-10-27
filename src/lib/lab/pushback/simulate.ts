/**
 * Balance check: a modelled player plays full runs against the slot
 * table and the numbers come out as a table. Run it with
 * `pnpm pushback:simulate [runs] [recall] [guess]` (`MODE=hard` for the
 * hard mode's rules).
 *
 * The player answers a collected pair correctly with `recall` and fast
 * with `speed`; an uncollected pair is a reasoned guess with `guess`
 * against obvious decoys (any pool) and a blind guess otherwise. On
 * attack it prefers a foreign phrase and drops the mic when it can.
 */
import {
  bossIndex,
  DECK_PER_POOL,
  MODES,
  type Rules,
  SLOTS,
  type Slot,
} from './characters';
import { type DuelState, createDuel, reduce } from './duel';
import { ROLES, type Role } from './lines';
import { Rng, seedRng } from './random';
import { type RunState, createRunState, duelSetupFor, recordDuel } from './run';

export interface PlayerModel {
  /** Chance to answer a collected pair correctly */
  recall: number;
  /** Chance that a correct answer comes before the silence bar is half full */
  speed: number;
  /** Chance to reason out an uncollected pair against any-pool decoys */
  guess: number;
}

export const DEFAULT_PLAYER: PlayerModel = {
  recall: 0.9,
  speed: 0.7,
  guess: 0.5,
};

/**
 * The rules for a run of the script: `MODE=hard` for the hard mode's,
 * then overrides from `RULES='{"reach":3}'`. The ghost is not modelled:
 * the player's recall stands in for it.
 */
const rulesFromEnv = (): Rules => ({
  ...MODES[process.env.MODE === 'hard' ? 'hard' : 'normal'].rules,
  ...(process.env.RULES
    ? (JSON.parse(process.env.RULES) as Partial<Rules>)
    : {}),
});
const SIM_RULES = rulesFromEnv();

/**
 * A guess on an uncollected pair. Decoys from another pool are visibly
 * from another conversation, so the player only weighs the plausible
 * ones: all but one at "any", about half at "two", all at "same" and
 * at the boss.
 */
const guessChance = (slot: Slot, menu: number, model: PlayerModel) => {
  switch (slot.decoys) {
    case 'any':
      return model.guess;
    case 'two':
      return 1 / (1 + Math.ceil((menu - 1) / 2));
    default:
      return 1 / menu;
  }
};

/** Mic drops seen in a duel, by who dropped them */
export interface DuelTally {
  player: number;
  opponent: number;
}

/** One duel, played by the model; returns the finished state */
export const playDuel = (
  run: RunState,
  index: number,
  seed: number,
  model: PlayerModel,
  rng: Rng,
  tally: DuelTally = { player: 0, opponent: 0 },
): DuelState => {
  let s = createDuel(
    duelSetupFor(run, index, { seed, silence: true, rules: SIM_RULES }),
  );
  s = reduce(s, { type: 'begin' });
  const known = new Set(s.setup.repertoire);
  for (let guard = 0; guard < 200 && s.phase !== 'end'; guard++) {
    if (s.phase === 'defend') {
      const { answer } = s.exchange!;
      if (s.exchange!.micDrop && !s.boss) tally.opponent++;
      const known =
        s.collected.includes(answer) && !s.boss
          ? true
          : s.collected.includes(answer);
      const p = known
        ? model.recall
        : guessChance(s.setup.slot, s.menu.length, model);
      const correct = rng.chance(p);
      if (s.silence) {
        const fast = known && rng.chance(model.speed);
        const ms = fast ? s.silence.limit * 0.3 : s.silence.limit * 0.8;
        s = reduce(s, { type: 'tick', ms });
        if (s.phase !== 'defend') continue;
      }
      s = reduce(s, {
        type: 'counter',
        phrase: correct ? answer : s.menu.find(id => id !== answer)!,
      });
    } else if (s.phase === 'attack') {
      const foreign = s.hand.filter(id => !known.has(id));
      const phrase = rng.pick(foreign.length > 0 ? foreign : s.hand)!;
      if (s.micDropAvailable && !s.boss) tally.player++;
      s = reduce(s, { type: 'throw', phrase, micDrop: s.micDropAvailable });
    } else {
      s = reduce(s, { type: 'continue' });
    }
  }
  return s;
};

export interface SlotReport {
  firstWins: number;
  firstPlays: number;
  retryWins: number;
  retryPlays: number;
  attempts: number;
  /** Over every duel played in the slot */
  exchanges: number;
  longest: number;
  micDropsPlayer: number;
  micDropsOpponent: number;
}

export interface Report {
  role: Role;
  runs: number;
  slots: SlotReport[];
  glossaryAtBoss: number;
  bossWinsFirst: number;
  bossReached: number;
  finished: number;
  duelsPerRun: number;
}

/** Play `runs` seeded runs as one role, retrying each slot until it is beaten */
export const simulate = (
  role: Role,
  runs: number,
  model: PlayerModel = DEFAULT_PLAYER,
  maxAttempts = 8,
): Report => {
  const slots: SlotReport[] = SLOTS.map(() => ({
    firstWins: 0,
    firstPlays: 0,
    retryWins: 0,
    retryPlays: 0,
    attempts: 0,
    exchanges: 0,
    longest: 0,
    micDropsPlayer: 0,
    micDropsOpponent: 0,
  }));
  let glossary = 0;
  let bossWinsFirst = 0;
  let bossReached = 0;
  let finished = 0;
  let duels = 0;
  for (let seed = 1; seed <= runs; seed++) {
    const rng = new Rng(seedRng(seed * 7919));
    let run = createRunState(role, 'a', seed);
    let stuck = false;
    for (let index = 0; index < run.run.slots.length && !stuck; index++) {
      if (index === bossIndex(run.run)) {
        bossReached++;
        glossary += run.collected.length;
      }
      // Reported by the slot table, since a run can skip a slot
      const report = slots[SLOTS.indexOf(run.run.slots[index]!.slot)]!;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        duels++;
        report.attempts++;
        const tally = { player: 0, opponent: 0 };
        const duel = playDuel(
          run,
          index,
          seed * 100 + index * 10 + attempt,
          model,
          rng,
          tally,
        );
        report.exchanges += duel.exchanges;
        report.longest = Math.max(report.longest, duel.exchanges);
        report.micDropsPlayer += tally.player;
        report.micDropsOpponent += tally.opponent;
        const won = duel.winner === 'player';
        if (attempt === 0) {
          report.firstPlays++;
          if (won) report.firstWins++;
          if (won && index === bossIndex(run.run)) bossWinsFirst++;
        } else {
          report.retryPlays++;
          if (won) report.retryWins++;
        }
        run = recordDuel(run, index, duel);
        if (won) break;
        if (attempt === maxAttempts - 1) stuck = true;
      }
    }
    if (run.finished) finished++;
  }
  return {
    role,
    runs,
    slots,
    glossaryAtBoss: bossReached ? glossary / bossReached : 0,
    bossWinsFirst,
    bossReached,
    finished,
    duelsPerRun: duels / runs,
  };
};

const pct = (n: number, d: number) =>
  d === 0 ? '   –' : `${Math.round((n / d) * 100)}`.padStart(3) + '%';

export const formatReport = (report: Report): string => {
  const lines = [
    `${report.role.padEnd(8)} ${report.runs} runs · ${report.duelsPerRun.toFixed(1)} duels per run · ${pct(report.finished, report.runs)} finished · glossary at boss ${report.glossaryAtBoss.toFixed(1)}/${DECK_PER_POOL * ROLES.length}`,
    '  slot  tier   first   retry  attempts  exchanges  longest  mic drops (you / them, per duel)',
  ];
  report.slots.forEach((slot, index) => {
    const tier = String(SLOTS[index]!.tier).padStart(4);
    lines.push(
      `  ${String(index + 1).padStart(4)}  ${tier}   ${pct(slot.firstWins, slot.firstPlays)}   ${pct(slot.retryWins, slot.retryPlays)}  ${(slot.attempts / Math.max(1, slot.firstPlays)).toFixed(2).padStart(8)}  ${(slot.exchanges / Math.max(1, slot.attempts)).toFixed(1).padStart(9)}  ${String(slot.longest).padStart(7)}  ${(slot.micDropsPlayer / Math.max(1, slot.attempts)).toFixed(2)} / ${(slot.micDropsOpponent / Math.max(1, slot.attempts)).toFixed(2)}`,
    );
  });
  return lines.join('\n');
};

const main = () => {
  const [runsArg, recallArg, guessArg] = process.argv.slice(2);
  const runs = Number(runsArg) || 1000;
  const model: PlayerModel = {
    ...DEFAULT_PLAYER,
    recall: Number(recallArg) || DEFAULT_PLAYER.recall,
    guess: Number(guessArg) || DEFAULT_PLAYER.guess,
  };
  console.log(
    `player: recall ${model.recall}, speed ${model.speed}, guess ${model.guess} · rules ${JSON.stringify(SIM_RULES)}\n`,
  );
  for (const role of ROLES) {
    console.log(formatReport(simulate(role, runs, model)));
    console.log();
  }
};

if (process.argv[1]?.endsWith('simulate.ts')) main();
