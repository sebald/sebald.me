// The meeting room (PM duels). Steam rises from the mug on the table, dust
// drifts in the projector beam over the dark wall above the whiteboard,
// and the projector's standby light blinks. Coordinates are native pixels
// of the padded 480x270 scene.
//
//   node .claude/skills/pixel-sprite/scenes/meeting.mjs \
//     src/assets/lab/pushback/scenes/meeting/native.png \
//     src/assets/lab/pushback/scenes/meeting

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  writeLoop,
} from '../../pixel-header/scripts/loop.mjs';

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

await writeLoop({
  scene,
  frames,
  delay: DELAY,
  outDir,
  shownWidth: SHOWN_WIDTH,
  oneX: true,
});
