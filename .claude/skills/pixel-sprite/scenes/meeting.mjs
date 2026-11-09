// The meeting room (PM duels). Steam rises from the mug on the table, dust
// drifts in the projector beam over the dark wall above the whiteboard,
// and the projector's standby light blinks. Coordinates are native pixels
// of the padded 480x270 scene.
//
//   node .claude/skills/pixel-sprite/scenes/meeting.mjs \
//     packages/pushback/src/assets/scenes/meeting/native.png \
//     packages/pushback/src/assets/scenes/meeting

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  writeLoop,
} from '../../pixel-header/scripts/loop.mjs';
import { drawShapes, putRgb, shrunkGrid, takeOff } from '../scripts/redraw.mjs';
import { ROOM_FACTORS, shrinkFrames } from '../scripts/shrink.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125;
const SHOWN_WIDTH = 1920;

const scene = await loadScene(src);
const { base, rgb, setPx, collect } = scene;

// Clean plate
// ---------------
const plate = Buffer.from(base);

// The static steam above the mug: grey, desaturated pixels over the
// whiteboard; the board a few columns to the right shows the same rows
// without it (inside the beam too, so the tint matches)
const STEAM = { x0: 254, x1: 268, y0: 150, y1: 165 };
const wallAt = y => rgb(base, 274, y);
const isSteam = (c, x, y) => {
  const wall = wallAt(y);
  return lum(c) < lum(wall) - 10 && sat(c) < 0.25;
};
for (const [x, y] of collect(STEAM, isSteam)) setPx(plate, x, y, wallAt(y));

// The diagram on the whiteboard comes off the plate: shrunk with the
// room its one-pixel lines went pale and two wide (smoothly) or crooked
// (on the art's pixels), so it is drawn again after the shrink, on the
// shrunk room's pixels (see redraw.mjs). Each marker pixel takes the board
// beside it, inside the beam or out
const DIAGRAM = { x0: 193, y0: 96, x1: 272, y1: 152 };
// Marker, its pale edges too: bluer than the grey board, or redder than
// the beam's peach
const isInk = ([r, g, b]) => b - r > 18 || r - g > 40;
takeOff(scene, plate, DIAGRAM, isInk);

// The sticky notes come off too, for the same reason (`drawNotes`): the
// board around them is plain, out of the beam
const NOTES_AREA = { x0: 318, y0: 90, x1: 353, y1: 122 };
const boardAt = y => rgb(base, NOTES_AREA.x0 - 2, y);
for (let y = NOTES_AREA.y0; y < NOTES_AREA.y1; y++)
  for (let x = NOTES_AREA.x0; x < NOTES_AREA.x1; x++)
    setPx(plate, x, y, boardAt(y));

// Steam
// ---------------
// Over the white board the steam is the darker thing: grey wisps
const RIM_Y = 170;
const STEAM_CORE = [200, 196, 192];
const STEAM_MID = [212, 209, 205];
const STEAM_FAINT = [224, 222, 219];
const WISPS = [
  { x: 259, len: 16, amp: 1.2, freq: 0.5, off: 0 },
  { x: 263, len: 12, amp: 0.9, freq: 0.6, off: 2.4 },
];
const STEAM_FRAMES = 32; // 4s, three times per loop

const drawSteam = (b, t) => {
  const phase = ((t % STEAM_FRAMES) / STEAM_FRAMES) * Math.PI * 2;
  for (const w of WISPS) {
    const len = Math.round(w.len + 3 * Math.sin(phase + w.off));
    for (let s = 1; s < len; s++) {
      const y = RIM_Y - s;
      const k = s / len;
      const x = Math.round(
        w.x + w.amp * k * 2 * Math.sin(s * w.freq - phase * 2 + w.off),
      );
      if (x < STEAM.x0 || x > STEAM.x1 || y < STEAM.y0) continue;
      if (k > 0.5 && (s + t) % 2 === 0) continue;
      if (k > 0.8 && (s + t) % 3 !== 0) continue;
      setPx(b, x, y, k < 0.35 ? STEAM_CORE : k < 0.7 ? STEAM_MID : STEAM_FAINT);
    }
  }
};

// Dust in the beam
// ---------------
// Single pale pixels drifting down through the beam where it crosses the
// dark wall above the whiteboard and beside it. They sink a pixel every
// 1.5 s, sway, and fade through a dim tone at both ends.
// The beam leaves the lens at (185, 53) and falls to the right: its left
// edge reaches the board's foot at x 247, its right edge at x 343
const BEAM_TOP = 55;
const BOARD_TOP = 84;
const apex = { x: 185, y: 53 };
const leftEdgeAt = y => apex.x + (y - apex.y) * 0.544;
const rightEdgeAt = y => apex.x + (y - apex.y) * 1.274;
const inBeam = (x, y) =>
  y >= BEAM_TOP &&
  x > leftEdgeAt(y) + 1 &&
  x < rightEdgeAt(y) - 1 &&
  // Only over the wall above the board; the beam never leaves the board
  // sideways
  y < BOARD_TOP;
