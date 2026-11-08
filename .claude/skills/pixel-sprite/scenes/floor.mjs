// The open-plan floor (Dev duels). The build light on the shelf swaps
// between red and green and blinks while it "runs", the monitor glow on the
// left desk breathes, and the dying plant's two leaves sag and lift by a
// pixel in the draught. Coordinates are native pixels of the padded
// 480x270 scene.
//
//   node .claude/skills/pixel-sprite/scenes/floor.mjs \
//     packages/pushback/src/assets/scenes/floor/native.png \
//     packages/pushback/src/assets/scenes/floor

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  scale,
  writeLoop,
} from '../../pixel-header/scripts/loop.mjs';
import { drawShapes, shrunkGrid, takeOff } from '../scripts/redraw.mjs';
import { ROOM_FACTORS, shrinkFrames } from '../scripts/shrink.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125; // ms, 8 fps, 12s loop
const SHOWN_WIDTH = 1920; // the stage at 4x

const scene = await loadScene(src);
const { base, rgb, setPx, collect } = scene;

// Clean plate: the scene as drawn is the resting state
const plate = Buffer.from(base);

// The diagram on the small whiteboard comes off the plate and is drawn
// again after the shrink, on the shrunk room's pixels (see redraw.mjs):
// shrunk with the room its one-pixel lines went pale and two wide
const BOARD = { x0: 218, y0: 99, x1: 262, y1: 125 };
const isMarker = c => lum(c) < 140;
takeOff(scene, plate, BOARD, isMarker);

// Build light
// ---------------
// A red and a green bulb on the tower lamp; both are drawn lit. The lamp
// runs a cycle: green steady, then "building" (both off, the red blinks),
// then red steady for a moment, then green again.
const LAMP = { x0: 221, x1: 231, y0: 124, y1: 144 };
const isRed = c => c[0] > 150 && c[1] < 110 && c[2] < 110;
const isGreen = c => c[1] > 130 && c[0] < 130 && c[2] < 130;
const red = collect(LAMP, isRed);
const green = collect(LAMP, isGreen);
const offRed = red.map(([x, y, c]) => [x, y, mix(c, [60, 40, 44], 0.75)]);
const offGreen = green.map(([x, y, c]) => [x, y, mix(c, [40, 60, 48], 0.75)]);
// The glow the bulbs cast on the wall behind them: warm or green tinted
// pixels next to the lamp (the third render has none, the set is empty)
const GLOW = { x0: 218, x1: 236, y0: 124, y1: 140 };
const glow = collect(
  GLOW,
  c =>
    !isRed(c) &&
    !isGreen(c) &&
    (c[0] > c[2] + 12 || c[1] > c[2] + 12) &&
    sat(c) > 0.12 &&
    lum(c) > 60,
);

const drawLamp = (b, t) => {
  // 12 s cycle: 0-5 s green, 5-9 s building, 9-10.5 s red, then green
  const phase = t / FRAMES;
  let state;
  if (phase < 0.42) state = 'green';
  else if (phase < 0.75) state = 'building';
  else if (phase < 0.88) state = 'red';
  else state = 'green';
  const redOn = state === 'red' || (state === 'building' && t % 4 < 2);
  const greenOn = state === 'green';
  for (const [x, y, c] of redOn ? red : offRed) setPx(b, x, y, c);
  for (const [x, y, c] of greenOn ? green : offGreen) setPx(b, x, y, c);
  const f = greenOn || redOn ? 1 : 0.85;
  for (const [x, y, c] of glow) setPx(b, x, y, scale(c, f));
};

// Monitor glow
// ---------------
// The warm light the left monitor throws on the desk and the blind behind
// it, breathing slowly as if the screen scrolled. The box stops short of
// the pizza box; the right monitor's glow is cool and stays still.
const DESK = { x0: 0, x1: 80, y0: 125, y1: 180 };
const isWarm = c => c[0] > c[2] + 40 && c[0] > 120 && sat(c) > 0.3;
const warm = collect(DESK, isWarm);

const drawGlow = (b, t) => {
  // Two gentle breaths per loop, plus a flicker now and then
  const breath = 0.94 + 0.06 * Math.sin((t / FRAMES) * Math.PI * 4);
  const flicker = hash(7, Math.floor(t / 2)) < 0.08 ? 0.9 : 1;
  for (const [x, y, c] of warm) setPx(b, x, y, scale(c, breath * flicker));
};

