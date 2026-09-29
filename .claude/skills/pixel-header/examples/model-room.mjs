// Worked example: the header loop of "Modernize the Product, Not the UI" (the
// model room). The hologram model floats up and down with its loose bits
// trailing and drifting up, steam rises from the mug, the lanterns on the old
// bridge glow and flicker, and one light on the left wall panel switches on
// and off. Everything else stays still. Coordinates are native pixels of that
// scene (grid 6, 5:2 crop, 458x183); copy this file and replace the regions
// for a new image.
//
//   node .claude/skills/pixel-header/examples/model-room.mjs \
//     content/notes/2026-09-23-modernize-the-product-not-the-ui/native.png \
//     content/notes/2026-09-23-modernize-the-product-not-the-ui

import {
  hash,
  hex,
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
const { base, W, H, rgb, setPx, newLayer, setLayerPx, collect, surround } =
  scene;

// Clean plate
// ---------------
const plate = Buffer.from(base);

// Static steam above the mug: light, desaturated pixels against the darker
// glass. Replace each with the nearest non-steam pixel to its left.
const STEAM = { x0: 246, x1: 264, y0: 108, y1: 127 };
const isSteam = (x, y) => {
  const c = rgb(base, x, y);
  return lum(c) > 120 && sat(c) < 0.35;
};
for (let y = STEAM.y0; y <= STEAM.y1; y++)
  for (let x = STEAM.x0; x <= STEAM.x1; x++) {
    if (!isSteam(x, y)) continue;
    let sx = x - 1;
    while (sx > STEAM.x0 - 10 && isSteam(sx, y)) sx--;
    setPx(plate, x, y, rgb(base, sx, y));
  }

// Floating hologram
// ---------------
// The whole model (cells, the teal grid lines between them, both feet and the
// glow under it) moves as one rigid layer, so nothing tears apart. It glides
// in export pixels, a third of an art pixel. The loose bits trail the body and
// the ones above it drift upwards.

const key = (x, y) => y * W + x;

// The left foot stands in front of the lit pedestal. There, everything that is
// not one of the pedestal's own colours belongs to the foot.
const PEDESTAL = { x0: 139, x1: 184, y0: 100 };
const FOOT = { x0: 150, x1: 171, y0: 100, y1: 117 };
const PEDESTAL_COLORS = new Set([
  '9ed1d2',
  'a1d2d3',
  '9cd4d5',
  '9ccdd0',
  '9bd7d7',
]);
const inBox = (b, x, y) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1;

const inHoloZone = (x, y) => {
  if (x >= PEDESTAL.x0 && x <= PEDESTAL.x1 && y >= PEDESTAL.y0)
    return inBox(FOOT, x, y) && !PEDESTAL_COLORS.has(hex(rgb(base, x, y)));
  return x >= 72 && x <= 288 && y >= 56 && y <= 104;
};
// Bright cells seed the layer, it then grows into the dimmer teal pixels
// (grid lines, shaded cells) connected to them
const isCell = c => lum(c) > 150 && c[2] > c[0] + 20;
const isTint = c => c[1] >= 140 && c[2] >= 145 && c[1] - c[0] >= 60;

const layer = new Set();
const queue = [];
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++)
    if (inHoloZone(x, y) && isCell(rgb(base, x, y))) {
      layer.add(key(x, y));
      queue.push([x, y]);
    }
for (let i = 0; i < queue.length; i++) {
  const [x, y] = queue[i];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (layer.has(key(nx, ny)) || !inHoloZone(nx, ny)) continue;
      const c = rgb(base, nx, ny);
      if (!isCell(c) && !isTint(c)) continue;
      layer.add(key(nx, ny));
      queue.push([nx, ny]);
    }
}
// Close one- and two-pixel gaps down each column, so the lattice moves as a
// solid piece instead of sliding over its own frame
for (let x = 0; x < W; x++) {
  let last = -1;
  for (let y = 0; y < H; y++) {
    if (!layer.has(key(x, y))) continue;
    if (last >= 0 && y - last > 1 && y - last <= 3)
      for (let g = last + 1; g < y; g++)
        if (inHoloZone(x, g)) layer.add(key(x, g));
    last = y;
  }
}

// The model lights the wall right under it; that glow moves with it, or it
// would hang from the deck like icicles at the top of the bob
const isGlow = c => c[1] >= 115 && c[1] - c[0] >= 60;
for (let x = 0; x < W; x++)
  for (let y = H - 2; y >= 0; y--) {
    if (!layer.has(key(x, y)) || layer.has(key(x, y + 1))) continue;
    for (let d = 1; d <= 6; d++) {
      if (!inHoloZone(x, y + d) || !isGlow(rgb(base, x, y + d))) break;
      layer.add(key(x, y + d));
    }
  }

