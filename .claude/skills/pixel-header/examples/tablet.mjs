// Header loop of "Where the Map Ends" (the explorer under a fallen stone
// tablet at a cliff edge). Wind runs through the scene from the left: pale
// streaks blow through the air in two gusts, the clouds around the mountain
// sway, and a few grains of sand blow along the path. Coordinates are native pixels of
// that scene (grid 10, 5:2 crop, 325x130).
//
//   node .claude/skills/pixel-header/examples/tablet.mjs \
//     content/notes/2026-05-17-where-the-map-ends/native.png \
//     content/notes/2026-05-17-where-the-map-ends

import { hash, loadScene, lum, mix, sat, writeLoop } from '../scripts/loop.mjs';

const [src, outDir] = process.argv.slice(2);

const FRAMES = 96;
const DELAY = 125; // ms, 8 fps, 12s loop

const scene = await loadScene(src);
const { base, W, rgb, setPx, collect } = scene;

const plate = Buffer.from(base);

// Wind
// ---------------
// Thin pale streaks in the open air over the valley, the way games draw
// wind. Each one grows from a point, travels right two pixels per frame,
// rises and dips a pixel along its length so it isn't a ruler line, and
// shrinks away again. Mixed into the background, softer at both ends; every
// other one has a shorter companion two pixels below.
const STREAK = [236, 242, 246];
const STREAKS = [
  { x: 212, y: 30, start: 4, pair: true },
  { x: 236, y: 56, start: 9 },
  { x: 222, y: 78, start: 30, pair: true },
  { x: 214, y: 44, start: 52 },
  { x: 248, y: 22, start: 57, pair: true },
];
const LIFE = 22; // frames, under 3s
const SPEED = 2; // pixels per frame
const MAX_LEN = 18;

const drawStreak = (b, x0, y0, head, len, phase) => {
  for (let p = 0; p < len; p++) {
    const x = head - p;
    if (x < 0 || x >= W) continue;
    // A slow wave along the streak that travels with it
    const y = y0 + Math.round(Math.sin((x - x0) / 6 + phase) * 0.9);
    const edge = p < 2 || p >= len - 2;
    setPx(b, x, y, mix(rgb(b, x, y), STREAK, edge ? 0.35 : 0.7));
  }
};

const drawWind = (b, t) => {
  for (const w of STREAKS) {
    const s = (((t - w.start) % FRAMES) + FRAMES) % FRAMES;
    if (s >= LIFE) continue;
    const len = Math.min(MAX_LEN, s * SPEED, (LIFE - s) * SPEED);
    const head = w.x + s * SPEED;
    drawStreak(b, w.x, w.y, head, len, w.start);
    // The companion trails a little behind and is half as long
    if (w.pair)
      drawStreak(b, w.x, w.y + 2, head - 5, Math.floor(len / 2), w.start + 1);
  }
};

// Clouds
// ---------------
// The cloud bands around the mountain, right of the bush. Rows are grouped
// into bands of three; each sways a pixel left and right once per loop on
// its own phase. Only cloud pixels move and only cloud is sampled, so the
// mountain's outline stays put.
const CLOUDS = { x0: 232, y0: 10, x1: W - 1, y1: 62 };
const isCloud = c =>
  sat(c) < 0.32 && lum(c) > 120 && lum(c) < 200 && c[2] > c[0] + 20;
const inCloud = (x, y) =>
  x >= CLOUDS.x0 &&
  x <= CLOUDS.x1 &&
  y >= CLOUDS.y0 &&
  y <= CLOUDS.y1 &&
  isCloud(rgb(base, x, y));

const drawClouds = (b, t) => {
  for (let y = CLOUDS.y0; y <= CLOUDS.y1; y++) {
    const band = Math.floor(y / 3);
    const off = Math.round(
      Math.sin((t / FRAMES) * Math.PI * 2 + hash(band, 21) * Math.PI * 2),
    );
    if (off === 0) continue;
    for (let x = CLOUDS.x0; x <= CLOUDS.x1; x++) {
      if (!inCloud(x, y)) continue;
      const sx = x - off;
      if (!inCloud(sx, y)) continue;
      setPx(b, x, y, rgb(plate, sx, y));
    }
  }
};

// Sand
// ---------------
// Single pale grains blowing right along the path, a pixel per frame, rising
// and falling a pixel on the way. Each one shows up during a gust and fades
// in and out through a dim tone.
const SAND = [240, 226, 190];
const GRAINS = [
  { x: 12, y: 112, start: 2 },
  { x: 60, y: 121, start: 10 },
  { x: 120, y: 108, start: 50 },
  { x: 150, y: 118, start: 58 },
];
const FLIGHT = 28; // frames, 3.5s

const drawSand = (b, t) => {
  for (const g of GRAINS) {
    const s = (((t - g.start) % FRAMES) + FRAMES) % FRAMES;
    if (s >= FLIGHT) continue;
    const x = g.x + s;
    const y = g.y - Math.round(Math.sin((s / FLIGHT) * Math.PI) * 2);
    const dim = s < 3 || s >= FLIGHT - 3;
    setPx(b, x, y, mix(rgb(b, x, y), SAND, dim ? 0.35 : 0.75));
  }
};

// Render
// ---------------
console.log(`streaks ${STREAKS.length}, grains ${GRAINS.length}`);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(plate);
  drawClouds(f, t);
  drawWind(f, t);
  drawSand(f, t);
  return f;
});

await writeLoop({ scene, frames, delay: DELAY, outDir });
