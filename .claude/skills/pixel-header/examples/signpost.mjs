// Loop of the 404 scene (a signpost with blank boards at a cliff edge above a
// sea of fog). The lantern flickers and its warm light on the post breathes
// with it, a few stars twinkle, and the fog bands sway a pixel to either side.
// Coordinates are native pixels of that scene (grid 7, 5:2 crop, offset -26,
// 392x157).
//
//   node .claude/skills/pixel-header/examples/signpost.mjs \
//     src/assets/not-found/native.png src/assets/not-found

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
const { base, W, rgb, setPx, collect } = scene;

const plate = Buffer.from(base);

// Lantern
// ---------------
// The flame inside the lantern glass, yellow to orange. Each flame pixel
// steps up or down the ramp every other frame.
const LANTERN = { x0: 212, y0: 62, x1: 232, y1: 86 };
const isFlame = c => c[0] > 190 && c[1] > 110 && c[0] > c[2] + 80;
const flame = collect(LANTERN, isFlame);

const ramp = [...new Set(flame.map(([, , c]) => c.join()))]
  .map(s => s.split(',').map(Number))
  .sort((a, b) => lum(a) - lum(b));
const nearest = c => {
  let best = 0;
  let bestD = Infinity;
  ramp.forEach((r, i) => {
    const d = Math.hypot(r[0] - c[0], r[1] - c[1], r[2] - c[2]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return best;
};
const flamePx = flame.map(([x, y, c]) => ({ x, y, i: nearest(c) }));

// Warm, lit pixels around the lantern (glass, the post, the boards, the grass
// under it). They brighten and dim a little with the flame.
const GLOW = { x0: 170, y0: 30, x1: 270, y1: 145 };
const glow = collect(
  GLOW,
  (c, x, y) =>
    !isFlame(c) &&
    c[0] > c[2] + 35 &&
    lum(c) > 70 &&
    Math.hypot(x - 222, y - 74) < 60 &&
    // The sunset sky right of the lantern is warm as well, but not lit
    !(x > 232 && y < 92),
);

const drawLantern = (b, t) => {
  const step = Math.floor(t / 2);
  let heat = 0;
  for (const p of flamePx) {
    const n = hash(p.x, p.y, step);
    const i = Math.max(
      0,
      Math.min(ramp.length - 1, p.i + (n < 0.3 ? -1 : n > 0.75 ? 1 : 0)),
    );
    heat += i - p.i;
    setPx(b, p.x, p.y, ramp[i]);
  }
  // Light falls off with distance, so the near pixels breathe more
  const k = flamePx.length ? heat / flamePx.length : 0;
  for (const [x, y, c] of glow) {
    const near = 1 - Math.hypot(x - 222, y - 74) / 60;
    setPx(b, x, y, scale(c, 1 + k * 0.12 * near));
  }
};

// Stars
// ---------------
// Single bright pixels in the upper sky. Each one dims now and then and
// brightens back, on its own rhythm.
const SKY = { x0: 1, y0: 1, x1: W - 2, y1: 26 };
const around = (b, x, y) => {
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
const isStar = c => lum(c) > 150 && sat(c) < 0.35;
const found = collect(SKY, isStar);

// Only two stars survive the crop. A few more in the same colour, spread
// over the dark upper sky (away from the pine and the dither bands).
const STAR = found[0][2];
for (const [x, y] of [
  [176, 4],
  [238, 9],
  [292, 3],
  [326, 11],
])
  setPx(plate, x, y, STAR);

const stars = [
  ...found.map(([x, y]) => [x, y]),
  [176, 4],
  [238, 9],
  [292, 3],
  [326, 11],
].map(([x, y]) => ({ x, y, c: STAR, bg: around(base, x, y) }));

const drawStars = (b, t) => {
  stars.forEach((s, n) => {
    // Four-frame steps; a star is dim in about a quarter of them
    const step = Math.floor(t / 4);
    const v = hash(n, step, 11);
    if (v < 0.18) setPx(b, s.x, s.y, mix(s.bg, s.c, 0.35));
    else if (v < 0.3) setPx(b, s.x, s.y, mix(s.bg, s.c, 0.7));
  });
};

// Fog
// ---------------
// The fog bands in the valley, left and right of the cliff. Rows are grouped
// into bands of three; each band sways one pixel left and right once per
// loop, with its own phase, so the layers slide against each other. Only fog
// pixels move and only fog is sampled: the post, branches, rocks and cliff
// stay put.
const FOG_ZONES = [
  { x0: 232, y0: 80, x1: W - 1, y1: 122 },
  { x0: 60, y0: 92, x1: 182, y1: 120 },
];
const isFog = c =>
  sat(c) < 0.32 && lum(c) > 80 && lum(c) < 185 && c[2] >= c[0] - 4;
const inFog = (x, y) =>
  FOG_ZONES.some(z => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1) &&
  isFog(rgb(base, x, y));

const drawFog = (b, t) => {
  for (const z of FOG_ZONES)
    for (let y = z.y0; y <= z.y1; y++) {
      const band = Math.floor(y / 3);
      const off = Math.round(
        Math.sin((t / FRAMES) * Math.PI * 2 + hash(band, 21) * Math.PI * 2),
      );
      if (off === 0) continue;
      for (let x = z.x0; x <= z.x1; x++) {
        if (!inFog(x, y)) continue;
        const sx = x - off;
        if (sx < z.x0 || sx > z.x1 || !inFog(sx, y)) continue;
        setPx(b, x, y, rgb(plate, sx, y));
      }
    }
};

// Render
// ---------------
console.log(
  `flame ${flamePx.length} (ramp ${ramp.length}), glow ${glow.length}, stars ${stars.length}`,
);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawFog(f, t);
  drawLantern(f, t);
  drawStars(f, t);
  return f;
});

// The 404 page shows the scene wider than a note header
await writeLoop({ scene, frames, delay: DELAY, outDir, shownWidth: 1120 });
