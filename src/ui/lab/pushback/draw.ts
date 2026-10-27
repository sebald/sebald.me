/**
 * The frame's canvas: the room band (a flat colour until the loop under
 * the canvas has loaded) and the chrome, drawn in code on the same pixel
 * grid as the room: the shared scale, the momentum pips, the composure
 * strip. The duellists and the ghost are their own canvases
 * (`Character`, `Ghost`), which share `drawCell`; the quiet window and
 * the letters are DOM (`Window`, see the screen).
 */
import type { SceneId } from '@/lib/lab/pushback/characters';
import type { Side } from '@/lib/lab/pushback/duel';
import {
  BACKING,
  BREATH,
  LAYOUT,
  STAGE,
  barRects,
  barWidth,
  scaleTicks,
} from '@/lib/lab/pushback/stage';

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

export interface HudModel {
  /** The shared scale, positive toward the player */
  scale: number;
  toWin: number;
  toLose: number;
  momentum: Record<Side, number>;
  momentumTotal: number;
  /** The opponent's composure, 0 to 1: fatigue drains it */
  composure: number;
  /** A full momentum bar blinks at the idle rhythm */
  blinkOn: boolean;
  /** Rows cropped off the top in a short window: the HUD moves down by this */
  crop: number;
}

/** The onboarding buddy's ghost, while it shows */
export interface FrameModel {
  scene: SceneId;
  /** The window of the scene the band shows (`viewFor`) */
  view: { x: number; y: number };
  hud: HudModel;
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

/** Every other pixel, a dither */
const checker = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colour: string,
) => {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x + ((yy + x) % 2); xx < x + w; xx += 2) {
      rect(ctx, xx, yy, 1, 1, colour);
    }
  }
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

/** A lit box: a light top row, the colour, a shaded bottom row */
const lit = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  side: Side,
  bright = false,
) => {
  const player = side === 'player';
  const top = player ? CHROME.goldLight : CHROME.emberLight;
  const mid = bright ? top : player ? CHROME.gold : CHROME.ember;
  const shade = player ? CHROME.goldShade : CHROME.emberShade;
  rect(ctx, x, y, w, 1, top);
  rect(ctx, x, y + 1, w, h - 2, mid);
  rect(ctx, x, y + h - 1, w, 1, shade);
};

/** An empty box: dark with a dither */
const empty = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) => {
  rect(ctx, x, y, w, h, CHROME.empty);
  checker(ctx, x, y + 1, w, h - 2, CHROME.emptyDots);
};

/** The shared scale: ticks across the top, the marker where it points */
const drawScale = (ctx: CanvasRenderingContext2D, hud: HudModel) => {
  const ticks = scaleTicks(hud);
  for (const tick of ticks) {
    rect(
      ctx,
      tick.x - 1,
      tick.y - 1,
      tick.width + 2,
      tick.height + 2,
      CHROME.ink,
    );
    if (tick.lit && tick.side) {
      lit(ctx, tick.x, tick.y, tick.width, tick.height, tick.side);
    } else {
      empty(ctx, tick.x, tick.y, tick.width, tick.height);
    }
  }
  const marker = ticks.find(tick => tick.marker);
  if (!marker) return;
  // The marker: a bright notch on the tick, and a pointer under it
  const colour = marker.side
    ? marker.side === 'player'
      ? CHROME.goldLight
      : CHROME.emberLight
    : CHROME.steel;
  const mx = marker.x + Math.floor(marker.width / 2);
  rect(
    ctx,
    marker.x + 1,
    marker.y + 1,
    marker.width - 2,
    marker.height - 2,
    colour,
  );
  rect(ctx, mx - 2, marker.y + marker.height + 1, 5, 1, CHROME.ink);
  rect(ctx, mx - 1, marker.y + marker.height + 2, 3, 1, CHROME.ink);
  rect(ctx, mx, marker.y + marker.height + 3, 1, 1, CHROME.ink);
  rect(ctx, mx - 1, marker.y + marker.height + 1, 3, 1, colour);
  rect(ctx, mx, marker.y + marker.height + 2, 1, 1, colour);
};

/** Momentum pips in a corner, filling from the outside in */
const drawPips = (ctx: CanvasRenderingContext2D, hud: HudModel, side: Side) => {
  const { x, y, width, height, gap } = LAYOUT.pips;
  const total = hud.momentumTotal;
  const w = barWidth(total, { width, gap });
  const left = side === 'player' ? x : STAGE.width - x - w;
  const full = hud.momentum[side] >= total;
  const pips = barRects({
    x: left,
    y,
    count: total,
    filled: hud.momentum[side],
    width,
    height,
    gap,
  });
  // The right corner fills from its outer end
  const ordered = side === 'player' ? pips : [...pips].reverse();
  ordered.forEach((pip, i) => {
    const filled = i < hud.momentum[side];
    rect(ctx, pip.x - 1, pip.y - 1, pip.width + 2, pip.height + 2, CHROME.ink);
    if (filled) {
      lit(ctx, pip.x, pip.y, pip.width, pip.height, side, full && hud.blinkOn);
    } else {
      empty(ctx, pip.x, pip.y, pip.width, pip.height);
    }
  });
};

/** The opponent's composure: a strip that drains as it tires */
const drawComposure = (ctx: CanvasRenderingContext2D, hud: HudModel) => {
  const { y, width, height } = LAYOUT.composure;
  const x = STAGE.width - LAYOUT.pips.x - width;
  rect(ctx, x - 1, y - 1, width + 2, height + 2, CHROME.ink);
  rect(ctx, x, y, width, height, CHROME.empty);
  const left = Math.round(width * Math.max(0, Math.min(1, hud.composure)));
  // Drains from the inner end, so the outer end is the last to go
  if (left > 0) {
    rect(ctx, x + width - left, y, left, height, CHROME.ember);
    rect(ctx, x + width - left, y, left, 1, CHROME.emberLight);
  }
};

/** The quiet window: ink, a pale frame, a dark fill, the corners knocked out */
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
  // The HUD stays at the top of what is shown when the ceiling is cropped
  ctx.save();
  ctx.translate(0, model.hud.crop);
  drawScale(ctx, model.hud);
  drawPips(ctx, model.hud, 'player');
  drawPips(ctx, model.hud, 'opponent');
  drawComposure(ctx, model.hud);
  ctx.restore();
  drawPanel(ctx);
};
