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

/**
 * The stage is one pixel grid, 320 by 214, shown at 3x (960 by 642) and
 * shrunk as a whole below that. The room band on top shows a window of
 * the scene render at the scene's own pixels, with the duellists at the
 * sheets' pixels; the text panel below is drawn on the same grid, so the
 * chrome is pixel art like the room. Only the letters are smooth.
 */
export const STAGE = { width: 320, height: 214 } as const;

/** The scene renders, and where their floor meets the feet */
export const SCENE = { width: 480, height: 270, feet: 230 } as const;

/** Where everything goes, in stage pixels */
export const LAYOUT = {
  /** The room band: rows 0 to 133 */
  band: 134,
  /** Feet line of the duellists */
  feet: 128,
  /** Sprite cell */
  cell: { width: 72, height: 112 },
  /** The quiet window under the band */
  panel: { x: 3, y: 136, width: 314, height: 76 },
  /** Inset of the text inside the panel */
  panelPad: 6,
  /** The shared scale across the top centre: a beam, `step` pixels a step */
  beam: { y: 6, step: 13, height: 7 },
  /** Momentum pips in the corners, under the names */
  pips: { x: 6, y: 15, width: 8, height: 5, gap: 2 },
  /** The names, in the corners */
  names: { x: 6, y: 3 },
  /** Rows the bars take at the top: a window never grows over them */
  hud: 30,
} as const;

/**
 * The window of the scene the band shows: 320 of its 480 columns, centred
 * on the duellists unless the stands fix it (`view`), and the rows that put the scene's floor line on the
 * stage's feet line. Stage x = scene x − view.x.
 */
export const viewFor = (stands: {
  left: number;
  right: number;
  view?: number;
}) => {
  const centre = (stands.left + stands.right) / 2 + LAYOUT.cell.width / 2;
  const x = stands.view ?? Math.round(centre - STAGE.width / 2);
  return {
    x: Math.max(0, Math.min(SCENE.width - STAGE.width, x)),
    y: SCENE.feet - LAYOUT.feet,
  };
};

/**
 * The scale at which the stage fits a viewport: 3 (960 by 642) wherever
 * there is room, so the game looks the same on every screen wide enough,
 * and below that whatever fraction the width (or height) allows, so it
 * shrinks with the window instead of jumping (`crispScale` then snaps
 * it to the screen's device pixels).
 */
export const scaleFor = (width: number, height: number, max = 3): number =>
  Math.min(max, width / STAGE.width, height / STAGE.height);

/** Below this the panel cannot hold a menu: the screens ask for landscape */
export const MIN_SCALE = 1.1;

/**
 * A short window: before the stage shrinks to fit the height, up to this
 * many rows of ceiling are cropped off the top of the band (the duel's
 * frame only; the menu screens keep their height). The people and the
 * panel never shrink for height alone until the ceiling is gone.
 */
export const MAX_CROP = 60;

/**
 * The scale and the ceiling crop for a viewport: the width sets the
 * scale; when the height is short the ceiling goes first, the scale
 * after.
 */
export const fitFor = (
  width: number,
  height: number,
  max = 3,
  dpr = 1,
): { scale: number; crop: number } => {
  const byWidth = crispScale(scaleFor(width, Infinity, max), dpr);
  const deficit = STAGE.height * byWidth - height;
  if (deficit <= 0) return { scale: byWidth, crop: 0 };
  const crop = Math.min(MAX_CROP, Math.ceil(deficit / byWidth));
  if (crop < MAX_CROP) return { scale: byWidth, crop };
  return {
    scale: crispScale(
      Math.min(byWidth, height / (STAGE.height - MAX_CROP)),
      dpr,
    ),
    crop: MAX_CROP,
  };
};

/**
 * The scale snapped down so that a stage pixel is a whole number of
 * device pixels: in halves on a 2x screen, in thirds on a 3x one. Then
 * nothing is ever resampled, whatever the window. A 1x screen keeps the
 * fraction (snapping there would only shrink the game), and so does a
 * scale that would fall under `MIN_SCALE`.
 */
export const crispScale = (scale: number, dpr: number): number => {
  if (dpr <= 1) return scale;
  const snapped = Math.floor(scale * dpr + 1e-6) / dpr;
  return snapped >= MIN_SCALE ? snapped : scale;
};

/**
 * The canvas is drawn at a whole-number scale. When the device pixels per
 * stage pixel are whole (`crisp`) that is the number, and the canvas is
 * shown at exactly its own size; else `BACKING`, scaled down smoothly by
 * CSS, which is the best a fraction can do.
 */
