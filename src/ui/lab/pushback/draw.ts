/**
 * Everything drawn into the canvas: the room band (a flat colour until
 * the loop under the canvas has loaded), the two duellists from their
 * sheets (rectangles until the sprites are built), the ghost, and the
 * chrome, which stays drawn in code on the same pixel grid as the room:
 * the shared scale, the momentum pips, the composure strip and the quiet
 * window the text sits in. The canvas is drawn at `BACKING` times the
 * stage and scaled down by the browser. Letters are DOM, see the screen.
 */
import type { SceneId } from '@/lib/lab/pushback/characters';
import type { Side } from '@/lib/lab/pushback/duel';
import type { Swap } from '@/lib/lab/pushback/sprites';
import {
  BACKING,
  BREATH,
  LAYOUT,
  type Pose,
  STAGE,
  barRects,
  barWidth,
  scaleTicks,
} from '@/lib/lab/pushback/stage';

import type { Sprite, Sprites } from './sheets';

// Palette
// ---------------

/** Placeholder band colours: wall and floor */
const SCENES: Record<SceneId, { wall: string; floor: string }> = {
  floor: { wall: '#2e3a4a', floor: '#23292f' },
  meeting: { wall: '#6b6256', floor: '#4b4a48' },
  studio: { wall: '#5a4634', floor: '#3e2e20' },
  office: { wall: '#141a2b', floor: '#0e1119' },
};