// Dying plant
// ---------------
// The two drooping leaves on the right desk lift by one pixel in the
// draught and sag back, out of step with each other. Each leaf is the
// greenish pixels of its half of the plant above the pot.
// The leaves are the olive pixels over the window and the desk; the pot
// below them is brown
const PLANT = { x0: 372, x1: 394, y0: 147, y1: 168 };
const isLeaf = c =>
  c[1] > c[2] + 15 && c[1] >= c[0] - 14 && lum(c) < 140 && lum(c) > 50;
const leaves = collect(PLANT, isLeaf);
const POT_TOP = 159;
const stemX = 384;
const leftLeaf = leaves.filter(([x, y]) => x < stemX && y < POT_TOP);
const rightLeaf = leaves.filter(([x, y]) => x >= stemX && y < POT_TOP);

const drawPlant = (b, t) => {
  const liftL = Math.round(Math.sin((t / FRAMES) * Math.PI * 2 * 3) * 0.6);
  const liftR = Math.round(Math.sin((t / FRAMES) * Math.PI * 2 * 3 + 2) * 0.6);
  for (const [leaf, lift] of [
    [leftLeaf, liftL],
    [rightLeaf, liftR],
  ]) {
    if (lift === 0) continue;
    // Clear the leaf, then draw it moved
    for (const [x, y] of leaf) setPx(b, x, y, behind(x, y));
    for (const [x, y, c] of leaf) setPx(b, x, y + lift, c);
  }
};

// What is behind a leaf pixel: the nearest non-leaf pixel in the same column
const behind = (x, y) => {
  for (let d = 1; d < 6; d++) {
    for (const yy of [y - d, y + d]) {
      if (yy < PLANT.y0 || yy > PLANT.y1) continue;
      const c = rgb(plate, x, yy);
      if (!isLeaf(c)) return c;
    }
  }
  return rgb(plate, x, y);
};

// Render
// ---------------
console.log(
  `red ${red.length}, green ${green.length}, glow ${glow.length}, warm ${warm.length}, leaves ${leftLeaf.length}+${rightLeaf.length}`,
);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawLamp(f, t);
  drawGlow(f, t);
  drawPlant(f, t);
  return f;
});

// The room a fifth smaller than drawn, see shrink.mjs
// The small whiteboard's diagram, drawn again in the marker's grey
const { sx, sy } = shrunkGrid(scene.W, ROOM_FACTORS.floor);
const MARKER = rgb(base, 221, 105);
const DIAGRAM = [
  // A box with a line of text
  { rect: [221, 101, 230, 111] },
  { line: [223, 104, 227, 104] },
  // An open box, a dash over it and a tick in its corner
  { line: [235, 101, 239, 101] },
  { line: [233, 103, 233, 110, 242, 110, 242, 103] },
  { line: [240, 102, 240, 103, 239, 103] },
  // The arrow round to the right box, its head flat
  { line: [246, 105, 254, 105, 254, 110] },
  { line: [252, 110], at: [254, 111], marks: [-1, 0, 0, 0, 1, 0] },
  { line: [256, 110] },
  // The arrow up from the bottom row
  { line: [234, 120, 226, 120, 226, 115], head: [226, 114, 'up'] },
  // Two boxes of text
  { rect: [237, 115, 246, 123] },
  { at: [237, 115], marks: [2, 2, 4, 2, 5, 2, 2, 4, 3, 4, 4, 4, 5, 4] },
  { rect: [249, 114, 258, 123] },
  { at: [249, 114], marks: [2, 2, 3, 2, 5, 2, 6, 2, 2, 4, 3, 4, 4, 4] },
];

// The board's frame and the tray, lines that only run across or down,
// shrunk on the art's pixels (not round the build light, which stands
// in front of the tray)
const CRISP = [
  { x0: 214, y0: 94, x1: 267, y1: 99 },
  { x0: 214, y0: 94, x1: 219, y1: 125 },
  { x0: 261, y0: 94, x1: 267, y1: 132 },
  { x0: 231, y0: 125, x1: 267, y1: 132 },
];

const shrunk = await shrinkFrames(frames, scene.W, scene.H, {
  factor: ROOM_FACTORS.floor,
  crisp: CRISP,
  keep: [MARKER],
});
for (const f of shrunk)
  drawShapes(f, scene.W, DIAGRAM, { sx, sy, colour: () => MARKER });

await writeLoop({
  scene,
  frames: shrunk,
  delay: DELAY,
  outDir,
  shownWidth: SHOWN_WIDTH,
  oneX: true,
});
