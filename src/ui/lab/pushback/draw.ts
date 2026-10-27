/**
 * The frame's canvas: the room band (a flat colour until the loop under
 * the canvas has loaded) and the panel's ground. The duellists and the
 * ghost are their own canvases (`Character`, `Ghost`), which share
 * `drawCell`; the bars, the quiet window and the letters are DOM
 * (`Hud`, `Window`, see the screen).
 */
import type { SceneId } from '@/lib/lab/pushback/characters';
import { BACKING, BREATH, LAYOUT, STAGE } from '@/lib/lab/pushback/stage';

import type { Sprite } from './sheets';

// Palette
// ---------------

/** Placeholder band colours: wall and floor */
const SCENES: Record<SceneId, { wall: string; floor: string }> = {
  floor: { wall: '#2e3a4a', floor: '#23292f' },
  meeting: { wall: '#6b6256', floor: '#4b4a48' },
  studio: { wall: '#5a4634', floor: '#3e2e20' },
  office: { wall: '#141a2b', floor: '#0e1119' },
};

/** The chrome's colours: the quiet window and the bars */
export const CHROME = {
  /** Behind the panel and outside the window's corners */
  bg: '#07080d',
  ink: '#0b0d16',
  /** The window's frame, lit and unlit */
  frame: '#b7b09d',
  frameDim: '#4a5066',
  frameInner: '#1c2236',
  fill: '#131829',
  fillTop: '#1a2035',
  /** The player's side */
  gold: '#f2c14e',
  goldLight: '#fff1b8',
  goldShade: '#b8871f',
  /** The opponent's side */
  ember: '#f0a36f',
  emberLight: '#ffd6b8',
  emberShade: '#b86a35',
  /** Empty ticks and pips */
  empty: '#0f1433',
  emptyDots: '#19224f',
  /** The marker on the centre tick */
  steel: '#8a92b8',
} as const;

/** The ghost is see-through: its opacity when fully shown */
export const GHOST_ALPHA = 0.7;

// Model
// ---------------

export interface FrameModel {
  scene: SceneId;
  /** The window of the scene the band shows (`viewFor`) */
  view: { x: number; y: number };
}

// Drawing
// ---------------

const rect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colour: string,
) => {
  ctx.fillStyle = colour;
  ctx.fillRect(x, y, w, h);
};

const drawBand = (ctx: CanvasRenderingContext2D, scene: SceneId) => {
  const colours = SCENES[scene];
  rect(ctx, 0, 0, STAGE.width, LAYOUT.band, colours.wall);
  rect(
    ctx,
    0,
    LAYOUT.feet,
    STAGE.width,
    LAYOUT.band - LAYOUT.feet,
    colours.floor,
  );
};

/** Where a cell is drawn: its left edge, its bottom, mirrored or not */
export interface CellPlace {
  x: number;
  bottom: number;
  mirrored?: boolean;
  /** Times the sheet's pixels */
  scale?: number;
}

/** Run `draw` in the cell's own pixels, mirrored about the cell when asked */
const inCell = (
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  { x, bottom, mirrored = false, scale = 1 }: CellPlace,
  draw: (scale: number) => void,
) => {
  const { width, height } = sprite.meta.cell;
  ctx.save();
  if (mirrored) {
    ctx.translate(x + width * scale, bottom - height * scale);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, bottom - height * scale);
  }
  draw(scale);
  ctx.restore();
};

export interface CellOptions {
  /** The cell in two slices cut at the hip, the upper one a pixel lower */
  breath?: 0 | 1;
  /** The idle cell's lower face over this cell's: the mouth shut */
  mouthShut?: boolean;
}

/**
 * One cell of a sprite at a place. With `breath` the cell is drawn in
 * two slices cut at the hip, the upper one a pixel lower; with
 * `mouthShut` the idle cell's lower face is pasted over the cell's
 * (the talk pose between words).
 */
export const drawCell = (
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  cell: number,
  place: CellPlace,
  { breath = 0, mouthShut = false }: CellOptions = {},
) =>
  inCell(ctx, sprite, place, scale => {
    const { width, height } = sprite.meta.cell;
    const w = width * scale;
    const h = height * scale;
    const sx = cell * width;
    // The upper body comes down a pixel on the exhale
    const dy = breath * scale;
    if (breath === 0) {
      ctx.drawImage(sprite.canvas, sx, 0, width, height, 0, 0, w, h);
    } else {
      // The legs stay, the body above the hip comes down a pixel and
      // covers the seam row
      const box = sprite.meta.cells[cell]?.box;
      const hip = box
        ? Math.round(box.y + box.height * (1 - BREATH.hip))
        : Math.round(height * 0.6);
      const legs = height - hip;
      ctx.drawImage(
        sprite.canvas,
        sx,
        hip,
        width,
        legs,
        0,
        hip * scale,
        w,
        legs * scale,
      );
      ctx.drawImage(sprite.canvas, sx, 0, width, hip, 0, dy, w, hip * scale);
    }
    const { mouth, talkMouth } = sprite.meta.features ?? {};
    if (mouthShut && mouth && talkMouth) {
      ctx.drawImage(
        sprite.canvas,
        mouth.x,
        mouth.y,
        mouth.width,
        mouth.height,
        talkMouth.x * scale,
        talkMouth.y * scale + dy,
        mouth.width * scale,
        mouth.height * scale,
      );
    }
  });

/** The tears' colours: a pale drop with a darker tail */
const TEAR = { drop: '#bfe6ff', tail: '#6fb6f0' } as const;

/**
 * A tear on the lose cell: a two-pixel drop `fallen` pixels under the
 * eye, moving with the breath like the face does.
 */
export const drawTear = (
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  place: CellPlace,
  fallen: number,
  breath: 0 | 1 = 0,
) => {
  const eye = sprite.meta.features?.eye;
  if (!eye) return;
  inCell(ctx, sprite, place, scale => {
    const x = eye.x * scale;
    const y = (eye.y + 1 + fallen + breath) * scale;
    ctx.fillStyle = TEAR.tail;
    ctx.fillRect(x, y, scale, scale);
    ctx.fillStyle = TEAR.drop;
    ctx.fillRect(x, y + scale, scale, scale);
  });
};

/** The ground under the band; the window on it is DOM (`Window`) */
const drawPanel = (ctx: CanvasRenderingContext2D) => {
  rect(ctx, 0, LAYOUT.band, STAGE.width, STAGE.height - LAYOUT.band, CHROME.bg);
};

/** The ghost from its sheet, see-through; a pale shape until it is built */
export interface DrawOptions {
  /**
   * Paint the flat placeholder band. Off once the scene loop under the
   * canvas has loaded; the band is then transparent apart from the
   * figures and the chrome.
   */
  background?: boolean;
  /** Canvas pixels per stage pixel (`backingFor`) */
  backing?: number;
}

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  model: FrameModel,
  { background = true, backing = BACKING }: DrawOptions = {},
) => {
  // Stage coordinates on a canvas `backing` times the stage
  ctx.setTransform(backing, 0, 0, backing, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, STAGE.width, STAGE.height);
  if (background) drawBand(ctx, model.scene);
  drawPanel(ctx);
};
