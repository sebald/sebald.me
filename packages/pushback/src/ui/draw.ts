import { BACKING } from '@sebald/blip-ui';

/**
 * The frame's canvas: the panel's ground under the room band, which is
 * left clear for the scene loop under the canvas. The duellists and the
 * ghost are their own canvases (`Character`, `Ghost`), which share
 * `drawCell`; the bars, the quiet window and the letters are DOM
 * (`Hud`, `Window`, see the screen).
 */
import type { SceneId } from '../lib/characters';
import { type Facing, POSE_CELL } from '../lib/sprites';
import { BREATH, LAYOUT, STAGE } from '../lib/stage';
import { PALETTE } from './palette';
import type { Sprite } from './sheets';

// Palette
// ---------------

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

/** Where a cell is drawn: its left edge, its bottom, which way it faces */
export interface CellPlace {
  x: number;
  bottom: number;
  /** `left` mirrors the cell, the sheets facing right */
  facing?: Facing;
  /** Times the sheet's pixels */
  scale?: number;
}

/**
 * Run `draw` in the pixels of the sprite's `cell`, mirrored about the
 * cell to face left, and moved by the cell's `dx` so the figure's feet
 * stand where the idle pose's do. The move is in the cell's own space,
 * so it turns with the figure.
 */
const inCell = (
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  cell: number,
  { x, bottom, facing = 'right', scale = 1 }: CellPlace,
  draw: (scale: number) => void,
) => {
  const { width, height } = sprite.meta.cell;
  const dx = sprite.meta.cells[cell]?.dx ?? 0;
  ctx.save();
  if (facing === 'left') {
    ctx.translate(x + width * scale, bottom - height * scale);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, bottom - height * scale);
  }
  ctx.translate(dx * scale, 0);
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
  inCell(ctx, sprite, cell, place, scale => {
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
  inCell(ctx, sprite, POSE_CELL.lose, place, scale => {
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
  rect(
    ctx,
    0,
    LAYOUT.band,
    STAGE.width,
    STAGE.height - LAYOUT.band,
    PALETTE.bg,
  );
};

/** How the frame's canvas is drawn */
export interface DrawOptions {
  /** Canvas pixels per stage pixel (`backingFor`) */
  backing?: number;
}

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  { backing = BACKING }: DrawOptions = {},
) => {
  // Stage coordinates on a canvas `backing` times the stage
  ctx.setTransform(backing, 0, 0, backing, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, STAGE.width, STAGE.height);
  drawPanel(ctx);
};
