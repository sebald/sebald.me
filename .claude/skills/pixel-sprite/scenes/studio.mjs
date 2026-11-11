// The studio corner (Designer duels). The desk lamp's cone of light
// flickers now and then, the tablet screen pulses on standby, and the
// loose note at the right edge of the moodboard lifts its corner in the
// draught. Coordinates are native pixels of the padded 480x270 scene.
//
//   node .claude/skills/pixel-sprite/scenes/studio.mjs \
//     packages/pushback/src/assets/scenes/studio/native.png \
//     packages/pushback/src/assets/scenes/studio

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  scale,
  writeLoop,
} from '../../pixel-header/scripts/loop.mjs';
import { ROOM_FACTORS, shrinkFrames } from '../scripts/shrink.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125;
const SHOWN_WIDTH = 1920;

const scene = await loadScene(src);
const { base, rgb, setPx, collect } = scene;

const plate = Buffer.from(base);

// Desk lamp
// ---------------
// The pale cone of light under the lamp head, on the wall and the desk,
// one flat colour, with the bright bulb in the head: the cone opens from
// the head at (406, 132) down to the desk at y 166, its left edge leaning
// out to x 375, its right edge to x 425
const LAMP_LIGHT = { x0: 372, x1: 428, y0: 130, y1: 167 };
const near = (c, to, d = 18) =>
  Math.abs(c[0] - to[0]) + Math.abs(c[1] - to[1]) + Math.abs(c[2] - to[2]) <= d;
const CONE = [208, 222, 235];
const isLight = c => near(c, CONE) || (lum(c) > 235 && sat(c) < 0.05);
const inCone = (x, y) =>
  x >= 402 - (y - 132) * 0.9 && x <= 414 + (y - 132) * 0.35;
const light = collect(LAMP_LIGHT, (c, x, y) => isLight(c) && inCone(x, y));

const drawLamp = (b, t) => {
  // A flicker: two or three dim frames at two points of the loop
  const dip = (t >= 30 && t <= 32) || (t >= 70 && t <= 71) ? 0.9 : 1;
  const jitter = hash(3, t) < 0.05 ? 0.96 : 1;
  for (const [x, y, c] of light) setPx(b, x, y, scale(c, dip * jitter));
};

// Tablet screen
// ---------------
// The pale blue screen of the tablet on the desk pulses slowly, like a
// device on standby: dims to 80 percent and back over four seconds
const TABLET = { x0: 383, x1: 425, y0: 167, y1: 178 };
const SCREEN = [202, 228, 241];
const screen = collect(TABLET, c => near(c, SCREEN, 24));

const drawTablet = (b, t) => {
  const k = 0.8 + 0.2 * (0.5 + 0.5 * Math.sin((t / 32) * Math.PI * 2));
  for (const [x, y, c] of screen) setPx(b, x, y, scale(c, k));
};

// Loose note
// ---------------
// The yellow sticky note at the right edge of the cork board: its free
// corner (the top-right few pixels) lifts by a pixel for a moment, twice
// per loop, the cork showing where it was
const NOTE = { x0: 312, x1: 327, y0: 97, y1: 111 };
const isNote = c => c[0] > 200 && c[1] > 180 && c[2] < 170 && c[0] > c[2] + 50;
const note = collect(NOTE, isNote);
const noteRight = Math.max(...note.map(([x]) => x));
const noteTop = Math.min(...note.map(([, y]) => y));
// The corner: pixels in the right third and top half of the note
const corner = note.filter(([x, y]) => x >= noteRight - 4 && y <= noteTop + 5);
const CORK = rgb(base, 328, 104);

const drawNote = (b, t) => {
  const lifted = (t >= 20 && t <= 27) || (t >= 64 && t <= 69);
  if (!lifted) return;
  for (const [x, y] of corner) setPx(b, x, y, mix(rgb(plate, x, y), CORK, 0.5));
  for (const [x, y, c] of corner) {
    if (y - 1 >= NOTE.y0) setPx(b, x + 1, y - 1, c);
  }
};

// Render
// ---------------
console.log(
  `light ${light.length}, screen ${screen.length}, note ${note.length} (corner ${corner.length})`,
);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawLamp(f, t);
  drawTablet(f, t);
  drawNote(f, t);
  return f;
});

// The room shrunk to the cast's size, see shrink.mjs: this render drew
// the studio for people half the frame high
const shrunk = await shrinkFrames(frames, scene.W, scene.H, {
  factor: ROOM_FACTORS.studio,
});

await writeLoop({
  scene,
  frames: shrunk,
  delay: DELAY,
  outDir,
  shownWidth: SHOWN_WIDTH,
  oneX: true,
});
