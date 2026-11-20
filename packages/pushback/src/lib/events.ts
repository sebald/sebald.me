/**
 * What the game tells its host: one typed event per moment worth
 * counting, handed to `Game`'s `onEvent` and dispatched as a DOM event
 * (`PUSHBACK_EVENT`) on the game's root. The builders here are pure,
 * from the save and the duel, so what an event says is what is saved.
 * The attract demo sends nothing: nobody plays it.
 */
import type { Attempt } from './ai';
import type { CharacterId, Look, Mode, Tier } from './characters';
import { type DuelSetup, type DuelState, duelScore, isFlawless } from './duel';
import type { Role } from './lines';
import { duelSetupFor, runScore } from './run';
import { type Save, type SavedRun, hasProgress, openRun } from './save';

/** The name of the DOM event, its `detail` the `PushbackEvent` */
export const PUSHBACK_EVENT = 'pushback:event';

/** What the screens are called in a `screen` event */
export type ScreenName =
  | 'title'
  | 'select'
  | 'roster'
  | 'duel'
  | 'result'
  /** The title's views over its menu */
  | 'how'
  | 'options'
  | 'glossary';

/** Which duel: the same in every duel event */
export interface DuelInfo {
  role: Role;
  opponent: CharacterId;
  tier: Tier;
  attempt: Attempt;
  mode: Mode;
  tutorial: boolean;
}

export type PushbackEvent =
  /** The game is on screen, with what the save holds */
  | { type: 'game:open'; returning: boolean; running: boolean; mode: Mode }
  | { type: 'screen'; name: ScreenName }
  /** A role picked: a new run, `replaced` when one was still open */
  | { type: 'run:start'; role: Role; look: Look; mode: Mode; replaced: boolean }
  /** The open run picked up from the title */
  | {
      type: 'run:continue';
      role: Role;
      mode: Mode;
      beaten: number;
      slots: number;
    }
  /** The Stakeholder beaten for the first time this run: the role ships */
  | {
      type: 'run:finish';
      role: Role;
      look: Look;
      mode: Mode;
      score: number;
      /** Duels played, retries and replays included */
      attempts: number;
      /** Colleagues beaten without losing an exchange */
      flawless: number;
    }
  | ({ type: 'duel:start' } & DuelInfo)
  /** The pause menu opened */
  | ({ type: 'duel:pause'; exchanges: number } & DuelInfo)
  /** Left through the pause: neither a win nor a loss */
  | ({ type: 'duel:leave'; exchanges: number } & DuelInfo)
  /** The duel's result, as the save records it */
  | ({
      type: 'duel:end';
      result: 'won' | 'lost';
      score: number;
      flawless: boolean;
      exchangesWon: number;
      exchangesLost: number;
      micDrops: number;
    } & DuelInfo)
  /** The mode switched; `discarded` when that threw progress away */
  | { type: 'mode:change'; from: Mode; to: Mode; discarded: boolean }
  /** The save erased, with what it held */
  | { type: 'save:erase'; running: boolean; shipped: number; glossary: number }
  /** The result handed on: the share sheet, a saved picture or the clipboard */
  | {
      type: 'result:share';
      method: 'shared' | 'saved' | 'copied';
      finished: boolean;
    };

export type PushbackEventType = PushbackEvent['type'];

/** Which duel a setup is for */
export const duelInfo = (setup: DuelSetup): DuelInfo => ({
  role: setup.role,
  opponent: setup.character.id,
  tier: setup.slot.tier,
  attempt: setup.attempt,
  mode: setup.mode ?? 'easy',
  tutorial: setup.tutorial === true,
});

export const gameOpened = (save: Save, returning: boolean): PushbackEvent => ({
  type: 'game:open',
  returning,
  running: openRun(save) !== null,
  mode: save.mode,
});

/** A run started on `save` (the save before it) */
export const runStarted = (
  save: Save,
  role: Role,
  look: Look,
): PushbackEvent => ({
  type: 'run:start',
  role,
  look,
  mode: save.mode,
  replaced: openRun(save) !== null,
});

export const runContinued = (run: SavedRun, mode: Mode): PushbackEvent => ({
  type: 'run:continue',
  role: run.role,
  mode,
  beaten: Object.keys(run.beaten).length,
  slots: run.run.slots.length,
});

/** The duel at a slot of the run about to start */
export const duelStarted = (
  run: SavedRun,
  index: number,
  mode: Mode,
): PushbackEvent => ({
  type: 'duel:start',
  // Only the setup's labels are read, so the seed does not matter
  ...duelInfo(duelSetupFor(run, index, { seed: 0, silence: true, mode })),
});

export const duelPaused = (duel: DuelState): PushbackEvent => ({
  type: 'duel:pause',
  ...duelInfo(duel.setup),
  exchanges: duel.exchanges,
});

export const duelLeft = (duel: DuelState): PushbackEvent => ({
  type: 'duel:leave',
  ...duelInfo(duel.setup),
  exchanges: duel.exchanges,
});

/** A finished duel; nothing for one that is not over */
export const duelEnded = (duel: DuelState): PushbackEvent | null =>
  duel.phase === 'end' && duel.winner
    ? {
        type: 'duel:end',
        ...duelInfo(duel.setup),
        result: duel.winner === 'player' ? 'won' : 'lost',
        score: duelScore(duel),
        flawless: isFlawless(duel),
        exchangesWon: duel.stats.exchangesWon,
        exchangesLost: duel.stats.exchangesLost,
        micDrops: duel.stats.micDrops,
      }
    : null;

/** The run finished between two saves; nothing if it did not just now */
export const runFinished = (
  before: Save,
  after: Save,
): PushbackEvent | null => {
  const { run } = after;
  if (!run?.finished || before.run?.finished !== false) return null;
  return {
    type: 'run:finish',
    role: run.role,
    look: run.look,
    mode: run.mode ?? after.mode,
    score: runScore(run),
    attempts: run.attempts,
    flawless: Object.values(run.beaten).filter(b => b.flawless).length,
  };
};

/** The mode switched on `save`; nothing when it stays */
export const modeChanged = (save: Save, to: Mode): PushbackEvent | null =>
  to === save.mode
    ? null
    : {
        type: 'mode:change',
        from: save.mode,
        to,
        discarded: hasProgress(save),
      };

export const saveErased = (save: Save): PushbackEvent => ({
  type: 'save:erase',
  running: openRun(save) !== null,
  shipped: Object.keys(save.shipped).length,
  glossary: save.glossary.length,
});
