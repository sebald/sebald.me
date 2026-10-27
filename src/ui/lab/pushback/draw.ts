/**
 * Everything drawn into the canvas: the scene (a flat colour until the
 * loop under the canvas has loaded), the two duellists from their sheets
 * (rectangles until the sprites are built), the ghost, and the chrome,
 * which stays drawn in code: the bars, the dialogue box as a 9-slice.
 * The canvas is drawn at `BACKING` times the stage and scaled down by the
 * browser.
 */
import type { SceneId } from '@/lib/lab/pushback/characters';
import type { Side } from '@/lib/lab/pushback/duel';
import type { Swap } from '@/lib/lab/pushback/sprites';
import {
  BACKING,
  FIGURE_SCALE,
  LAYOUT,
  type Pose,
  STAGE,
  barRects,
  barWidth,
  figureCell,
} from '@/lib/lab/pushback/stage';

import type { Sprite, Sprites } from './sheets';

// Palette
// ---------------

/** Placeholder scene colours: wall, floor, ceiling strip */
const SCENES: Record<SceneId, { wall: string; floor: string; top: string }> = {
  floor: { wall: '#2e3a4a', floor: '#23292f', top: '#3a4656' },
  meeting: { wall: '#6b6256', floor: '#4b4a48', top: '#7a7166' },
  studio: { wall: '#5a4634', floor: '#3e2e20', top: '#6a5440' },
  office: { wall: '#141a2b', floor: '#0e1119', top: '#1b2238' },
};

const PLACEHOLDER: Record<Side, { body: string; head: string; light: string }> =
  {
    player: { body: '#2f8f8a', head: '#d9b38c', light: '#7fd6d0' },
    opponent: { body: '#c0622f', head: '#e3c2a0', light: '#f0a36f' },
  };

const CHROME = {
  outer: '#0b0d12',
  inner: '#e6e2d6',
  fill: '#171a22',
  filled: '#e6e2d6',
  empty: '#3a3f4b',
  momentum: '#f2c14e',
  momentumFull: '#fff1b8',
};

/** The ghost is see-through: its opacity when fully shown */
export const GHOST_ALPHA = 0.7;

// Model
// ---------------

export interface SpriteModel {
  /** The stand: left edge of the 1x cell (`figureCell` gives the drawn one) */
  x: number;
  pose: Pose;
  /** The sheet cell, from `cellFor` */
  cell: number;
  /** What to draw from; the key is where `Sprites` holds it */
  swap: Swap;
  key: string;
  dx: number;
  dy: number;
  lighter: boolean;
  /** Faces left (the right-hand duellist) */
  mirrored: boolean;
}

export interface BarsModel {
  buyIn: number;
  buyInTotal: number;
  momentum: number;
  momentumTotal: number;
  /** A full momentum bar blinks at the idle rhythm */
  blinkOn: boolean;
}

/** The onboarding buddy's ghost, while it shows */
export interface GhostModel {
  /** Left edge of its drawn (`FIGURE_SCALE`) cell */
  x: number;
  dy: number;
  /** The ghost sheet cell, from `ghostCell` */
  cell: number;
  /** 0 to 1, fading in */
  opacity: number;
}

