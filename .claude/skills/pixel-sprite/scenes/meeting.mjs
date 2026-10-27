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

// The static steam above the mug: pale, desaturated pixels over the beige
// wall; the wall a few columns to the left shows the same rows without it
const STEAM = { x0: 37, x1: 56, y0: 172, y1: 218 };
const wallAt = y => rgb(base, 31, y);
const isSteam = (c, x, y) => {
  const wall = wallAt(y);
  return lum(c) > lum(wall) + 12 && sat(c) < 0.25;
};
for (const [x, y] of collect(STEAM, isSteam)) setPx(plate, x, y, wallAt(y));

// Steam
// ---------------
const RIM_Y = 218;
const STEAM_CORE = [236, 229, 218];
const STEAM_MID = [214, 203, 188];
const STEAM_FAINT = [190, 178, 162];
const WISPS = [
  { x: 46, len: 26, amp: 1.4, freq: 0.5, off: 0 },
  { x: 50, len: 18, amp: 1.0, freq: 0.6, off: 2.4 },
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
const BEAM_TOP = 45;
const BOARD_TOP = 59;
const apex = { x: 240, y: 42 };
const halfWidthAt = y => ((y - apex.y) / (148 - apex.y)) * 133;
const inBeam = (x, y) =>
  y >= BEAM_TOP &&
  Math.abs(x - apex.x) < halfWidthAt(y) - 2 &&
  // Only over the dark wall: above the board, or beside it below the beam's
  // reach on the board edges
  (y < BOARD_TOP || x < 113 || x > 368);
const DUST_LIGHT = [236, 224, 200];
const MOTES = [
  { x: 232, y: 46 },
  { x: 249, y: 48 },
  { x: 240, y: 51 },
  { x: 226, y: 49 },
  { x: 255, y: 52 },
  { x: 106, y: 88 },
  { x: 108, y: 120 },
  { x: 372, y: 95 },
  { x: 374, y: 126 },
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
    if (lum(bg) > 150) return; // never over the whiteboard itself
    setPx(b, x, y, mix(bg, DUST_LIGHT, dim ? 0.3 : 0.6));
  });
};

// Projector light
// ---------------
// The small red standby light on the projector body blinks every two
// seconds, like they do
const PROJECTOR = { x0: 215, x1: 265, y0: 22, y1: 45 };
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