// Split the layer into the body and the loose bits (small 8-connected groups)
const pieces = [];
const left = new Set(layer);
for (const k of layer) {
  if (!left.has(k)) continue;
  left.delete(k);
  const group = [k];
  for (let i = 0; i < group.length; i++) {
    const x = group[i] % W;
    const y = Math.floor(group[i] / W);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const n = key(x + dx, y + dy);
        if (left.delete(n)) group.push(n);
      }
  }
  pieces.push(
    group.map(k => [
      k % W,
      Math.floor(k / W),
      rgb(base, k % W, Math.floor(k / W)),
    ]),
  );
}
const holoBody = pieces.filter(p => p.length > 12).flat();
const bodyTop = new Map();
for (const [x, y] of holoBody) bodyTop.set(x, Math.min(bodyTop.get(x) ?? H, y));

// Bits well above the model rise, the others only trail it
const holoBits = pieces
  .filter(p => p.length <= 12)
  .map(px => ({
    px,
    free: px.every(([x, y]) => y < (bodyTop.get(x) ?? H) - 3),
  }));

// What is behind a layer pixel: the nearest pixel outside the layer in the
// same column. Only the rim is ever uncovered, so this is always a neighbour.
const behind = (x, y) => {
  for (let d = 1; d < 30; d++) {
    if (y + d < H && !layer.has(key(x, y + d))) return rgb(plate, x, y + d);
    if (y - d >= 0 && !layer.has(key(x, y - d))) return rgb(plate, x, y - d);
  }
  return rgb(plate, x, y);
};
const floatPlate = Buffer.from(plate);
for (const k of layer) {
  const x = k % W;
  const y = Math.floor(k / W);
  setPx(floatPlate, x, y, behind(x, y));
}

// Bob over four export pixels, a bit more than one art pixel. Half linear,
// half cosine: every step lasts three to five frames, so it keeps gliding and
// only slows a little where it turns.
const BOB = 4;
const BOB_PERIOD = FRAMES / 3; // 4s
const bobAt = t => {
  const phase = (((t % BOB_PERIOD) + BOB_PERIOD) % BOB_PERIOD) / BOB_PERIOD;
  const line = phase < 0.5 ? phase * 2 : 2 - phase * 2;
  const ease = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  return Math.round((BOB * (line + ease)) / 2);
};
// The bits follow the body two frames late
const BIT_LAG = 2;
// Free bits rise one art pixel per step and fade in and out through one dim
// tone
const BIT_STEPS = 8;
const BIT_STEP = FRAMES / 16; // 0.75s per pixel, 6s per cycle
const BIT_DIM = [77, 164, 173];

// The moving parts are drawn on transparent layers at native size and laid
// over the scaled frame at their offset in export pixels
const bodyLayer = newLayer();
for (const [x, y, c] of holoBody) setLayerPx(bodyLayer, x, y, c);

const drawBits = t => {
  const b = newLayer();
  holoBits.forEach(({ px, free }, n) => {
    let rise = 0;
    let dim = false;
    if (free) {
      const step =
        (Math.floor(t / BIT_STEP) + Math.floor(hash(n, 21) * BIT_STEPS)) %
        BIT_STEPS;
      // Hidden for the last step, dim on the first and the one before last
      if (step === BIT_STEPS - 1) return;
      dim = step === 0 || step === BIT_STEPS - 2;
      rise = step;
    }
    for (const [x, y, c] of px) {
      // Dim bits keep only their bright pixels, in one tone
      if (dim && !isCell(c)) continue;
      const ny = y - rise;
      if (ny >= 0) setLayerPx(b, x, ny, dim ? BIT_DIM : c);
    }
  });
  return b;
};

// Steam
// ---------------
const STEAM_CORE = [206, 222, 224];
const STEAM_MID = [158, 178, 184];
const STEAM_FAINT = [112, 130, 140];
const RIM_Y = 127;
const WISPS = [
  { x: 253, len: 13, amp: 1.2, freq: 0.5, off: 0 },
  { x: 258, len: 16, amp: 1.4, freq: 0.42, off: 2.4 },
];

// The steam keeps its own 3s cycle, repeated four times per loop
const STEAM_FRAMES = 24;