export interface FrameModel {
  scene: SceneId;
  sprites: Record<Side, SpriteModel>;
  bars: Record<Side, BarsModel>;
  ghost?: GhostModel;
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

const drawScene = (ctx: CanvasRenderingContext2D, scene: SceneId) => {
  const colours = SCENES[scene];
  rect(ctx, 0, 0, STAGE.width, STAGE.height, colours.wall);
  rect(ctx, 0, 0, STAGE.width, LAYOUT.top, colours.top);
  rect(
    ctx,
    0,
    LAYOUT.feet,
    STAGE.width,
    STAGE.height - LAYOUT.feet,
    colours.floor,
  );
};

/**
 * One cell of a sprite with its bottom on `bottom`, its cell's left edge
 * on `x`, at `scale` times the sheet's pixels, mirrored about the cell
 * when asked. Exported for the viewer.
 */
export const drawCell = (
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  cell: number,
  x: number,
  bottom: number,
  mirrored = false,
  scale = 1,
) => {
  const { width, height } = sprite.meta.cell;
  const w = width * scale;
  const h = height * scale;
  ctx.save();
  if (mirrored) {
    ctx.translate(x + w, bottom - h);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(x, bottom - h);
  }
  ctx.drawImage(sprite.canvas, cell * width, 0, width, height, 0, 0, w, h);
  ctx.restore();
};

/** The grey box's figure, until the sprite is built */
const drawPlaceholder = (
  ctx: CanvasRenderingContext2D,
  side: Side,
  sprite: SpriteModel,
) => {
  const colours = PLACEHOLDER[side];
  // Drawn in 1x cell coordinates, scaled up like the sprite
  const cell = figureCell(sprite.x);
  ctx.save();
  ctx.translate(cell.x + sprite.dx, LAYOUT.feet + sprite.dy);
  ctx.scale(FIGURE_SCALE, FIGURE_SCALE);
  const x = 0;
  const bottom = 0;
  const bodyW = 30;
  const bodyH = 52;
  const headS = 22;
  const cx = x + Math.floor(LAYOUT.cell.width / 2);
  const body = sprite.lighter ? colours.light : colours.body;
  rect(ctx, cx - 12, bottom - 24, 10, 24, body);
  rect(ctx, cx + 2, bottom - 24, 10, 24, body);
  rect(ctx, cx - bodyW / 2, bottom - 24 - bodyH, bodyW, bodyH, body);
  const headY = bottom - 24 - bodyH - headS - 2;
  rect(
    ctx,
    cx - headS / 2,
    headY,
    headS,
    headS,
    sprite.lighter ? colours.light : colours.head,
  );
  ctx.restore();
};

const drawSprite = (
  ctx: CanvasRenderingContext2D,
  side: Side,
  model: SpriteModel,
  sprites: Sprites,
) => {
  const sprite = sprites[model.key];
  if (!sprite) {
    drawPlaceholder(ctx, side, model);
    return;
  }
  const x = figureCell(model.x).x + model.dx;
  const bottom = LAYOUT.feet + model.dy;
  const draw = () =>
    drawCell(ctx, sprite, model.cell, x, bottom, model.mirrored, FIGURE_SCALE);
  draw();
  if (model.lighter) {
    // The flinch flash: the cell again, added on top of itself
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.3;
    draw();
    ctx.restore();
  }
};

const drawBars = (
  ctx: CanvasRenderingContext2D,
  bars: BarsModel,
  centerX: number,
) => {
  const buyInW = barWidth(bars.buyInTotal, LAYOUT.buyIn);
  const buyIn = barRects({
    x: Math.round(centerX - buyInW / 2),
    y: 12,
    count: bars.buyInTotal,
    filled: bars.buyIn,
    ...LAYOUT.buyIn,
  });
  for (const r of buyIn) {
    rect(ctx, r.x - 1, r.y - 1, r.width + 2, r.height + 2, CHROME.outer);
    rect(
      ctx,
      r.x,
      r.y,
      r.width,
      r.height,
      r.filled ? CHROME.filled : CHROME.empty,
    );
  }
  const momentumW = barWidth(bars.momentumTotal, LAYOUT.momentum);
  const full = bars.momentum >= bars.momentumTotal;
  const momentum = barRects({
    x: Math.round(centerX - momentumW / 2),
    y: 12 + LAYOUT.buyIn.height + 4,
    count: bars.momentumTotal,
    filled: bars.momentum,
    ...LAYOUT.momentum,
  });
  for (const r of momentum) {
    rect(ctx, r.x - 1, r.y - 1, r.width + 2, r.height + 2, CHROME.outer);
    const colour = r.filled
      ? full && bars.blinkOn
        ? CHROME.momentumFull
        : CHROME.momentum
      : CHROME.empty;
    rect(ctx, r.x, r.y, r.width, r.height, colour);
  }
};

/** The ghost from its sheet, see-through; a pale shape until it is built */
const drawGhost = (
  ctx: CanvasRenderingContext2D,
  ghost: GhostModel,
  sprites: Sprites,
) => {
  const sprite = sprites.ghost;
  ctx.save();
  ctx.globalAlpha = GHOST_ALPHA * ghost.opacity;
  if (sprite) {
    drawCell(
      ctx,
      sprite,
      ghost.cell,
      ghost.x,
      LAYOUT.feet - ghost.dy,
      false,
      FIGURE_SCALE,
    );
  } else {
    const cx = ghost.x + (LAYOUT.cell.width * FIGURE_SCALE) / 2;
    const bottom = LAYOUT.feet - ghost.dy;
    rect(ctx, cx - 20, bottom - 80, 40, 68, '#bfe8ea');
    rect(ctx, cx - 18, bottom - 116, 36, 36, '#e8fbfb');
  }
  ctx.restore();
};

/** The dialogue box: a 9-slice with a 2 px frame, over the floor strip */
const drawBox = (ctx: CanvasRenderingContext2D) => {
  const x = 4;
  const y = LAYOUT.feet + 2;
  const w = STAGE.width - 8;
  const h = STAGE.height - y - 3;
  rect(ctx, x, y, w, h, CHROME.outer);
  rect(ctx, x + 1, y + 1, w - 2, h - 2, CHROME.inner);
  rect(ctx, x + 2, y + 2, w - 4, h - 4, CHROME.fill);
  // Rounded corners: knock out the corner pixels
  const corners = [
    [x, y],
    [x + w - 1, y],
    [x, y + h - 1],
    [x + w - 1, y + h - 1],
  ] as const;
  for (const [cx, cy] of corners) rect(ctx, cx, cy, 1, 1, CHROME.outer);
};

export interface DrawOptions {
  /**
   * Paint the flat placeholder scene. Off once the scene loop under the
   * canvas has loaded; the canvas is then transparent apart from the
   * figures and the chrome.
   */
  background?: boolean;
  /** The sprites that are built; a missing one draws as a placeholder */
  sprites?: Sprites;
}

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  model: FrameModel,
  { background = true, sprites = {} }: DrawOptions = {},
) => {
  // Native coordinates on a canvas `BACKING` times the stage
  ctx.setTransform(BACKING, 0, 0, BACKING, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (background) drawScene(ctx, model.scene);
  else ctx.clearRect(0, 0, STAGE.width, STAGE.height);
  if (model.ghost) drawGhost(ctx, model.ghost, sprites);
  drawSprite(ctx, 'player', model.sprites.player, sprites);
  drawSprite(ctx, 'opponent', model.sprites.opponent, sprites);
  drawBars(
    ctx,
    model.bars.player,
    model.sprites.player.x + LAYOUT.cell.width / 2,
  );
  drawBars(
    ctx,
    model.bars.opponent,
    model.sprites.opponent.x + LAYOUT.cell.width / 2,
  );
  drawBox(ctx);
};
