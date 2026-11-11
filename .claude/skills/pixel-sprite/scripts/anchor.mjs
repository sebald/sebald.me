// Anchor every cell of a cut model sheet on the idle cell's feet and write
// it into its `<id>.json`: each cell's `dx`, how far the game draws the
// figure along its own facing so its feet land where the idle pose's do
// (`anchorOffsets`). `sheet.mjs` writes it on a cut; this adds it to a
// sheet cut before, or after a hand edit, from the PNG alone. The PNG is
// only read.
//
//   node .claude/skills/pixel-sprite/scripts/anchor.mjs [id ...] [--out DIR]
//
// Without ids, every model sheet in `--out`.

import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { sharp } from '../../pixel-header/scripts/sharp.mjs';
import { anchorOffsets } from './cells.mjs';

const ROOT = resolve(import.meta.dirname, '../../../..');
const MODEL_SHEETS = [
  'pm-jo',
  'pm-piet',
  'pm-nadia',
  'dev-sam',
  'dev-lena',
  'dev-bo',
  'designer-ines',
  'designer-theo',
  'designer-kim',
  'boss',
];

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    out: {
      type: 'string',
      default: join(ROOT, 'packages/pushback/src/assets/sheets'),
    },
  },
});

for (const id of positionals.length ? positionals : MODEL_SHEETS) {
  const jsonFile = join(values.out, `${id}.json`);
  const meta = JSON.parse(await readFile(jsonFile, 'utf8'));
  const { data, info } = await sharp(join(values.out, `${id}.png`))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const offsets = anchorOffsets(
    data,
    info.width,
    meta.cell,
    meta.cells.map(c => c.box),
  );
  meta.cells = meta.cells.map((c, i) => ({ ...c, dx: offsets[i] }));
  await writeFile(jsonFile, `${JSON.stringify(meta, null, 2)}\n`);
  console.log(`${id}: dx ${offsets.join('/')}`);
}
