// Generates the page transition dissolve (see `src/css/transitions.css`):
// a square tile of cells in random order, each cell assigned to one frame.
// Every frame a cell leaves the old page, flashes through a band of colors
// and then shows the new page, so the pages swap cell by cell.
//
// Run with `node scripts/dissolve.mjs`. It writes to `public/transitions/`
// (`mask-<step>.png`: every cell that has left the old page by that step,
// `band-<step>.png`: the cells in the color band) and the keyframes to
// `src/css/dissolve.css`. PNG, not SVG: Safari rasterizes an SVG the first
// time it draws it, which stalls the first transition.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';

const CELLS = 32;
const FRAMES = 12;
const SEED = 7;

// From light to dark, one step each, the last one just above the page
// background (`mist-900`). Same values as the tokens in `theme.css`.
const BAND = [
  [0.6, 0.04, 250], // mist-400
  [0.38, 0.04, 264], // mist-600
  [0.25, 0.02, 266], // mist-800
];

// Seeded random numbers (mulberry32), so the masks are stable across runs
const rng = seed => {
  let t = seed >>> 0 || 1;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let n = Math.imul(t ^ (t >>> 15), 1 | t);
    n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n;
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
};

// OKLCH to 8-bit sRGB (via OKLab, https://bottosson.github.io/posts/oklab/)
const srgb = ([l, c, h]) => {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return linear.map(v => {
    const x = Math.min(1, Math.max(0, v));
    const gamma = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(gamma * 255);
  });
};

// An indexed PNG, SCALE pixels per cell, `colorOf(cell)` returns a palette
// index (0 is transparent, then up to three colors). Safari ignores
// `image-rendering` on view transition masks and backgrounds, so the images
// come close to the size they're drawn at instead of one pixel per cell.
// Every row of cells repeats SCALE times, which compresses to almost
// nothing.
const SCALE = 20;
const SIZE = CELLS * SCALE;
const png = (palette, colorOf) => {
  const chunk = (type, data) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length);
    head.write(type, 4, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
    return Buffer.concat([head, data, crc]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(SIZE, 0);
  header.writeUInt32BE(SIZE, 4);
  header.set([2, 3, 0, 0, 0], 8); // 2 bit, indexed, no interlace
  const stride = 1 + SIZE / 4;
  const rows = Buffer.alloc(SIZE * stride);
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) {
      const index = Math.floor(y / SCALE) * CELLS + Math.floor(x / SCALE);
      rows[y * stride + 1 + (x >> 2)] |= colorOf(index) << (6 - 2 * (x & 3));
    }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('PLTE', Buffer.from([0, 0, 0, ...palette.flat()])),
    chunk('tRNS', Buffer.from([0])), // the first color is transparent
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

// Shuffle the cells and spread them evenly over the frames (1 to FRAMES)
const next = rng(SEED);
const frameOf = Array.from({ length: CELLS * CELLS }, (_, index) => ({
  index,
  value: next(),
}))
  .sort((a, b) => a.value - b.value)
  .reduce((frames, { index }, rank) => {
    frames[index] = Math.floor((rank / (CELLS * CELLS)) * FRAMES) + 1;
    return frames;
  }, []);

// A cell leaves the old page at its frame, spends one step on each band
// color and shows the new page `BAND.length` steps later
const STEPS = FRAMES + BAND.length;
const colors = BAND.map(srgb);

rmSync('public/transitions', { recursive: true, force: true });
mkdirSync('public/transitions', { recursive: true });
for (let step = 1; step < FRAMES; step++)
  writeFileSync(
    `public/transitions/mask-${step}.png`,
    png([[255, 255, 255]], index => (frameOf[index] <= step ? 1 : 0)),
  );
for (let step = 1; step < STEPS; step++)
  writeFileSync(
    `public/transitions/band-${step}.png`,
    png(colors, index => {
      const age = step - frameOf[index];
      return age >= 0 && age < colors.length ? age + 1 : 0;
    }),
  );

// Masks: none at the start, a full gradient once every cell is in, files in
// between
const full = 'linear-gradient(#000 0 0)';
const mask = step =>
  step <= 0
    ? 'none'
    : step >= FRAMES
      ? full
      : `url('/transitions/mask-${step}.png')`;
const band = step =>
  step <= 0 || step >= STEPS ? 'none' : `url('/transitions/band-${step}.png')`;

const keyframes = (name, property, value) =>
  `@keyframes ${name} {\n${Array.from(
    { length: STEPS + 1 },
    (_, step) =>
      `  ${Math.round((step / STEPS) * 10000) / 100}% {\n    ${property}: ${value(step)};\n  }\n`,
  ).join('')}}\n`;

writeFileSync(
  'src/css/dissolve.css',
  [
    '/* Generated by `node scripts/dissolve.mjs`, do not edit */\n',
    // Old page: everything except the cells that have left it
    keyframes('dissolve-out', 'mask-image', step => `${mask(step)}, ${full}`),
    // Behind the old page: the cells in the color band
    keyframes('dissolve-band', 'background-image', band),
    // New page: the cells that have made it through the band
    keyframes('dissolve-in', 'mask-image', step => mask(step - BAND.length)),
  ].join('\n'),
);

// The files to preload, so the first transition doesn't wait for them
writeFileSync(
  'src/ui/page-transition.files.json',
  `${JSON.stringify(
    [
      ...Array.from(
        { length: FRAMES - 1 },
        (_, i) => `/transitions/mask-${i + 1}.png`,
      ),
      ...Array.from(
        { length: STEPS - 1 },
        (_, i) => `/transitions/band-${i + 1}.png`,
      ),
    ],
    null,
    2,
  )}\n`,
);
