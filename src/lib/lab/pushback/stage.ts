/**
 * The pure side of the stage: geometry, timing and the script that turns
 * a duel state into what the screen shows. Nothing here touches the DOM
 * or a canvas, so it all runs under the Node test runner.
 */
import { type DuelState, type Side, toLose, toWin } from './duel';
import {
  BOSS_LOSE_BARKS,
  BOSS_WIN_BARKS,
  FALLBACK,
  OFFLINE,
  PLAYER_BARKS,
  type BossPairId,
  type PairId,
  bossPairById,
  isBossPairId,
  pairById,
} from './lines';

// Geometry
// ---------------

/** Native size of the stage in pixels */
export const STAGE = { width: 480, height: 270 } as const;

/** Where the chrome goes, in native pixels */
export const LAYOUT = {
  /** Top strip with the bars */
  top: 40,
  /** Bottom strip with the dialogue box */
  box: 45,
  /** Feet line of the duellists */
  feet: 225,
  /** Sprite cell */
  cell: { width: 72, height: 112 },
  buyIn: { width: 10, height: 6, gap: 2 },
  momentum: { width: 6, height: 3, gap: 2 },
} as const;

/**
 * The duellists are drawn at this multiple of the scene's pixels: a
 * sheet figure is a third of the stage tall, and with the dialogue box
 * open only its head would show. At 2x it stands head to hip above the
 * box, Street Fighter framing, at the cost of art pixels twice the
 * room's.
 */
export const FIGURE_SCALE = 2;

/**
 * The on-stage cell of a duellist standing at `stand` (the left edge of
 * a 1x cell, as `STANDS` gives it): the sheet cell at `FIGURE_SCALE`,
 * centred on the 1x cell, so the bars stay over the figure's head.
 */
export const figureCell = (stand: number) => {
  const width = LAYOUT.cell.width * FIGURE_SCALE;
  return {
    x: Math.round(stand + LAYOUT.cell.width / 2 - width / 2),
    width,
    height: LAYOUT.cell.height * FIGURE_SCALE,
  };
};

/**
 * The scale at which the stage fits a viewport: 2 (960 by 540) wherever
 * there is room, so the game looks the same on every screen wide enough,
 * and below that whatever fraction the width (or height) allows, so it
 * shrinks with the window instead of jumping to 1x. The canvas is drawn
 * at `BACKING` and only ever scaled down, so a fraction stays sharp.
 */
export const scaleFor = (width: number, height: number, max = 2): number =>
  Math.min(max, width / STAGE.width, height / STAGE.height);

/** Below this the box cannot hold a menu: the screens ask for landscape */
export const MIN_SCALE = 0.75;

/** The canvas is drawn at this whole-number scale and scaled down by CSS */
export const BACKING = 2;

/** The overlay's font size at a scale: 14 px at 2x, never below 12 px */
export const fontSizeFor = (scale: number): number => Math.max(12, 7 * scale);

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  filled: boolean;
}

/** A row of `count` boxes from `x`, the first `filled` ones filled */
export const barRects = (options: {
  x: number;
  y: number;
  count: number;
  filled: number;
  width: number;
  height: number;
  gap: number;
}): Rect[] =>
  Array.from({ length: options.count }, (_, i) => ({
    x: options.x + i * (options.width + options.gap),
    y: options.y,
    width: options.width,
    height: options.height,
    filled: i < options.filled,
  }));

/** Width of a bar of `count` boxes */
export const barWidth = (
  count: number,
  { width, gap }: { width: number; gap: number },
): number => count * width + (count - 1) * gap;

// Timing
// ---------------

/** Characters per second a line types out at */
export const TYPING_SPEED = 25;

/**
 * Pacing, in ms. Engines default a typewriter to 20 to 50 characters a
 * second; people read 200 to 250 words a minute, about 20 characters a
 * second, and the rule of thumb for text that goes away by itself is to
 * leave it long enough to be read twice. So a line types at 25 and then
 * holds for a second reading at 20 before the script moves on, and the
 * poses of a resolved exchange hold long enough to be seen.
 */
