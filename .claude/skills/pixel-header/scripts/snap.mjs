// Recover the native pixel grid of an AI-generated "pixel art" image.
//
//   node .claude/skills/pixel-header/scripts/snap.mjs <image> <out-dir>
//     [--grid N] [--colors N] [--aspect 5/2] [--offset N]
//
// Writes `<out-dir>/native.png` (1 cell = 1 pixel, indexed palette) and
// `<out-dir>/preview.png` (nearest-neighbour 2x of the source size).
// `--aspect` crops the native image to that ratio, centred; `--offset=N` moves
// the crop down (positive) or up (negative) by N native pixels.

import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

// sharp is not a direct dependency, it comes with Next
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    grid: { type: 'string' },
    colors: { type: 'string', default: '64' },
    aspect: { type: 'string' },
    offset: { type: 'string', default: '0' },
  },
});
const [src, outDir] = positionals;
if (!src || !outDir) {
  console.error(
    'Usage: snap.mjs <image> <out-dir> [--grid N] [--colors N] [--aspect 5/2] [--offset N]',
  );
  process.exit(1);
}

const { data, info } = await sharp(src)
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const grey = (x, y) => {
  const i = (y * w + x) * 3;
  return data[i] + data[i + 1] + data[i + 2];
};

// Grid size: autocorrelation of the column gradient profile. Cell edges
// repeat every N pixels, so the profile correlates with itself at lag N.
const profile = new Float64Array(w);
for (let y = 0; y < h; y++)
  for (let x = 1; x < w; x++)
    profile[x] += Math.abs(grey(x, y) - grey(x - 1, y));
const mean = profile.reduce((a, b) => a + b) / w;
const centered = profile.map(v => v - mean);
const scores = [];
for (let k = 2; k <= 12; k++) {
  let s = 0;
  for (let x = 0; x < w - k; x++) s += centered[x] * centered[x + k];
  scores.push([k, s]);
}
const max = Math.max(...scores.map(([, s]) => s));
console.log(
  'grid scores',
  scores.map(([k, s]) => `${k}:${(s / max).toFixed(2)}`).join(' '),
);

const K = values.grid
  ? Number(values.grid)
  : scores.find(([, s]) => s === max)[0];
// A real grid anti-correlates between its multiples, a painterly image
// correlates less and less with distance but never goes negative
const clearGrid = Math.min(...scores.map(([, s]) => s)) < 0;
console.log(`grid ${K}px${values.grid ? ' (given)' : ''}`);
if (!values.grid && !clearGrid)
  console.warn(
    'No clear grid. Check preview.png, try --grid, or regenerate with a stricter prompt.',
  );

// Grid phase: the offset where cell edges have the most gradient energy
const px = new Float64Array(K);
const py = new Float64Array(K);
for (let y = 1; y < h; y++)
  for (let x = 1; x < w; x++) {
    px[x % K] += Math.abs(grey(x, y) - grey(x - 1, y));
    py[y % K] += Math.abs(grey(x, y) - grey(x, y - 1));
  }
const ox = px.indexOf(Math.max(...px));
const oy = py.indexOf(Math.max(...py));

// One colour per cell: the most common colour (bucketed to 4 bits per
// channel), averaged within its bucket. Averaging the whole cell would smear
// one-pixel outlines.
const cw = Math.floor((w - ox) / K);
const ch = Math.floor((h - oy) / K);
const out = Buffer.alloc(cw * ch * 3);
for (let cy = 0; cy < ch; cy++)
  for (let cx = 0; cx < cw; cx++) {
    const buckets = new Map();
    for (let dy = 0; dy < K; dy++)
      for (let dx = 0; dx < K; dx++) {
        const i = ((oy + cy * K + dy) * w + ox + cx * K + dx) * 3;
        const key =
          ((data[i] >> 4) << 8) |
          ((data[i + 1] >> 4) << 4) |
          (data[i + 2] >> 4);
        const b = buckets.get(key) ?? [0, 0, 0, 0];
        b[0]++;
        b[1] += data[i];
        b[2] += data[i + 1];
        b[3] += data[i + 2];
        buckets.set(key, b);
      }
    let best = [0];
    for (const b of buckets.values()) if (b[0] > best[0]) best = b;
    const o = (cy * cw + cx) * 3;
    out[o] = best[1] / best[0];
    out[o + 1] = best[2] / best[0];
    out[o + 2] = best[3] / best[0];
  }

// Optional crop to the header's aspect ratio, on whole native pixels
let crop = { left: 0, top: 0, width: cw, height: ch };
if (values.aspect) {
  const [aw, ah] = values.aspect.split('/').map(Number);
  const height = Math.min(ch, Math.round((cw * ah) / aw));
  const width = Math.min(cw, Math.round((height * aw) / ah));
  const top = Math.max(
    0,
    Math.min(
      ch - height,
      Math.round((ch - height) / 2) + Number(values.offset),
    ),
  );
  crop = { left: Math.round((cw - width) / 2), top, width, height };
}

const colours = Number(values.colors);
const native = await sharp(out, { raw: { width: cw, height: ch, channels: 3 } })
  .extract(crop)
  .png({ palette: true, colours, dither: 0 })
  .toBuffer();

await mkdir(outDir, { recursive: true });
await sharp(native).toFile(`${outDir}/native.png`);
await sharp(native)
  .resize(crop.width * K * 2, crop.height * K * 2, { kernel: 'nearest' })
  .png({ palette: true, colours, dither: 0 })
  .toFile(`${outDir}/preview.png`);

console.log(
  `native ${crop.width}x${crop.height}, phase ${ox},${oy}, ${colours} colours -> ${outDir}`,
);
