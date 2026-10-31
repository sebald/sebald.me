// Clear the background left between a figure's legs on a cut sheet.
//
//   node .claude/skills/pixel-sprite/scripts/holes.mjs <id> [<id> ...]
//     [--tolerance N] [--min N] [--feet N] [--sheets DIR]
//
// The key floods from the border, so a pocket of background the legs and
// the shadow under the feet close off stays in. This runs on the cut
// sheet (`sheets/<id>.png`, after `sheet.mjs` and the patches) and clears
// every group of pixels within `--tolerance` (12) of the sheet's
// background colour that has at least `--min` (10) pixels and runs from
// above the last `--feet` (12) rows of the cell down into them, to the
// shadow. The shadow is a darker colour of its own and stays; dark shoes
// in the background's colour lie inside the feet rows and stay too. Not
// for a figure whose clothes are drawn in the background's colours
// (Kim's trousers): check the console line, and the sprite, after each
// run.

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const ROOT = resolve(import.meta.dirname, '../../../..');

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    tolerance: { type: 'string', default: '12' },
    min: { type: 'string', default: '10' },
    feet: { type: 'string', default: '12' },
    sheets: {
      type: 'string',
      default: join(ROOT, 'src/assets/lab/pushback/sheets'),
    },
  },
});
if (positionals.length === 0) {
  console.error('Usage: holes.mjs <id> [<id> ...] [options]');
  process.exit(1);
}

const tolerance = Number(values.tolerance);
const min = Number(values.min);
const feet = Number(values.feet);

for (const id of positionals) {
  const png = join(values.sheets, `${id}.png`);
  const meta = JSON.parse(
    await readFile(join(values.sheets, `${id}.json`), 'utf8'),
  );
  const background = [0, 2, 4].map(i =>
    parseInt(meta.background.slice(i, i + 2), 16),
  );
  const { data, info } = await sharp(png)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  const near = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) {
    if (data[p * 4 + 3] === 0) continue;
    const d = Math.hypot(
      data[p * 4] - background[0],
      data[p * 4 + 1] - background[1],
      data[p * 4 + 2] - background[2],
    );
    if (d <= tolerance) near[p] = 1;
  }

  // The groups, 4-connected; a big one that reaches the feet is a pocket
  const seen = new Uint8Array(w * h);
  const cleared = [];
  for (let start = 0; start < w * h; start++) {
    if (!near[start] || seen[start]) continue;
    const stack = [start];
    const group = [];
    seen[start] = 1;
    let top = h;
    let bottom = 0;
    while (stack.length) {
      const p = stack.pop();
      group.push(p);
      const x = p % w;
      const y = (p - x) / w;
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      for (const q of [
        x > 0 ? p - 1 : -1,
        x < w - 1 ? p + 1 : -1,
        y > 0 ? p - w : -1,
        y < h - 1 ? p + w : -1,
      ])
        if (q >= 0 && near[q] && !seen[q]) {
          seen[q] = 1;
          stack.push(q);
        }
    }
    const band = meta.cell.height - feet;
    if (group.length < min || top >= band || bottom < band) continue;
    for (const p of group) data.fill(0, p * 4, p * 4 + 4);
    cleared.push(
      `cell ${Math.floor((group[0] % w) / meta.cell.width)}: ${group.length}`,
    );
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png({ palette: true })
    .toFile(png);
  console.log(
    `${id}: ${cleared.length ? cleared.join(', ') : 'nothing'} cleared`,
  );
}
