// Cut a Gemini model sheet (or item sheet) into a row of cells.
//
//   node .claude/skills/pixel-sprite/scripts/sheet.mjs <render> <id>
//     [--cells N] [--cell 72x112] [--anchor bottom|centre] [--grid N]
//     [--tolerance N] [--soft N] [--soft-from F] [--colours N] [--scale F]
//     [--split X[,X]]
//     [--specks N]
//     [--contact DIR] [--out DIR]
//
// Snaps the render to its pixel grid with the pixel-header `snap.mjs`,
// keys the flat background by flooding from the border, finds the figures
// by the gaps between them, stands each one on the bottom row of a cell
// (centred for items) and writes `<out>/<id>.png` (RGBA, the cells in a
// row, a 32-colour palette) plus `<out>/<id>.json` (the cells' boxes) and
// a 4x contact print to `<contact>/<id>.png` for review. `--cells` fails
// the run when the count is off, which is the first thing to check.

import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import {
  borderColour,
  cutCells,
  findFigures,
  keyBackground,
  quantise,
} from './cells.mjs';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const ROOT = resolve(import.meta.dirname, '../../../..');
const SNAP = resolve(
  import.meta.dirname,
  '../../pixel-header/scripts/snap.mjs',
);

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    cells: { type: 'string' },
    cell: { type: 'string', default: '72x112' },
    anchor: { type: 'string', default: 'bottom' },
    grid: { type: 'string' },
    tolerance: { type: 'string', default: '10' },
    soft: { type: 'string', default: '12' },
    'soft-from': { type: 'string', default: '0.9' },
    colours: { type: 'string', default: '32' },
    scale: { type: 'string', default: '1' },
    specks: { type: 'string', default: '6' },
    // Native columns cut to background before the figures are found: for
    // two figures Gemini drew touching, which would otherwise merge
    split: { type: 'string' },
    contact: {
      type: 'string',
      default: join(ROOT, 'src/assets/lab/pushback/sources/contact'),
    },
    out: {
      type: 'string',
      default: join(ROOT, 'src/assets/lab/pushback/sheets'),
    },
  },
});
const [src, id] = positionals;
if (!src || !id) {
  console.error('Usage: sheet.mjs <render> <id> [options]');
  process.exit(1);
}
const [cellW, cellH] = values.cell.split('x').map(Number);
const cell = { width: cellW, height: cellH };

// Snap
const tmp = await mkdtemp(join(tmpdir(), 'pushback-sheet-'));
const snap = spawnSync(
  process.execPath,
  [SNAP, src, tmp, ...(values.grid ? ['--grid', values.grid] : [])],
  { stdio: 'inherit' },
);
if (snap.status !== 0) process.exit(snap.status ?? 1);
// `--scale` shrinks the snapped sheet with hard edges (rows and columns
// dropped): only for a soft figure like the ghost, which Gemini draws too
// big however it is asked; a person's face and outline would smear
const native = sharp(join(tmp, 'native.png')).removeAlpha();
const meta = await native.metadata();
const factor = Number(values.scale);
const { data, info } = await (
  factor === 1
    ? native
    : native.resize(
        Math.round(meta.width * factor),
        Math.round(meta.height * factor),
        { kernel: 'nearest' },
      )
)
  .raw()
  .toBuffer({ resolveWithObject: true });
await rm(tmp, { recursive: true, force: true });
const { width: w, height: h } = info;

// Key and cut
const background = borderColour(data, w, h);
const mask = keyBackground(data, w, h, background, {
  tolerance: Number(values.tolerance),
  soft: Number(values.soft),
  softFrom: Number(values['soft-from']),
});
for (const column of values.split ? values.split.split(',').map(Number) : []) {
  for (let y = 0; y < h; y++) mask[y * w + column] = 1;
}
const { labels, figures } = findFigures(mask, w, h, {
  count: values.cells ? Number(values.cells) : undefined,
  specks: Number(values.specks),
});
// The keyed render at 4x, background in magenta, for a look at what the
// key took and what it left
await mkdir(values.contact, { recursive: true });
const keyed = Buffer.alloc(w * h * 3);
for (let p = 0; p < w * h; p++) {
  const i = p * 3;
  if (mask[p]) {
    keyed[i] = 255;
    keyed[i + 1] = 0;
    keyed[i + 2] = 255;
  } else {
    keyed[i] = data[i];
    keyed[i + 1] = data[i + 1];
    keyed[i + 2] = data[i + 2];
  }
}
await sharp(keyed, { raw: { width: w, height: h, channels: 3 } })
  .resize(w * 4, h * 4, { kernel: 'nearest' })
  .png()
  .toFile(join(values.contact, `${id}-keyed.png`));
