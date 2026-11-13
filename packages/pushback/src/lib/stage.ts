/**
 * The pure side of the stage: geometry, timing and the script that turns
 * a duel state into what the screen shows. Nothing here touches the DOM
 * or a canvas, so it all runs under the Node test runner.
 */
import ROOM_FACTORS from '../assets/scenes/rooms.json';
import type { SceneId } from './characters';
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
  inTurn,
  isBossPairId,
  pairById,
} from './lines';
import { FRAME_MS, type Pose } from './sprites';

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

/** A room's light on whoever stands in it: a colour, washed over by `amount` */
export interface Ambient {
  colour: string;
  /** From 0, the sheet as drawn, to 1, the colour alone */
  amount: number;
}

/**
 * The rooms whose light the duellists take. The sheets are drawn in
 * daylight, which fits every room but the corner office at night, where
 * they would be the brightest things on screen: there they take a little
 * of the night in its windows. The other rooms show them as drawn.
 */
export const AMBIENT: Partial<Record<SceneId, Ambient>> = {
  office: { colour: '#101e39', amount: 0.15 },
};

/**
 * Where a scene's room sits inside its render: the room was drawn too
 * large for the cast, so the loop scripts shrink it by its factor in
 * `rooms.json` about the floor line and pad the rest by repeating its edge
 * rows and columns (`shrink.mjs`, the same rounding). A screen that shows the whole room
 * fits this box, not the render.
 */
export const roomBox = (scene: SceneId) => {
  const factor = ROOM_FACTORS[scene];
  const width = Math.round(SCENE.width * factor);
  const height = Math.round(SCENE.height * factor);
  return {
    x: Math.round((SCENE.width - width) / 2),
    y: SCENE.feet - Math.round(SCENE.feet * factor),
    width,
    height,
  };
};

/**
 * The corner office behind the title, one room pixel a stage pixel, so
 * it takes the crisp frames like the duel's band: the middle 320 of the
 * room's columns, from its top row down. The room is shorter than the
 * stage; `rows` is how many of the stage's rows it fills, the rest under
 * it is the floor's flat colour.
 */
export const TITLE_VIEW = (() => {
  const box = roomBox('office');
  return {
    x: box.x + Math.floor((box.width - STAGE.width) / 2),
    y: box.y,
    rows: Math.min(box.height, STAGE.height),
  };
})();

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
  /**
   * The shared scale across the top, from one face to the other: as many
   * whole pixels a step as fit between them, 5 px high
   */
  beam: { y: 4, height: 5 },
  /**
   * The duellists' faces in the corners, the beam's top on their
   * frame's (the spark's two pixels above it stay clear of the stage's
   * edge): the 24 px head square at two thirds, 16 px, this far in from
   * the stage's edge, the beam this far from the faces.
   *
   * Two thirds is even only where a stage pixel is a multiple of three
   * device pixels: 3x on a 1x screen (two a face pixel) or on a 2x one
   * (four). At 2.5 on a 2x screen (a window 800 to 959 wide) a face pixel
   * is 3⅓ device pixels, so its columns run 3 and 4 wide. Kept: it only
   * shows enlarged, and a 16 px crop of every head drawn at 1x would cost
   * each face its hair or chin. Like the logo at 1.25x, a
   * deliberate exception to whole-pixel art.
   */
  heads: { x: 6, y: 5, scale: 2 / 3, size: 16, gap: 4 },
  /** Momentum pips after the names */
  pips: { width: 8, height: 5, gap: 2 },
  /**
   * The names under the beam, at its ends: a plate this tall, the text
   * centred in it, the pips beside it on its top edge
   */
  names: { y: 12, height: 9 },
  /** Rows the bars take at the top: a window never grows over them */
  hud: 30,
  /**
   * The round called at the end of a duel, in the bars' rows once they
   * have stepped out: `y`, its top; `line`, the pixels between YOU WIN and
   * the flawless line beside it
   */
  call: { y: 4, line: 4 },
} as const;

/**
 * The window of the scene the band shows: 320 of its 480 columns, centred
 * on the duellists unless the stands fix it (`view`), and the rows that put
 * the duellists' feet (the scene's floor line, or the stands' own `feet`)
 * on the stage's feet line. Stage x = scene x − view.x.
 */
export const viewFor = (stands: {
  left: number;
  right: number;
  feet?: number;
  view?: number;
}) => {
  const centre = (stands.left + stands.right) / 2 + LAYOUT.cell.width / 2;
  const x = stands.view ?? Math.round(centre - STAGE.width / 2);
  return {
    x: Math.max(0, Math.min(SCENE.width - STAGE.width, x)),
    y: (stands.feet ?? SCENE.feet) - LAYOUT.feet,
  };
};

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
  /**
   * The column of each notch, the last of a step, so the steps can be
   * counted: between steps only, none at either end
   */
  notches: number[];
}

/**
 * The shared scale as a beam clash across the top, from face to face: the player's
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
  const { y, height } = LAYOUT.beam;
  const { x: inset, size, gap } = LAYOUT.heads;
  const steps = options.toWin + options.toLose;
  const room = STAGE.width - 2 * (inset + size + gap);
  const step = Math.floor(room / steps);
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
    notches: Array.from(
      { length: steps - 1 },
      (_, i) => x + (i + 1) * step - 1,
    ),
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
          text: inTurn(state.setup.character.intros, state.setup.encounter),
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
            : inTurn(
                BOSS_WIN_BARKS[state.lastMissPool ?? state.setup.role],
                state.setup.encounter,
              ),
        });
      }
      steps.push({
        kind: 'line',
        speaker: 'player',
        text: inTurn(
          PLAYER_BARKS[state.setup.role][won ? 'win' : 'lose'],
          state.setup.encounter,
        ),
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
  // The end holds the win and the lose through its last lines: the loser
  // is down before the stamp lands on the first of them
  if (state.phase === 'end' && state.winner) {
    return {
      player: state.winner === 'player' ? 'win' : 'lose',
      opponent: state.winner === 'opponent' ? 'win' : 'lose',
    };
  }
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
