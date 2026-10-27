// The studio corner (Designer duels). The desk lamp's pool of light
// flickers now and then, the tablet screen pulses on standby, and the
// loose note at the right edge of the moodboard lifts its corner in the
// draught. Coordinates are native pixels of the padded 480x270 scene.
//
//   node .claude/skills/pixel-sprite/scenes/studio.mjs \
//     src/assets/lab/pushback/scenes/studio/native.png \
//     src/assets/lab/pushback/scenes/studio

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  scale,
  writeLoop,
} from '../../pixel-header/scripts/loop.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125;
const SHOWN_WIDTH = 1920;

const scene = await loadScene(src);
const { base, rgb, setPx, collect } = scene;

const plate = Buffer.from(base);

// Desk lamp
// ---------------
// The pale cone of light under the lamp head, on the wall, the desk and
// the tablet: the brightest, least saturated pixels inside the cone, which
// opens from the lamp head at (346, 134) down to the desk at y 161, its
// left edge near vertical and its right edge sloping out to x 392
const LAMP_LIGHT = { x0: 336, x1: 400, y0: 125, y1: 165 };
const isLight = c => lum(c) > 205 && sat(c) < 0.2;
const inCone = (x, y) =>
  y >= 134 &&
  y <= 162 &&
  x >= 343 - (y - 134) * 0.12 &&
  x <= 350 + (y - 134) * 1.6;
const light = collect(LAMP_LIGHT, (c, x, y) => isLight(c) && inCone(x, y));

const drawLamp = (b, t) => {
  // A flicker: two or three dim frames at two points of the loop
  const step = Math.floor(t / 1);
  const dip =
    (step >= 30 && step <= 32) || (step >= 70 && step <= 71) ? 0.9 : 1;
  const jitter = hash(3, step) < 0.05 ? 0.96 : 1;
  for (const [x, y, c] of light) setPx(b, x, y, scale(c, dip * jitter));
};

// Tablet screen
// ---------------
// The pale greenish screen on the desk pulses slowly, like a device on
// standby: dims to 80 percent and back over four seconds
const TABLET = { x0: 350, x1: 398, y0: 158, y1: 172 };
const isScreen = c => c[1] > 180 && c[2] > 170 && c[0] < c[1] && lum(c) > 170;
const screen = collect(TABLET, isScreen).filter(([, , c]) => !isLight(c));

const drawTablet = (b, t) => {
  const k = 0.8 + 0.2 * (0.5 + 0.5 * Math.sin((t / 32) * Math.PI * 2));
  for (const [x, y, c] of screen) setPx(b, x, y, scale(c, k));
};

// Loose note
// ---------------
// The yellow sticky note at the bottom right of the cork board: its free
// corner (the top-right few pixels) lifts by a pixel for a moment, twice
// per loop.
const NOTE = { x0: 278, x1: 293, y0: 135, y1: 149 };
const isNote = c => c[0] > 200 && c[1] > 180 && c[2] < 170 && c[0] > c[2] + 50;
const note = collect(NOTE, isNote);
const noteRight = Math.max(...note.map(([x]) => x));
const noteTop = Math.min(...note.map(([, y]) => y));
// The corner: pixels in the right third and top half of the note
const corner = note.filter(([x, y]) => x >= noteRight - 4 && y <= noteTop + 6);
const CORK = [150, 103, 62];

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

await writeLoop({
  scene,
  frames,
  delay: DELAY,
  outDir,
  shownWidth: SHOWN_WIDTH,
  oneX: true,
});