if (values.cells && figures.length !== Number(values.cells)) {
  console.error(
    `Expected ${values.cells} figures, found ${figures.length}: ${figures
      .map(f => `${f.x0}-${f.x1}`)
      .join(' ')}. Two figures touch; try --tolerance, or reroll.`,
  );
  process.exit(1);
}
const sheet = cutCells(data, labels, w, figures, cell, {
  anchor: values.anchor,
});

// Patches: rectangles painted over a cell after the cut (`patches.json`
// next to the skill, by sheet id), for a brand mark or a stray pixel that
// a reroll is not worth. Only opaque pixels are painted, so a fill never
// grows a figure; the colour `none` clears them instead, for a stray
// stroke next to a figure.
const patches = JSON.parse(
  await readFile(resolve(import.meta.dirname, '../patches.json'), 'utf8'),
)[id];
for (const patch of patches ?? []) {
  for (const fill of patch.fills) {
    const clear = fill.colour === 'none';
    const [r, g, b] = clear
      ? [0, 0, 0]
      : [0, 2, 4].map(k => parseInt(fill.colour.slice(k, k + 2), 16));
    for (let y = fill.y; y < fill.y + fill.h; y++)
      for (let x = fill.x; x < fill.x + fill.w; x++) {
        const i = (y * sheet.width + patch.cell * cell.width + x) * 4;
        if (sheet.data[i + 3] === 0) continue;
        if (clear) {
          sheet.data[i + 3] = 0;
          continue;
        }
        sheet.data[i] = r;
        sheet.data[i + 1] = g;
        sheet.data[i + 2] = b;
      }
  }
}

// Write. The palette is locked here, not by sharp: the sharp that ships
// with Next has no quantiser, `palette: true` is a no-op
const palette = quantise(sheet.data, Number(values.colours));
await mkdir(values.out, { recursive: true });
await mkdir(values.contact, { recursive: true });
const raw = {
  raw: { width: sheet.width, height: sheet.height, channels: 4 },
};
const png = await sharp(sheet.data, raw).png({ palette: true }).toBuffer();
await writeFile(join(values.out, `${id}.png`), png);
await writeFile(
  join(values.out, `${id}.json`),
  JSON.stringify(
    {
      cell,
      count: sheet.cells.length,
      background: background.map(v => v.toString(16).padStart(2, '0')).join(''),
      cells: sheet.cells.map(({ box, clipped }) => ({ box, clipped })),
    },
    null,
    2,
  ) + '\n',
);
// The contact print: 4x with hard edges on the sheet's background, the
// cells framed, so the eye can check the feet line and the gaps
const frame = Buffer.alloc(sheet.width * sheet.height * 4);
for (let y = 0; y < sheet.height; y++)
  for (let x = 0; x < sheet.width; x++) {
    const i = (y * sheet.width + x) * 4;
    const edge =
      y === sheet.height - 1 || x % cell.width === 0 || x === sheet.width - 1;
    frame[i] = edge ? 90 : background[0];
    frame[i + 1] = edge ? 60 : background[1];
    frame[i + 2] = edge ? 60 : background[2];
    frame[i + 3] = 255;
  }
// (sharp composites after resizing, so both go up first)
const up = buffer =>
  sharp(buffer, raw)
    .resize(sheet.width * 4, sheet.height * 4, { kernel: 'nearest' })
    .png()
    .toBuffer();
await sharp(await up(frame))
  .composite([{ input: await up(sheet.data), left: 0, top: 0 }])
  .png()
  .toFile(join(values.contact, `${id}.png`));

console.log(
  `${id}: ${sheet.cells.length} cells of ${cellW}x${cellH}, ${palette} colours, background #${background
    .map(v => v.toString(16).padStart(2, '0'))
    .join(
      '',
    )}, heights ${sheet.cells.map(c => c.box.height).join('/')}, widths ${sheet.cells
    .map(c => c.box.width)
    .join('/')}${sheet.cells.some(c => c.clipped) ? ' (CLIPPED)' : ''}`,
);