export const PACE = {
  /** After a line has typed: a base plus a second reading */
  holdBase: 600,
  holdPerChar: 50,
  holdMax: 3200,
  /** The phrase before a menu: the menu shows it again, so a short hold */
  holdBeforeMenu: 700,
  /** The taunt and flinch after an exchange */
  resolveBeat: 1500,
  /** The right counter shown after a miss: the learning moment */
  reveal: 2400,
  /** Before the end barks */
  endBeat: 800,
} as const;

/** Milliseconds between frames: 8 fps, like the scene loops */
export const FRAME_MS = 125;

/** How many characters of `text` are visible after `elapsed` ms */
export const typedChars = (
  elapsed: number,
  text: string,
  speed = TYPING_SPEED,
): number =>
  Math.min(text.length, Math.max(0, Math.floor((elapsed / 1000) * speed)));

/** How long a line takes to type out, in ms */
export const typingDuration = (text: string, speed = TYPING_SPEED): number =>
  Math.ceil((text.length / speed) * 1000);

/** How long a typed line stays before the next step: read once more */
export const holdFor = (text: string, hold?: number): number =>
  hold ??
  Math.min(PACE.holdMax, PACE.holdBase + text.length * PACE.holdPerChar);

/** 1 px bob on a period: down on the second half */
export const bob = (elapsed: number, period = 600): number =>
  Math.floor(elapsed / (period / 2)) % 2 === 0 ? 0 : -1;

// Poses
// ---------------

export type Pose = 'idle' | 'talk' | 'taunt' | 'flinch' | 'win' | 'lose';

/** Vertical bob and horizontal step of a pose at `elapsed` ms into it */
export const poseOffset = (
  pose: Pose,
  elapsed: number,
  /** Which way the opponent is: +1 for the left duellist, -1 for the right */
  towards: 1 | -1,
  micDrop = false,
): { dx: number; dy: number; lighter: boolean } => {
  switch (pose) {
    case 'idle':
    case 'talk':
      return { dx: 0, dy: bob(elapsed), lighter: false };
    case 'taunt': {
      // Two frames of stepping forward, then hold
      const frames = Math.min(2, Math.floor(elapsed / FRAME_MS) + 1);
      const step = micDrop ? 4 : 2;
      return {
        dx: towards * Math.round((step * frames) / 2),
        dy: 0,
        lighter: false,
      };
    }
    case 'flinch':
      return {
        dx: -towards * 2,
        dy: 0,
        lighter: elapsed < FRAME_MS,
      };
    case 'win':
      return { dx: 0, dy: bob(elapsed, 300), lighter: false };
    case 'lose':
      return { dx: 0, dy: 0, lighter: false };
  }
};

// Script
// ---------------

/** What the dialogue box does at one point of the duel */
export type Step =
  | { kind: 'line'; speaker: Side; text: string; hold?: number }
  | { kind: 'reveal'; text: string; ms: number }
  | { kind: 'beat'; ms: number }
  | { kind: 'menu' }
  | { kind: 'wait' };

/** The counter text of a pair id, or the fallback */
export const counterText = (picked: PairId | 'fallback' | null): string =>
  picked === null
    ? ''
    : picked === 'fallback'
      ? FALLBACK
      : pairById(picked).counter;

/** The phrase text of a regular or boss phrase */
export const phraseText = (id: PairId | BossPairId): string =>
  isBossPairId(id) ? bossPairById(id).phrase : pairById(id).phrase;

/**
 * The steps the screen plays for the duel's current phase, in order. When
 * the last one is done the screen dispatches `begin` (after `intro`) or
 * `continue` (after `resolve`), shows the menu (`attack`, `defend`) or
 * waits for the player (`end`).
 */
