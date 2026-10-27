/**
 * The sheet validator: the cut sheets under `src/assets/lab/pushback/
 * sheets/` have the cells, the sizes and the palettes the game expects,
 * and every swap's tint names a shade that is really on its base sheet.
 * Reads the PNGs with the sharp that ships with Next, like the scripts.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { describe, it } from 'node:test';

import { CHARACTERS } from './characters';
import {
  PROPS,
  SHEET_IDS,
  type SheetId,
  type SheetMeta,
  hexToRgb,
  tintMatches,
} from './sprites';
import { LAYOUT } from './stage';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const SHEETS = resolve(
  import.meta.dirname,
  '../../../assets/lab/pushback/sheets',
);

/** The idle figure is this tall, on a 72 by 112 cell (the spec's range) */
const FIGURE_HEIGHT = { min: 70, max: 85 };

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

describe('the ghost sheet', () => {
  it('has three cells of a figure the size of the people', async () => {
    const m = meta('ghost');
    assert.deepEqual(m.cell, LAYOUT.cell);
    assert.equal(m.count, 3);
    for (const { box, clipped } of m.cells) {
      assert.equal(clipped, false);
      assert.ok(box.height >= FIGURE_HEIGHT.min && box.height <= 90);
    }
    const { width } = await pixels('ghost');
    assert.equal(width, LAYOUT.cell.width * 3);
  });
});

describe('the prop sheet', () => {
  it('has one cell per prop, none clipped, none bigger than half a figure', () => {
    const m = meta('props');
    assert.equal(m.count, PROPS.length);
    for (const { box, clipped } of m.cells) {
      assert.equal(clipped, false);
      assert.ok(
        box.height <= 42 && box.width <= 44,
        `${box.width}x${box.height}`,
      );
    }
  });
});

describe('swaps', () => {
  const sheets = new Map<SheetId, ReturnType<typeof pixels>>();
  const sheet = (id: SheetId) => {
    let pending = sheets.get(id);
    if (!pending) {
      pending = pixels(id);
      sheets.set(id, pending);
    }
    return pending;
  };

  for (const character of CHARACTERS) {
    for (const tint of character.swap.tints ?? []) {
      it(`${character.id}: the tint from #${tint.from} is a material on ${character.swap.base}`, async () => {
        const { data, width } = await sheet(character.swap.base);
        const from = hexToRgb(tint.from);
        // In the idle cell, enough pixels to be a garment, not a detail
        let matches = 0;
        for (let y = 0; y < LAYOUT.cell.height; y++)
          for (let x = 0; x < LAYOUT.cell.width; x++) {
            const i = (y * width + x) * 4;
            if (data[i + 3] === 0) continue;
            if (tintMatches([data[i]!, data[i + 1]!, data[i + 2]!], from, tint))
              matches++;
          }
        assert.ok(matches >= 60, `${matches} pixels match`);
      });
    }
  }
});
