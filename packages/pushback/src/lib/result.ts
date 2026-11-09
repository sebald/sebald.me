/**
 * The result of a run for the result screen and the share card: the
 * ledger, the glossary by pool, the card as plain text. Pure, nothing
 * here is stored.
 */
import { MODE_LABELS, type Mode } from './characters';
import {
  PAIRS,
  POOL_SIZE,
  pairById,
  poolPairs,
  type PairId,
  ROLE_LABELS,
  type Role,
  ROLES,
} from './lines';
import { type RunState, runScore } from './run';

/** The mode a run was played in: the last duel's, or what an old save's flag says */
export const runMode = (run: RunState): Mode =>
  run.mode ?? (run.buddy ? 'easy' : 'hard');

/** A score with thousands separated: 12,340 */
export const formatScore = (score: number): string =>
  score.toLocaleString('en-US');

/** One pool on the result screen: what of it is collected, what was missed */
export interface ResultPool {
  role: Role;
  collected: number;
  total: number;
  missed: number;
}

/** What the result screen shows: the ledger and the glossary by pool */
export interface ResultModel {
  finished: boolean;
  score: number;
  mode: Mode;
  rows: [label: string, value: string][];
  pools: ResultPool[];
  glossary: { collected: number; total: number };
}

export const resultModel = (
  run: RunState,
  glossary: readonly PairId[] = run.collected,
): ResultModel => {
  const flawless = Object.values(run.beaten).filter(b => b.flawless).length;
  const { stats } = run;
  const pairs = poolPairs(glossary);
  return {
    finished: run.finished,
    score: runScore(run),
    mode: runMode(run),
    rows: [
      ['Duels', String(run.attempts)],
      ['Flawless', String(flawless)],
      ['Exchanges', `${stats.exchangesWon}–${stats.exchangesLost}`],
      ['Mic drops', String(stats.micDrops)],
    ],
    pools: ROLES.map(role => ({
      role,
      collected: pairs.filter(id => pairById(id).role === role).length,
      total: POOL_SIZE,
      missed: stats.missesByPool[role],
    })),
    glossary: { collected: pairs.length, total: PAIRS.length },
  };
};

/** The result card as plain text, the Wordle trick */
export const resultCardText = (
  run: RunState,
  glossary: readonly PairId[] = run.collected,
): string => {
  const model = resultModel(run, glossary);
  const [duels, flawless, exchanges, micDrops] = model.rows.map(
    ([, value]) => value,
  );
  const missed = model.pools
    .map(pool => `${ROLE_LABELS[pool.role]} ${pool.missed}`)
    .join(' · ');
  return [
    `Pushback · ${ROLE_LABELS[run.role]}`,
    `${model.finished ? 'Stakeholder beaten' : 'Stakeholder took it offline'} · ${duels} duels · ${flawless} flawless · ${MODE_LABELS[model.mode].toLowerCase()} mode`,
    `Score ${formatScore(model.score)}`,
    `Exchanges ${exchanges} · Mic drops ${micDrops} · Glossary ${model.glossary.collected}/${model.glossary.total}`,
    `Missed counters: ${missed}`,
    'sebald.me/lab/pushback',
  ].join('\n');
};