const drawSteam = (b, t) => {
  const phase = ((t % STEAM_FRAMES) / STEAM_FRAMES) * Math.PI * 2;
  for (const w of WISPS) {
    const len = Math.round(w.len + 2 * Math.sin(phase + w.off));
    for (let s = 2; s < len; s++) {
      const y = RIM_Y - s;
      const k = s / len;
      const x = Math.round(
        w.x + w.amp * k * 2 * Math.sin(s * w.freq - phase * 2 + w.off),
      );
      // Thin out towards the top with an ordered pattern, no alpha
      if (k > 0.55 && (s + t) % 2 === 0) continue;
      if (k > 0.8 && (s + t) % 3 !== 0) continue;
      setPx(b, x, y, k < 0.35 ? STEAM_CORE : k < 0.7 ? STEAM_MID : STEAM_FAINT);
    }
  }
};

// Lanterns
// ---------------
// Each lantern on the old bridge is a bright yellow core in a dark frame,
// surrounded by a ring of warm glow against the blue sky
const LANTERNS = { x0: 288, y0: 50, x1: W - 1, y1: 86 };
const isCore = c => c[0] > 190 && c[1] > 150 && c[2] < 130;
const isSky = c => c[2] > c[0] + 20;

// Group core pixels that lie close together, one group per lantern
const cores = [];
for (const p of collect(LANTERNS, isCore)) {
  const near = cores.find(g =>
    g.some(q => Math.abs(q[0] - p[0]) <= 3 && Math.abs(q[1] - p[1]) <= 3),
  );
  if (near) near.push(p);
  else cores.push([p]);
}

const lanterns = cores.map(core => {
  const cx = core.reduce((a, p) => a + p[0], 0) / core.length;
  const cy = core.reduce((a, p) => a + p[1], 0) / core.length;
  const r = 6;
  const glow = [];
  const sky = [0, 0, 0];
  let skyN = 0;
  for (let y = Math.round(cy - r - 2); y <= Math.round(cy + r + 2); y++)
    for (let x = Math.round(cx - r - 2); x <= Math.round(cx + r + 2); x++) {
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const c = rgb(base, x, y);
      const d = Math.hypot(x - cx, y - cy);
      if (d > r) {
        if (isSky(c)) {
          sky[0] += c[0];
          sky[1] += c[1];
          sky[2] += c[2];
          skyN++;
        }
        continue;
      }
      // Warm, lit pixels around the core; the dark frame and post stay
      if (!isCore(c) && c[0] > c[2] + 5 && lum(c) > 70 && y <= cy + 5)
        glow.push([x, y, c]);
    }
  return {
    core,
    glow,
    sky: skyN ? sky.map(v => v / skyN) : [33, 57, 103],
  };
});

const EMBER = [232, 138, 52];

const drawLanterns = (b, t) => {
  lanterns.forEach((l, n) => {
    // A slow breath per lantern, plus a short dip now and then
    const period = [24, 32, 48][Math.floor(hash(n, 11) * 3)];
    const phase = hash(n, 12) * Math.PI * 2;
    let f = 0.85 + 0.25 * Math.sin((t / period) * Math.PI * 2 + phase);
    if (hash(n, Math.floor(t / 2), 13) < 0.12) f -= 0.2;

    for (const [x, y, c] of l.glow)
      setPx(b, x, y, f < 1 ? mix(l.sky, c, Math.max(0, f)) : scale(c, f));
    for (const [x, y, c] of l.core)
      setPx(b, x, y, f < 1 ? mix(c, EMBER, Math.min(1, (1 - f) * 1.5)) : c);
  });
};

// Wall panel light
// ---------------
// The middle green light in the top row of the left wall panel
const isLed = c => sat(c) > 0.55 && lum(c) > 90;
const led = collect({ x0: 9, y0: 84, x1: 14, y1: 89 }, isLed);
const ledOff = surround(led, isLed);

const drawLed = (b, t) => {
  // On for 4.5s, off for 1.5s, twice per loop
  if (t % 48 < 36) return;
  for (const [x, y] of led) setPx(b, x, y, ledOff);
};

// Render
// ---------------
console.log(
  `holo body ${holoBody.length}, bits ${holoBits.length} (${holoBits.filter(b => b.free).length} free), lanterns ${lanterns.length}, led pixels ${led.length}`,
);

const frames = Array.from({ length: FRAMES }, (_, t) => {
  const f = Buffer.from(floatPlate);
  drawSteam(f, t);
  drawLanterns(f, t);
  drawLed(f, t);
  return f;
});

await writeLoop({
  scene,
  frames,
  delay: DELAY,
  outDir,
  layersAt: t => [
    { layer: bodyLayer, lift: bobAt(t) },
    { layer: drawBits(t), lift: bobAt(t - BIT_LAG) },
  ],
});
