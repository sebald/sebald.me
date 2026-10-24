// Header loop of "On Software That Looks Like Its Database" (the roastery
// pigeonhole wall). Steam rises from the mug, the burner under the roaster
// flickers, and a few dust motes drift down through the lamp's light cone.
// Coordinates are native pixels of that scene (grid 9, 5:2 crop, offset 2,
// 305x122).
//
//   node .claude/skills/pixel-header/examples/roastery.mjs \
//     content/notes/2026-10-25-software-that-looks-like-its-database/native.png \
//     content/notes/2026-10-25-software-that-looks-like-its-database

import {
  hash,
  loadScene,
  lum,
  mix,
  sat,
  scale,
  writeLoop,
} from '../scripts/loop.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125; // ms, 8 fps, 12s loop

const scene = await loadScene(src);
const { base, H, rgb, setPx } = scene;

const avgAround = (b, x, y) => {
  const acc = [0, 0, 0];
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const c = rgb(b, x + dx, y + dy);
    acc[0] += c[0];
    acc[1] += c[1];
    acc[2] += c[2];
  }
  return acc.map(v => Math.round(v / 4));
};

// Clean plate
// ---------------
const plate = Buffer.from(base);

// Static steam above the mug: light, desaturated pixels in front of the dark
// cubby and the shelf board. The column six pixels to the right shows the
// same rows without steam.
const STEAM = { x0: 194, x1: 200, y0: 76, y1: 90 };
const isSteam = c => lum(c) > 90 && sat(c) < 0.4;
for (let y = STEAM.y0; y <= STEAM.y1; y++)
  for (let x = STEAM.x0; x <= STEAM.x1; x++)
    if (isSteam(rgb(base, x, y))) setPx(plate, x, y, rgb(base, x + 6, y));

// Static dust motes in the light cone
for (const [x, y] of [
  [151, 37],
  [163, 39],
  [145, 45],
  [157, 75],
])
  setPx(plate, x, y, avgAround(base, x, y));

// Steam
// ---------------
// Warm tones, the mug sits in the lamplight
const STEAM_CORE = [224, 189, 153];
const STEAM_MID = [158, 139, 125];
const STEAM_FAINT = [111, 95, 89];
const RIM_Y = 90;
const WISPS = [
  { x: 197, len: 11, amp: 1.1, freq: 0.55, off: 0 },
  { x: 199, len: 8, amp: 0.9, freq: 0.45, off: 2.1 },
];
// 3s cycle, four times per loop
const STEAM_FRAMES = 24;

const drawSteam = (b, t) => {
  const phase = ((t % STEAM_FRAMES) / STEAM_FRAMES) * Math.PI * 2;
  for (const w of WISPS) {
    const len = Math.round(w.len + 2 * Math.sin(phase + w.off));
    for (let s = 1; s < len; s++) {
      const y = RIM_Y - s;
      const k = s / len;
      const x = Math.round(
        w.x + w.amp * k * 2 * Math.sin(s * w.freq - phase * 2 + w.off),
      );
      // Keep clear of the cubby divider
      if (x < STEAM.x0) continue;
      // Thin out towards the top with an ordered pattern, no alpha
      if (k > 0.55 && (s + t) % 2 === 0) continue;
      if (k > 0.8 && (s + t) % 3 !== 0) continue;
      setPx(b, x, y, k < 0.35 ? STEAM_CORE : k < 0.7 ? STEAM_MID : STEAM_FAINT);
    }
  }
};

// Burner
// ---------------
// The flames under the roaster, red to yellow. Each flame pixel steps up or
// down this ramp every other frame; the tips go out and the pixels above
// them catch now and then.
const FIRE = { x0: 255, x1: 266, y0: 112, y1: 116 };
const RAMP = [
  [220, 86, 56],
  [240, 107, 62],
  [253, 144, 78],
  [250, 182, 106],
];
const nearestRamp = c => {
  let best = 0;
  let bestD = Infinity;
  RAMP.forEach((r, i) => {
    const d = Math.hypot(r[0] - c[0], r[1] - c[1], r[2] - c[2]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
};
const isFlame = c => c[0] > 180 && c[0] > c[2] + 60;

const flame = [];
const tips = [];
for (let y = FIRE.y0; y <= FIRE.y1; y++)
  for (let x = FIRE.x0; x <= FIRE.x1; x++) {
    const c = rgb(base, x, y);
    if (isFlame(c)) flame.push({ x, y, i: nearestRamp(c) });
    // Dark pixels right above a flame can light up as a tip
    else if (y < FIRE.y1 && isFlame(rgb(base, x, y + 1)))
      tips.push({ x, y, bg: c });
  }
const topOf = new Map();
for (const p of flame) topOf.set(p.x, Math.min(topOf.get(p.x) ?? H, p.y));

// The glow on the grate under the flames breathes with them
const GRATE = { x0: 254, x1: 267, y0: 117, y1: 118 };
const grate = [];
for (let y = GRATE.y0; y <= GRATE.y1; y++)
  for (let x = GRATE.x0; x <= GRATE.x1; x++) {
    const c = rgb(base, x, y);
    if (lum(c) > 40) grate.push([x, y, c]);
  }

const drawFire = (b, t) => {
  const step = Math.floor(t / 2);
  let heat = 0;
  for (const p of flame) {
    const n = hash(p.x, p.y, step);
    const i = Math.max(0, Math.min(3, p.i + (n < 0.3 ? -1 : n > 0.75 ? 1 : 0)));
    heat += i - p.i;
    // A tip goes out now and then
    if (p.y === topOf.get(p.x) && hash(p.x, step, 7) < 0.12) {
      setPx(b, p.x, p.y, avgAround(plate, p.x, p.y - 1));
      continue;
    }
    setPx(b, p.x, p.y, RAMP[i]);
  }
  for (const p of tips)
    if (hash(p.x, step, 9) < 0.22) setPx(b, p.x, p.y, RAMP[0]);
  const f = 1 + (heat / flame.length) * 0.4;
  for (const [x, y, c] of grate) setPx(b, x, y, scale(c, f));
};

// Dust
// ---------------
// Single pale pixels sink slowly through the light cone, swaying a pixel to
// either side, and fade in and out through a dim tone. Each one falls eight
// pixels per loop.
const coneEdge = y => ({
  l: 140 - ((y - 10) * 50) / 75,
  r: 173 + ((y - 10) * 49) / 75,
});
const inCone = (x, y) => {
  if (y < 12 || y > 84) return false;
  const { l, r } = coneEdge(y);
  return x > l + 2 && x < r - 2;
};
const DUST_LIGHT = [250, 218, 168];
const MOTES = [
  { x: 150, y: 20 },
  { x: 162, y: 34 },
  { x: 140, y: 48 },
  { x: 176, y: 44 },
  { x: 156, y: 62 },
  { x: 190, y: 66 },
  { x: 128, y: 70 },
];
const MOTE_STEPS = 8;
const MOTE_STEP = FRAMES / MOTE_STEPS; // 1.5s per pixel

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
    if (!inCone(x, y)) return;
    const bg = rgb(b, x, y);
    setPx(b, x, y, mix(bg, DUST_LIGHT, dim ? 0.25 : 0.5));
  });
};

// Render
// ---------------
console.log(
  `flame ${flame.length}, tips ${tips.length}, grate ${grate.length}, motes ${MOTES.length}`,
);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawSteam(f, t);
  drawFire(f, t);
  drawDust(f, t);
  return f;
});

await writeLoop({ scene, frames, delay: DELAY, outDir });