export const BACKING = 3;

export const crisp = (scale: number, dpr: number): boolean => {
  const k = scale * dpr;
  return Math.abs(k - Math.round(k)) < 1e-6;
};

export const backingFor = (scale: number, dpr: number): number =>
  crisp(scale, dpr) ? Math.round(scale * dpr) : BACKING;

/** The overlay's font size at a scale: 16 px at 3x, never below 14 px */
export const fontSizeFor = (scale: number): number =>
  Math.max(14, Math.round((16 * scale) / 3));

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

/** One tick of the shared scale */
export interface Beam {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Pixels a step of the scale moves the spark */
  step: number;
  /** Steps across the whole beam: `toWin + toLose` */
  steps: number;
  /** Where the two beams meet: the gold one ends, the ember one starts */
  spark: number;
}

/**
 * The shared scale as a beam clash across the top centre: the player's
 * beam in gold from the left, the opponent's in ember from the right,
 * meeting at the spark. Winning an exchange pushes the spark a step
 * toward the other end; the player wins at the right end (`toWin` steps
 * from the start), the opponent at the left (`toLose`). Against the
 * Stakeholder the start is off centre, since the player has further to
 * push.
 */
export const scaleBeam = (options: {
  scale: number;
  toWin: number;
  toLose: number;
}): Beam => {
  const { y, step, height } = LAYOUT.beam;
  const steps = options.toWin + options.toLose;
  const width = steps * step;
  const x = Math.round(STAGE.width / 2 - width / 2);
  const at = Math.max(0, Math.min(steps, options.toLose + options.scale));
  return {
    x,
    y,
    width,
    height,
    step,
    steps,
    spark: x + at * step,
  };
};

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

/**
 * A hit flickers: after the flash, the figure blinks in and out every
 * frame for this long, the way old arcade games marked a landed hit
 */
export const FLINCH_FLICKER_MS = 1000;

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

/**
 * Breathing: the standard two-frame idle, the feet planted and the upper
 * body one pixel lower on the exhale, each frame held about half a
 * second. The cut is at the hip, `BREATH.hip` of the figure's height
 * from its feet; the shifted upper part overdraws the seam row. A whole
 * sprite moved up and down reads as hopping, which is why this is not
 * `bob`. The same cut at other rhythms is the taunt's chuckle (the
 * shoulders shaking) and the slow sob of the lose pose.
 */
export const BREATH = {
  period: 1000,
  hip: 0.5,
  chuckle: 400,
  sob: 1600,
} as const;

/** The rhythm of the hip cut for a pose, or none */
const breathPeriod = (pose: Pose): number | null => {
  switch (pose) {
    case 'idle':
    case 'talk':
    case 'win':
      return BREATH.period;
    case 'taunt':
      return BREATH.chuckle;
    case 'lose':
      return BREATH.sob;
    case 'flinch':
      return null;
  }
};

/** 0 on the inhale, 1 (the upper body a pixel down) on the exhale */
export const breathFrame = (pose: Pose, elapsed: number): 0 | 1 => {
  const period = breathPeriod(pose);
  return period !== null && bob(elapsed, period) !== 0 ? 1 : 0;
};

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
): { dx: number; dy: number; lighter: boolean; hidden: boolean } => {
  switch (pose) {
    case 'idle':
    case 'talk':
      // Breathing is `breathFrame`: the feet stay put
      return { dx: 0, dy: 0, lighter: false, hidden: false };
    case 'taunt': {
      // Two frames of stepping forward, then hold
      const frames = Math.min(2, Math.floor(elapsed / FRAME_MS) + 1);
      const step = micDrop ? 4 : 2;
      return {
        dx: towards * Math.round((step * frames) / 2),
        dy: 0,
        lighter: false,
        hidden: false,
      };
    }
    case 'flinch': {
      // The first frame flashes, then the figure flickers: every other
      // frame missing, for a second
      const frame = Math.floor(elapsed / FRAME_MS);
      return {
        dx: -towards * 2,
        dy: 0,
        lighter: frame === 0,
        hidden: frame > 0 && elapsed < FLINCH_FLICKER_MS && frame % 2 === 1,
      };
    }
    case 'win':
      return { dx: 0, dy: 0, lighter: false, hidden: false };
    case 'lose':
      return { dx: 0, dy: 0, lighter: false, hidden: false };
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
