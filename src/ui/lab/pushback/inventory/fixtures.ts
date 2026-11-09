import type { Look } from '@sebald/pushback/lib/characters';
import { PAIRS, type Role } from '@sebald/pushback/lib/lines';
import { createRunState } from '@sebald/pushback/lib/run';
import type { SavedRun } from '@sebald/pushback/lib/save';

/** A run that reached the Stakeholder, with made-up numbers and a glossary */
export const sampleRun = (
  role: Role,
  look: Look,
  finished: boolean,
): SavedRun => {
  const run = createRunState(role, look, 7);
  return {
    ...run,
    look,
    finished,
    mode: 'normal',
    attempts: 6,
    beaten: {
      0: { flawless: true, score: 2460 },
      1: { flawless: false, score: 1830 },
      2: { flawless: true, score: 2950 },
      3: { flawless: false, score: 4170 },
    },
    stats: {
      ...run.stats,
      exchangesWon: 23,
      exchangesLost: 9,
      micDrops: 3,
      missesByPool: { pm: 0, dev: 4, designer: 1 },
    },
  };
};

/** Some of every pool, more of the own one */
export const sampleGlossary = (role: Role) =>
  PAIRS.filter((pair, i) =>
    pair.role === role ? i % 8 !== 3 : i % 3 !== 0 && i % 5 !== 0,
  ).map(pair => pair.id);
