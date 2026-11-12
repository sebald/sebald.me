// Take the in-between pixels off a cut sheet's edges: where a colour
// meets another, the render (and the cut's palette) leaves single pixels
// of a blend between them, a tan between cream and navy. Each pixel no
// thicker than one, lying between its two opposite neighbours in colour,
// becomes the nearer of them. Areas and drawn lines (two or more
// same-coloured neighbours) stay, so shading and bevels are kept.
//
//   node .claude/skills/pixel-sprite/scripts/seams.mjs <sheet.png> \
//     [--merge aaaaaa=bbbbbb,…] [--marked out.png]
//
// `--merge` folds near-duplicate colours together first. `--marked`
// writes a 6x copy with every changed pixel in magenta, to look at
// before committing. The sheet is rewritten in place, palette PNG.

import { parseArgs } from 'node:util';

import { sharp } from '../../pixel-header/scripts/sharp.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { merge: { type: 'string' }, marked: { type: 'string' } },
});
const [file] = positionals;
if (!file)
  throw new Error(
    'Usage: seams.mjs <sheet.png> [--merge a=b,…] [--marked out.png]',
  );

const { data, info } = await sharp(file)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

const hex = i =>
  [0, 1, 2].map(c => data[i + c].toString(16).padStart(2, '0')).join('');
const rgb = h => [0, 2, 4].map(o => parseInt(h.slice(o, o + 2), 16));
const paint = (buf, i, h) => rgb(h).forEach((v, c) => (buf[i + c] = v));
const dist = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));

const merge = Object.fromEntries(
  (values.merge ?? '')
    .split(',')
    .filter(Boolean)
    .map(pair => pair.split('=')),
);
for (let i = 0; i < data.length; i += 4)
  if (data[i + 3] && merge[hex(i)]) paint(data, i, merge[hex(i)]);

const out = Buffer.from(data);
const changed = new Uint8Array(W * H);
for (let y = 0; y < H; y++)
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (!data[i + 3]) continue;
    const own = hex(i);
    const at = (dx, dy) => {
      const [X, Y] = [x + dx, y + dy];
      if (X < 0 || Y < 0 || X >= W || Y >= H) return null;
      const j = (Y * W + X) * 4;
      return data[j + 3] ? hex(j) : null;
    };
    const same = [at(1, 0), at(-1, 0), at(0, 1), at(0, -1)].filter(
      c => c === own,
    ).length;
    if (same > 1) continue;
    let best = null;
    for (const [a, b] of [
      [at(1, 0), at(-1, 0)],
      [at(0, 1), at(0, -1)],
      [at(1, 1), at(-1, -1)],
      [at(1, -1), at(-1, 1)],
    ]) {
      if (!a || !b || a === own || b === own || a === b) continue;
      const [A, B, P] = [rgb(a), rgb(b), rgb(own)];
      const across = dist(A, B);
      // Too alike to have a blend between them, or not between them
      if (across < 60 || dist(A, P) + dist(P, B) > across * 1.12) continue;
      if (!best || across > best.across)
        best = { across, to: dist(A, P) <= dist(B, P) ? a : b };
    }
    if (best) {
      paint(out, i, best.to);
      changed[y * W + x] = 1;
    }
  }

const raw = { raw: { width: W, height: H, channels: 4 } };
await sharp(out, raw)
  .png({ compressionLevel: 9, palette: true, colours: 256, dither: 0 })
  .toFile(`${file}.tmp`);
const { rename } = await import('node:fs/promises');
await rename(`${file}.tmp`, file);
if (values.marked) {
  const marked = Buffer.from(data);
  changed.forEach((c, p) => c && paint(marked, p * 4, 'ff00ff'));
  await sharp(marked, raw)
    .resize(W * 6, H * 6, { kernel: 'nearest' })
    .flatten({ background: '#3a3f55' })
    .toFile(values.marked);
}
console.log(`${changed.reduce((a, b) => a + b, 0)} pixels off the seams`);
