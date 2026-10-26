// Header loop of "Failing Forward at Design Systems" (the explorer above a
// jungle river valley). The river glints as it flows towards the viewer,
// smoke rises from two of the huts, fireflies blink in the dark undergrowth,
// and a pair of yellow eyes watches from a hollow between the roots. Coordinates are native pixels of that scene (grid 10, 5:2
// crop, 325x130).
//
//   node .claude/skills/pixel-header/examples/jungle.mjs \
//     content/notes/2026-02-16-failing-forward-at-design-systems/native.png \
//     content/notes/2026-02-16-failing-forward-at-design-systems

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
const { base, rgb, setPx, collect } = scene;

const plate = Buffer.from(base);

// River
// ---------------
// The light water in the middle distance: pale, low saturation, a little
// blue. A sparse, mostly soft glint pattern drifts down the river one pixel
// every six frames, so the water seems to flow slowly towards the viewer.
// Starts below the mist at the foot of the mountain, which is just as pale
const RIVER = { x0: 175, y0: 64, x1: 250, y1: 100 };
const isWater = c => sat(c) < 0.25 && lum(c) > 110 && c[2] >= c[0];
const water = collect(RIVER, isWater);
const GLINT = [214, 234, 226];
// 16 steps per loop, the pattern wraps around after that
const FLOW_STEPS = 16;
const FLOW_STEP = FRAMES / FLOW_STEPS;

const drawRiver = (b, t) => {
  const s = Math.floor(t / FLOW_STEP);
  for (const [x, y, c] of water) {
    const row = (((y - s) % FLOW_STEPS) + FLOW_STEPS) % FLOW_STEPS;
    const n = hash(x, row, 3);
    if (n < 0.006) setPx(b, x, y, GLINT);
    else if (n < 0.022) setPx(b, x, y, mix(c, GLINT, 0.35));
  }
};

// Smoke
// ---------------
// Thin wisps from the roofs of the two huts at the river bend, leaning right
// with the wind. Pale and mixed into the background, thinning out with an
// ordered pattern towards the top.
const SMOKE = [222, 230, 218];
const CHIMNEYS = [
  { x: 239, y: 60, len: 10, off: 0 },
  { x: 257, y: 61, len: 12, off: 2.4 },
];
// 4s cycle, three times per loop
const SMOKE_FRAMES = 32;

const drawSmoke = (b, t) => {
  const phase = ((t % SMOKE_FRAMES) / SMOKE_FRAMES) * Math.PI * 2;
  for (const w of CHIMNEYS) {
    const len = Math.round(w.len + 2 * Math.sin(phase + w.off));
    for (let s = 1; s < len; s++) {
      const k = s / len;
      const y = w.y - s;
      const x = Math.round(
        w.x + k * 3 + 0.8 * Math.sin(s * 0.6 - phase * 2 + w.off),
      );
      if (k > 0.5 && (s + t) % 2 === 0) continue;
      if (k > 0.8 && (s + t) % 3 !== 0) continue;
      setPx(b, x, y, mix(rgb(b, x, y), SMOKE, k < 0.4 ? 0.6 : 0.38));
    }
  }
};

// Fireflies
// ---------------
// Single warm-green pixels in the dark undergrowth. Each one glows up through
// a dim tone, stays lit for a moment and fades again, on its own phase,
// drifting a pixel or two while it is lit.
const FIREFLY = [226, 240, 140];
const FLIES = [
  [18, 96],
  [52, 112],
  [98, 122],
  [176, 116],
  [214, 108],
  [292, 98],
  [312, 120],
].filter(([x, y]) => lum(rgb(base, x, y)) < 75);
const FLY_CYCLE = 32; // 4s

const drawFireflies = (b, t) => {
  FLIES.forEach(([fx, fy], n) => {
    const local = (t + Math.floor(hash(n, 41) * FLY_CYCLE)) % FLY_CYCLE;
    // Dark for most of the cycle
    if (local >= 12) return;
    const level = local < 2 || local >= 10 ? 0.35 : 0.85;
    const x = fx + Math.round(Math.sin((local / 12) * Math.PI) * 1.5);
    const y = fy - Math.floor(local / 6);
    setPx(b, x, y, mix(rgb(b, x, y), FIREFLY, level));
  });
};

// Eyes
// ---------------
// Something in the hollow between the roots on the right. The hollow is
// darkened in the plate (a soft oval), the eyes are two yellow slits that
// blink now and then, once twice in a row, and glance a pixel to the left,
// towards the explorer, for a while.
const HOLLOW = { cx: 306.5, cy: 90.5, rx: 6, ry: 3.5 };
for (let y = Math.floor(HOLLOW.cy - HOLLOW.ry); y <= HOLLOW.cy + HOLLOW.ry; y++)
  for (
    let x = Math.floor(HOLLOW.cx - HOLLOW.rx);
    x <= HOLLOW.cx + HOLLOW.rx;
    x++
  ) {
    const d = Math.hypot(
      (x - HOLLOW.cx) / HOLLOW.rx,
      (y - HOLLOW.cy) / HOLLOW.ry,
    );
    if (d > 1) continue;
    setPx(plate, x, y, scale(rgb(base, x, y), d < 0.6 ? 0.35 : 0.6));
  }

const EYE = [248, 212, 76];
// Two pixels wide each, one high
const EYES = [
  [304, 90],
  [305, 90],
  [308, 90],
  [309, 90],
];
const BLINKS = new Set([18, 50, 53, 82]);
const GLANCE = { from: 26, to: 44 };

const drawEyes = (b, t) => {
  if (BLINKS.has(t)) return;
  const dx = t >= GLANCE.from && t < GLANCE.to ? -1 : 0;
  for (const [x, y] of EYES) setPx(b, x + dx, y, EYE);
};

// Render
// ---------------
console.log(`water ${water.length}, flies ${FLIES.length}`);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawRiver(f, t);
  drawSmoke(f, t);
  drawFireflies(f, t);
  drawEyes(f, t);
  return f;
});

await writeLoop({ scene, frames, delay: DELAY, outDir });