const DUST_LIGHT = [255, 250, 240];
const MOTES = [
  { x: 192, y: 60 },
  { x: 195, y: 64 },
  { x: 198, y: 66 },
  { x: 201, y: 69 },
  { x: 205, y: 72 },
  { x: 203, y: 75 },
  { x: 209, y: 76 },
];
const MOTE_STEPS = 8;
const MOTE_STEP = FRAMES / MOTE_STEPS;

const drawDust = (b, t) => {
  MOTES.forEach((m, n) => {
    const step =
      (Math.floor(t / MOTE_STEP) + Math.floor(hash(n, 31) * MOTE_STEPS)) %
      MOTE_STEPS;
    if (step === MOTE_STEPS - 1) return;
    const dim = step === 0 || step === MOTE_STEPS - 2;
    const sway = Math.round(
      Math.sin((t / (FRAMES / 2)) * Math.PI * 2 + hash(n, 32) * 6),
    );
    const x = m.x + sway;
    const y = m.y + step;
    if (!inBeam(x, y)) return;
    const bg = rgb(b, x, y);
    if (lum(bg) > 225) return; // never over the whiteboard itself
    setPx(b, x, y, mix(bg, DUST_LIGHT, dim ? 0.4 : 0.75));
  });
};

// Projector light
// ---------------
// The small red standby light on the projector body blinks every two
// seconds, like they do
const PROJECTOR = { x0: 150, x1: 190, y0: 30, y1: 56 };
const isRedLed = c => c[0] > 150 && c[0] > c[1] + 60 && c[2] < 150;
const led = collect(PROJECTOR, isRedLed);
const ledOff = led.map(([x, y, c]) => [x, y, mix(c, [90, 86, 84], 0.7)]);

const drawLed = (b, t) => {
  const on = t % 16 < 2;
  for (const [x, y, c] of on ? led : ledOff) setPx(b, x, y, c);
};

// The diagram, drawn again
// ---------------
// The same boxes and arrows, in the markers' colours, lighter in the beam
const { sx, sy } = shrunkGrid(scene.W, ROOM_FACTORS.meeting);

const INK = {
  red: { board: [183, 57, 53], beam: [188, 73, 67] },
  blue: { board: [59, 76, 163], beam: [86, 104, 165] },
};
// In the beam where the shrunk board under the pixel is warmer than grey
const markerColour = (f, i, ink) =>
  INK[ink][f[i] > f[i + 2] + 6 ? 'beam' : 'board'];

const SHAPES = [
  // The two red boxes, the upper one a folder with a tab
  { ink: 'red', line: [221, 99, 232, 99] },
  { ink: 'red', line: [232, 98, 240, 98] },
  { ink: 'red', line: [221, 99, 221, 107, 240, 107, 240, 98] },
  { ink: 'red', rect: [221, 118, 240, 127] },
  // The blue boxes: left, right, bottom left (with text), bottom middle
  { ink: 'blue', rect: [195, 118, 209, 127] },
  { ink: 'blue', rect: [253, 117, 268, 126] },
  { ink: 'blue', rect: [196, 138, 210, 147] },
  { ink: 'blue', rect: [224, 139, 239, 148] },
  // The text in the bottom left box, in shrunk pixels from its corner
  {
    ink: 'blue',
    at: [196, 138],
    marks: [2, 2, 3, 2, 4, 2, 6, 2, 7, 2, 2, 4, 3, 4, 4, 4, 5, 4, 6, 4, 7, 4],
  },
  // The speech bubble, its corners round, two dashes of text
  { ink: 'blue', line: [254, 134, 267, 134] },
  { ink: 'blue', line: [254, 142, 267, 142] },
  { ink: 'blue', line: [253, 135, 253, 141] },
  { ink: 'blue', line: [268, 135, 268, 141] },
  {
    ink: 'blue',
    at: [253, 134],
    marks: [2, 2, 3, 2, 4, 2, 7, 2, 8, 2, 9, 2, 3, 4, 4, 4, 5, 4, 6, 4, 7, 4],
  },
  // Arrows: shaft, then head
  { ink: 'red', line: [211, 122, 218, 122], head: [219, 122, 'right'] },
  { ink: 'red', line: [243, 122, 250, 122], head: [251, 122, 'right'] },
  { ink: 'blue', line: [231, 109, 231, 115], head: [231, 116, 'down'] },
  { ink: 'blue', line: [231, 130, 231, 138], head: [231, 129, 'up'] },
  { ink: 'blue', line: [203, 130, 203, 137], head: [203, 129, 'up'] },
  { ink: 'blue', line: [213, 143, 222, 143], head: [212, 143, 'left'] },
  { ink: 'blue', line: [260, 128, 260, 132], head: [260, 133, 'down'] },
  { ink: 'blue', line: [253, 137, 244, 129], head: [243, 128, 'upLeft'] },
  {
    ink: 'red',
    line: [203, 116, 204, 112, 207, 108, 211, 105, 218, 104],
    head: [219, 104, 'right'],
  },
  {
    ink: 'blue',
    line: [243, 103, 248, 104, 253, 106, 256, 109, 258, 113],
    head: [259, 114, 'down'],
  },
];

