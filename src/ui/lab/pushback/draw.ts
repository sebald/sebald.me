/**
 * Everything drawn into the 480 by 270 canvas: the scene (a flat colour
 * until the backgrounds land), the two duellists (rectangles until the
 * sprites land) and the chrome, which stays drawn in code: the bars, the
 * dialogue box as a 9-slice. The canvas is drawn at native size and
 * scaled by the browser with hard edges.
 */
import type { SceneId } from '@/lib/lab/pushback/characters';
import type { Side } from '@/lib/lab/pushback/duel';
import {
  LAYOUT,
  type Pose,
  STAGE,
  barRects,
  barWidth,
} from '@/lib/lab/pushback/stage';

// Palette
// ---------------

/** Placeholder scene colours: wall, floor, ceiling strip */
const SCENES: Record<SceneId, { wall: string; floor: string; top: string }> = {
  floor: { wall: '#2e3a4a', floor: '#23292f', top: '#3a4656' },
  meeting: { wall: '#6b6256', floor: '#4b4a48', top: '#7a7166' },
  studio: { wall: '#5a4634', floor: '#3e2e20', top: '#6a5440' },
  office: { wall: '#141a2b', floor: '#0e1119', top: '#1b2238' },
};

const SPRITE: Record<Side, { body: string; head: string; light: string }> = {
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

// Model
// ---------------

export interface SpriteModel {
  /** Left edge of the 72 px cell */
  x: number;
  pose: Pose;
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

export interface FrameModel {
  scene: SceneId;
  sprites: Record<Side, SpriteModel>;
  bars: Record<Side, BarsModel>;
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

/** A placeholder figure: a body, a head and a nose on the facing side */
const drawSprite = (
  ctx: CanvasRenderingContext2D,
  side: Side,
  sprite: SpriteModel,
) => {
  const colours = SPRITE[side];
  const { width, height } = LAYOUT.cell;
  const x = sprite.x + sprite.dx;
  const bottom = LAYOUT.feet + sprite.dy;
  const bodyW = 30;
  const bodyH = 52;
  const headS = 22;
  const cx = x + Math.floor(width / 2);
  const body = sprite.lighter ? colours.light : colours.body;
  // Legs
  rect(ctx, cx - 12, bottom - 24, 10, 24, body);
  rect(ctx, cx + 2, bottom - 24, 10, 24, body);
  // Body
  rect(ctx, cx - bodyW / 2, bottom - 24 - bodyH, bodyW, bodyH, body);
  // Head
  const headY = bottom - 24 - bodyH - headS - 2;
  rect(
    ctx,
    cx - headS / 2,
    headY,
    headS,
    headS,
    sprite.lighter ? colours.light : colours.head,
  );
  // Nose on the facing side, eyes
  const facing = sprite.mirrored ? -1 : 1;
  rect(
    ctx,
    cx + facing * (headS / 2) - (facing < 0 ? 3 : 0),
    headY + 10,
    3,
    4,
    colours.head,
  );
  rect(ctx, cx + facing * 4 - 1, headY + 7, 2, 2, CHROME.outer);
  // Pose markers: an arm for talk and taunt, both up for win, down for lose
  if (sprite.pose === 'talk' || sprite.pose === 'taunt') {
    rect(
      ctx,
      cx + facing * (bodyW / 2) + (facing < 0 ? -16 : 0),
      bottom - 24 - bodyH + 10,
      16,
      6,
      body,
    );
  } else if (sprite.pose === 'win') {
    rect(ctx, cx - bodyW / 2 - 6, headY - 10, 6, 40, body);
    rect(ctx, cx + bodyW / 2, headY - 10, 6, 40, body);
  } else if (sprite.pose === 'lose') {
    rect(ctx, cx - bodyW / 2 - 6, bottom - 24 - bodyH + 20, 6, 30, body);
    rect(ctx, cx + bodyW / 2, bottom - 24 - bodyH + 20, 6, 30, body);
  }
  // Cell top marker so the height range is visible in the grey box
  void height;
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

export const drawFrame = (ctx: CanvasRenderingContext2D, model: FrameModel) => {
  ctx.imageSmoothingEnabled = false;
  drawScene(ctx, model.scene);
  drawSprite(ctx, 'player', model.sprites.player);
  drawSprite(ctx, 'opponent', model.sprites.opponent);
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