export const scriptFor = (state: DuelState): Step[] => {
  const { exchange, outcome } = state;
  switch (state.phase) {
    case 'intro':
      return [
        {
          kind: 'line',
          speaker: 'opponent',
          text: state.setup.character.intro,
        },
      ];
    case 'defend':
      return exchange
        ? [
            {
              kind: 'line',
              speaker: 'opponent',
              text: phraseText(exchange.phrase),
              hold: PACE.holdBeforeMenu,
            },
            { kind: 'menu' },
          ]
        : [{ kind: 'menu' }];
    case 'attack':
      return [{ kind: 'menu' }];
    case 'resolve': {
      if (!exchange || !outcome) return [{ kind: 'beat', ms: PACE.endBeat }];
      const steps: Step[] = [];
      if (exchange.by === 'player') {
        steps.push({
          kind: 'line',
          speaker: 'player',
          text: phraseText(exchange.phrase),
        });
      }
      if (outcome.offline) {
        steps.push({ kind: 'line', speaker: 'opponent', text: OFFLINE });
      } else {
        const defender: Side = exchange.by === 'player' ? 'opponent' : 'player';
        steps.push({
          kind: 'line',
          speaker: defender,
          text: counterText(outcome.picked),
        });
      }
      const playerMissed =
        exchange.by === 'opponent' && outcome.winner === 'opponent';
      if (playerMissed) {
        steps.push({
          kind: 'reveal',
          text: counterText(exchange.answer),
          ms: PACE.reveal,
        });
      }
      steps.push({ kind: 'beat', ms: PACE.resolveBeat });
      return steps;
    }
    case 'end': {
      const won = state.winner === 'player';
      const steps: Step[] = [{ kind: 'beat', ms: PACE.endBeat }];
      if (state.boss) {
        steps.push({
          kind: 'line',
          speaker: 'opponent',
          text: won
            ? BOSS_LOSE_BARKS[state.setup.role]
            : BOSS_WIN_BARKS[state.lastMissPool ?? state.setup.role],
        });
      }
      steps.push({
        kind: 'line',
        speaker: 'player',
        text: PLAYER_BARKS[state.setup.role][won ? 'win' : 'lose'],
      });
      steps.push({ kind: 'wait' });
      return steps;
    }
  }
};

/** The pose of each duellist for a step of the script */
export const posesFor = (
  state: DuelState,
  step: Step | undefined,
): Record<Side, Pose> => {
  const idle: Record<Side, Pose> = { player: 'idle', opponent: 'idle' };
  if (!step) return idle;
  if (step.kind === 'line') {
    const talk = { ...idle, [step.speaker]: 'talk' as Pose };
    // A mic drop is thrown in the taunt pose
    if (
      state.exchange?.micDrop &&
      state.exchange.by === step.speaker &&
      (state.phase === 'defend' || state.phase === 'resolve')
    ) {
      return { ...idle, [step.speaker]: 'taunt' };
    }
    return talk;
  }
  if (state.phase === 'resolve' && state.outcome) {
    if (step.kind === 'reveal' || step.kind === 'beat') {
      const { winner } = state.outcome;
      return {
        player: winner === 'player' ? 'taunt' : 'flinch',
        opponent: winner === 'opponent' ? 'taunt' : 'flinch',
      };
    }
  }
  if (state.phase === 'end' && state.winner) {
    return {
      player: state.winner === 'player' ? 'win' : 'lose',
      opponent: state.winner === 'opponent' ? 'win' : 'lose',
    };
  }
  return idle;
};

/** The scale and a side's momentum in words, for the live region */
export const barsLabel = (state: DuelState, side: Side): string => {
  const { scale } = state;
  const lead =
    scale === 0
      ? 'Even'
      : scale > 0
        ? `You lead, ${scale} of ${toWin(state)}`
        : `They lead, ${-scale} of ${toLose(state)}`;
  const momentum =
    state.momentum[side] >= state.rules.momentum
      ? 'momentum full'
      : `momentum ${state.momentum[side]} of ${state.rules.momentum}`;
  return `${lead}, ${momentum}`;
};