// The sticky notes, drawn again: each at its place in the render, five
// by four on the shrunk grid with its shadow under it and its scribble,
// in the colours they were drawn in. Listed back to front (the orange
// one sits on the green one)
const NOTE_SHADOW = rgb(base, 324, 98);
const NOTES = [
  { at: [321, 93], body: [321 + 3, 93 + 4], marks: 'lines' },
  { at: [330, 93], body: [330 + 5, 93 + 5], marks: 'dash' },
  { at: [344, 92], body: [344 + 1, 92 + 1], marks: 'lines' },
  { at: [339, 96], body: [339 + 1, 96 + 4], marks: 'lines' },
  { at: [325, 101], body: [325 + 1, 101 + 1], marks: 'face' },
  { at: [334, 103], body: [334 + 1, 103 + 1], marks: 'face' },
  { at: [343, 104], body: [343 + 5, 104 + 4], marks: 'dash' },
  { at: [329, 109], body: [329 + 5, 109 + 4], marks: 'dash' },
  { at: [342, 113], body: [342 + 1, 113 + 1], marks: 'face' },
];
// The scribbles, as pixels from the note's top left
const MARKS = {
  lines: [
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
    [2, 2],
  ],
  dash: [
    [1, 1],
    [2, 1],
    [3, 1],
    [1, 2],
  ],
  face: [
    [1, 1],
    [3, 1],
    [1, 2],
    [3, 2],
  ],
};

const drawNotes = f => {
  for (const note of NOTES) {
    const colour = rgb(base, ...note.body);
    // The scribble: the note's colour much darker
    const ink = colour.map(v => Math.round(v * 0.4));
    const X = sx(note.at[0]);
    const Y = sy(note.at[1]);
    for (let x = 0; x < 5; x++)
      putRgb(f, scene.W, X + x - 1, Y + 4, NOTE_SHADOW);
    for (let y = 1; y < 4; y++) putRgb(f, scene.W, X - 1, Y + y, NOTE_SHADOW);
    for (let y = 0; y < 4; y++)
      for (let x = 0; x < 5; x++) putRgb(f, scene.W, X + x, Y + y, colour);
    for (const [x, y] of MARKS[note.marks])
      putRgb(f, scene.W, X + x, Y + y, ink);
  }
};

// Render
// ---------------
console.log(`led ${led.length}, motes ${MOTES.length}`);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawSteam(f, t);
  drawDust(f, t);
  drawLed(f, t);
  return f;
});

// The room a fifth smaller than drawn, see shrink.mjs; the whiteboard's
// straight lines shrunk on the art's pixels so they stay sharp: the
// frame (the tray left and right of the mug, where the steam rises). The
// diagram and the sticky notes are drawn again instead
const CRISP = [
  { x0: 109, y0: 84, x1: 361, y1: 91 },
  { x0: 109, y0: 84, x1: 116, y1: 173 },
  { x0: 354, y0: 84, x1: 361, y1: 173 },
  { x0: 109, y0: 164, x1: 250, y1: 173 },
  { x0: 272, y0: 164, x1: 361, y1: 173 },
];

const shrunk = await shrinkFrames(frames, scene.W, scene.H, {
  factor: ROOM_FACTORS.meeting,
  crisp: CRISP,
  // What is drawn after the shrink, so the palette has room for it
  keep: [
    ...Object.values(INK).flatMap(({ board, beam }) => [board, beam]),
    NOTE_SHADOW,
    ...NOTES.flatMap(note => {
      const colour = rgb(base, ...note.body);
      return [colour, colour.map(v => Math.round(v * 0.4))];
    }),
  ],
});
for (const f of shrunk) {
  drawShapes(f, scene.W, SHAPES, { sx, sy, colour: markerColour });
  drawNotes(f);
}

await writeLoop({
  scene,
  frames: shrunk,
  delay: DELAY,
  outDir,
  shownWidth: SHOWN_WIDTH,
  oneX: true,
});
