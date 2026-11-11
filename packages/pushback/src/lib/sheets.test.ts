/**
 * The sheet validator: the cut sheets under `packages/pushback/src/assets/
 * sheets/` have the cells, the sizes and the palettes the game expects,
 * Reads the PNGs with the sharp that ships with Next, like the scripts.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

import { POSE_CELL, type Pose, SHEET_IDS, type SheetMeta } from './sprites';
import { LAYOUT, poseOffset } from './stage';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const SHEETS = resolve(import.meta.dirname, '../assets/sheets');

/**
 * The idle figure is this tall, on a 72 by 112 cell (the spec's range,
 * 70 to 85). Bo and Kim are kept at 94 and 95 by decision, a broad man
 * and a tall woman, so the ceiling is 96; nothing taller gets in.
 */
const FIGURE_HEIGHT = { min: 70, max: 96 };

/** `features.mjs` finds these on every model sheet */
const hasFeatures = (m: SheetMeta) =>
  m.features !== undefined &&
  m.features.mouth !== null &&
  m.features.talkMouth !== null;

/** `sheet.mjs` quantises to this many colours */
const PALETTE = 32;

const meta = (id: string): SheetMeta =>
  JSON.parse(readFileSync(join(SHEETS, `${id}.json`), 'utf8'));

const pixels = async (id: string) => {
  const { data, info } = await sharp(join(SHEETS, `${id}.png`))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: data as Buffer, width: info.width, height: info.height };
};

const colours = (data: Buffer) => {
  const set = new Set<string>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    set.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
  }
  return set;
};

describe('model sheets', () => {
  for (const id of SHEET_IDS) {
    it(`${id}: six 72 by 112 cells, the figure in range, 32 colours`, async () => {
      const m = meta(id);
      assert.deepEqual(m.cell, LAYOUT.cell);
      assert.equal(m.count, 6);
      assert.equal(m.cells.length, 6);
      for (const cell of m.cells) assert.equal(cell.clipped, false);
      const idle = m.cells[0]!.box;
      assert.ok(
        idle.height >= FIGURE_HEIGHT.min && idle.height <= FIGURE_HEIGHT.max,
        `idle figure is ${idle.height} px`,
      );
      // Every pose stands on the cell's bottom row
      for (const { box } of m.cells)
        assert.equal(box.y + box.height, LAYOUT.cell.height);
      const { data, width, height } = await pixels(id);
      assert.equal(width, LAYOUT.cell.width * 6);
      assert.equal(height, LAYOUT.cell.height);
      assert.ok(colours(data).size <= PALETTE);
    });
  }
});

/** The feet rows of `anchorOffsets` (`cells.mjs`) */
const FEET_ROWS = 6;

/** The mean x of the visible pixels in the lowest rows of a cell's box */
const feetCentre = (
  data: Buffer,
  stride: number,
  index: number,
  { box }: SheetMeta['cells'][number],
) => {
  let sum = 0;
  let count = 0;
  for (let y = box.y + box.height - FEET_ROWS; y < box.y + box.height; y++)
    for (let x = 0; x < LAYOUT.cell.width; x++)
      if (data[(y * stride + index * LAYOUT.cell.width + x) * 4 + 3]! > 0) {
        sum += x;
        count++;
      }
  return sum / count;
};

/** The furthest a pose steps, forward (+) and back (-): the mic-drop taunt, the flinch */
const steps = (pose: Pose) => {
  const all = [
    poseOffset(pose, 10_000, 1).dx,
    poseOffset(pose, 10_000, 1, true).dx,
    poseOffset(pose, 0, 1).dx,
  ];
  return { forward: Math.max(0, ...all), back: Math.min(0, ...all) };
};

describe('every pose anchored on the feet', () => {
  for (const id of SHEET_IDS) {
    it(`${id}: every pose stands where the idle pose stands`, async () => {
      const m = meta(id);
      const { data, width } = await pixels(id);
      const idle = feetCentre(data, width, 0, m.cells[0]!);
      m.cells.forEach((cell, index) => {
        const feet = feetCentre(data, width, index, cell) + cell.dx!;
        assert.ok(
          Math.abs(feet - idle) <= 1,
          `cell ${index}: feet at ${feet.toFixed(1)}, idle at ${idle.toFixed(1)}`,
        );
      });
    });

    it(`${id}: dx is a whole number on every cell and 0 on idle`, () => {
      const m = meta(id);
      for (const cell of m.cells) assert.ok(Number.isInteger(cell.dx));
      assert.equal(m.cells[POSE_CELL.idle]!.dx, 0);
    });

    it(`${id}: the shifted figure stays inside its cell, steps included`, () => {
      const m = meta(id);
      for (const [pose, index] of Object.entries(POSE_CELL)) {
        const { box, dx } = m.cells[index]!;
        const { forward, back } = steps(pose as Pose);
        assert.ok(box.x + dx! + back >= 0, `${pose}: off the back edge`);
        assert.ok(
          box.x + box.width + dx! + forward <= m.cell.width,
          `${pose}: off the front edge`,
        );
      }
    });
  }
});

describe('the mic-drop burst sheet', () => {
  it('has three cells of 96 by 96: the burst, the big one, the popped one', () => {
    const m = meta('micdrop');
    assert.equal(m.count, 3);
    assert.deepEqual(m.cell, { width: 96, height: 96 });
    for (const { box, clipped } of m.cells) {
      assert.equal(clipped, false);
      assert.ok(box.height >= 60 && box.height <= 96, String(box.height));
    }
  });
});

describe('the ghost sheet', () => {
  it('has three cells of a figure about half the size of the people', async () => {
    const m = meta('ghost');
    assert.deepEqual(m.cell, LAYOUT.cell);
    assert.equal(m.count, 3);
    for (const { box, clipped } of m.cells) {
      assert.equal(clipped, false);
      // Built at --scale 0.5: it floats at the shoulder, not in the line-up
      assert.ok(box.height >= 45 && box.height <= 60, String(box.height));
    }
    const { width } = await pixels('ghost');
    assert.equal(width, LAYOUT.cell.width * 3);
  });
});

describe('the features', () => {
  it('are on every model sheet: a portrait, a mouth to shut, an eye to cry from', () => {
    for (const id of SHEET_IDS) {
      const m = meta(id);
      assert.ok(hasFeatures(m), id);
      const { head, mouth, eye } = m.features!;
      assert.equal(head.width, head.height);
      assert.ok(mouth!.y > head.y && mouth!.y < head.y + head.height, id);
      assert.ok(eye.y > m.cells[5]!.box.y, id);
    }
  });
});