const PLACEHOLDER: Record<Side, { body: string; head: string; light: string }> =
  {
    player: { body: '#2f8f8a', head: '#d9b38c', light: '#7fd6d0' },
    opponent: { body: '#c0622f', head: '#e3c2a0', light: '#f0a36f' },
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

export interface SpriteModel {
  /** Left edge of the cell, in stage pixels */
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
  /** The breathing frame (`breathFrame`): 1 moves the upper body a pixel down */
  breath: 0 | 1;
  /** Faces left (the right-hand duellist) */
  mirrored: boolean;
}

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
export interface GhostModel {
  /** Left edge of its cell, in stage pixels */
  x: number;
  dy: number;
  /** The ghost sheet cell, from `ghostCell` */
  cell: number;
  /** 0 to 1, fading in */
  opacity: number;
  /** 0 to 1: how far out of the black hole it is (`ghostEnter`) */
  enter: number;
}

export interface FrameModel {
  scene: SceneId;
  /** The window of the scene the band shows (`viewFor`) */
  view: { x: number; y: number };
  sprites: Record<Side, SpriteModel>;
  hud: HudModel;
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

/** Knock the corners of a box out to `bg`, with the diagonal in ink */
const corners = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string,
) => {
  const points = [
    [x, y, 1, 1],
    [x + w - 1, y, -1, 1],
    [x, y + h - 1, 1, -1],
    [x + w - 1, y + h - 1, -1, -1],
  ] as const;
  for (const [cx, cy, sx, sy] of points) {
    rect(ctx, cx, cy, 1, 1, bg);
    rect(ctx, cx + sx, cy, 1, 1, bg);
    rect(ctx, cx, cy + sy, 1, 1, bg);
    rect(ctx, cx + sx, cy + sy, 1, 1, CHROME.ink);
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

/**
 * One cell of a sprite with its bottom on `bottom`, its cell's left edge
 * on `x`, at `scale` times the sheet's pixels, mirrored about the cell
 * when asked. With `breath` the cell is drawn in two slices cut at the
 * hip, the upper one a pixel lower. Exported for the viewer.
 */
export const drawCell = (
  ctx: CanvasRenderingContext2D,
  sprite: Sprite,
  cell: number,
  x: number,
  bottom: number,
  mirrored = false,
  scale = 1,
  breath: 0 | 1 = 0,
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
  const sx = cell * width;
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
    ctx.drawImage(sprite.canvas, sx, 0, width, hip, 0, scale, w, hip * scale);
  }
  ctx.restore();
};

/** The grey box's figure, until the sprite is built */
const drawPlaceholder = (
  ctx: CanvasRenderingContext2D,
  side: Side,
  sprite: SpriteModel,
) => {
  const colours = PLACEHOLDER[side];
  const bottom = LAYOUT.feet + sprite.dy;
  const cx = sprite.x + sprite.dx + Math.floor(LAYOUT.cell.width / 2);
  const bodyW = 30;
  const bodyH = 52;
  const headS = 22;
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
  const x = model.x + model.dx;
  const bottom = LAYOUT.feet + model.dy;
  const draw = () =>
    drawCell(
      ctx,
      sprite,
      model.cell,
      x,
      bottom,
      model.mirrored,
      1,
      model.breath,
    );
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
export const drawWindow = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  on = true,
  bg = CHROME.bg,
) => {
  rect(ctx, x, y, w, h, CHROME.ink);
  rect(ctx, x + 1, y + 1, w - 2, h - 2, on ? CHROME.frame : CHROME.frameDim);
  rect(ctx, x + 2, y + 2, w - 4, h - 4, CHROME.frameInner);
  rect(ctx, x + 3, y + 3, w - 6, h - 6, on ? CHROME.fill : '#0e1220');
  checker(ctx, x + 3, y + 3, w - 6, 2, on ? CHROME.fillTop : '#121626');
  corners(ctx, x, y, w, h, bg);
};

/** The panel under the band: the background and the window */
const drawPanel = (ctx: CanvasRenderingContext2D) => {
  rect(ctx, 0, LAYOUT.band, STAGE.width, STAGE.height - LAYOUT.band, CHROME.bg);
  const { x, y, width, height } = LAYOUT.panel;
  drawWindow(ctx, x, y, width, height);
};

/** The ghost from its sheet, see-through; a pale shape until it is built */
const drawGhost = (
  ctx: CanvasRenderingContext2D,
  ghost: GhostModel,
  sprites: Sprites,
) => {
  const sprite = sprites.ghost;
  const cx = ghost.x + LAYOUT.cell.width / 2;
  const bottom = LAYOUT.feet - ghost.dy;
  const box = sprite?.meta.cells[ghost.cell]?.box;
  // The middle of the figure: where the hole is
  const midY = box
    ? Math.round(bottom - (LAYOUT.cell.height - box.y - box.height / 2))
    : bottom - 28;
  ctx.save();
  if (ghost.enter < 1) {
    // The black hole: a dark disc with a pale rim that the ghost is drawn
    // out of, or into, squeezed sideways
    const r = Math.round(2 + 5 * (1 - ghost.enter));
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(r * r - dy * dy));
      rect(ctx, cx - w, midY + dy, 2 * w, 1, '#05060a');
      if (Math.abs(dy) === r) continue;
      rect(ctx, cx - w, midY + dy, 1, 1, '#2f5e60');
      rect(ctx, cx + w - 1, midY + dy, 1, 1, '#2f5e60');
    }
    ctx.translate(cx, midY);
    ctx.scale(Math.max(0.05, ghost.enter), 0.25 + 0.75 * ghost.enter);
    ctx.translate(-cx, -midY);
  }
  ctx.globalAlpha = GHOST_ALPHA * ghost.opacity;
  if (sprite) {
    drawCell(ctx, sprite, ghost.cell, ghost.x, bottom);
  } else {
    rect(ctx, cx - 10, bottom - 40, 20, 34, '#bfe8ea');
    rect(ctx, cx - 9, bottom - 58, 18, 18, '#e8fbfb');
  }
  ctx.restore();
};

export interface DrawOptions {
  /**
   * Paint the flat placeholder band. Off once the scene loop under the
   * canvas has loaded; the band is then transparent apart from the
   * figures and the chrome.
   */
  background?: boolean;
  /** The sprites that are built; a missing one draws as a placeholder */
  sprites?: Sprites;
  /** Canvas pixels per stage pixel (`backingFor`) */
  backing?: number;
}

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  model: FrameModel,
  { background = true, sprites = {}, backing = BACKING }: DrawOptions = {},
) => {
  // Stage coordinates on a canvas `backing` times the stage
  ctx.setTransform(backing, 0, 0, backing, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, STAGE.width, STAGE.height);
  if (background) drawBand(ctx, model.scene);
  // Nothing in the band spills into the panel
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, STAGE.width, LAYOUT.band);
  ctx.clip();
  if (model.ghost) drawGhost(ctx, model.ghost, sprites);
  drawSprite(ctx, 'player', model.sprites.player, sprites);
  drawSprite(ctx, 'opponent', model.sprites.opponent, sprites);
  ctx.restore();
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
