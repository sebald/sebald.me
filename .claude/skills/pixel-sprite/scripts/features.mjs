// Find the features the game animates on a cut model sheet and write them
// into its `<id>.json`: the head (a square in the idle cell, the select
// screen's portrait), the mouth (where the idle and talk cells differ in
// the face, so the talk pose can close it) and the eye of the lose cell
// (where the tears start).
//
//   node .claude/skills/pixel-sprite/scripts/features.mjs [id ...]
//     [--contact DIR] [--out DIR]
//
// Without ids, every model sheet in `--out`. Writes a 4x contact print
// with the rects drawn to `<contact>/<id>-features.png` for review.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const ROOT = resolve(import.meta.dirname, '../../../..');
const MODEL_SHEETS = [
  'pm-jo',
  'pm-piet',
  'dev-sam',
  'dev-lena',
  'designer-ines',
  'designer-theo',
  'boss',
];
const CELLS = { idle: 0, talk: 1, lose: 5 };
/** The portrait: a square this big, the top of the head a row under its top */
const HEAD = 24;
/** The face: these rows of the figure hold the eyes and the mouth */
const FACE = { from: 14, to: 24 };

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
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

const ids = positionals.length ? positionals : MODEL_SHEETS;

/** The columns of the top rows of the figure: the head, without the arms */
const headSpan = (px, cell, box, rows = 10) => {
  let x0 = Infinity;
  let x1 = -Infinity;
  for (let y = box.y; y < box.y + rows; y++) {
    for (let x = 0; x < cell.width; x++) {
      if (px.alpha(cell.index, x, y) > 0) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
      }
    }
  }
  return { x0, x1 };
};

const pixels = async file => {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const cellWidth = info.width / 6;
  const at = (index, x, y) => (y * info.width + index * cellWidth + x) * 4;
  return {
    info,
    alpha: (index, x, y) => data[at(index, x, y) + 3],
    same: (a, b, x, y, shift = { x: 0, y: 0 }) => {
      const i = at(a, x, y);
      const j = at(b, x + shift.x, y + shift.y);
      for (let k = 0; k < 4; k++) if (data[i + k] !== data[j + k]) return false;
      return true;
    },
  };
};

const rect4x = (x, y, w, h, colour) => {
  const s = 4;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w * s}" height="${h * s}"><rect x="0.5" y="0.5" width="${w * s - 1}" height="${h * s - 1}" fill="none" stroke="${colour}" stroke-width="1"/></svg>`;
  return { input: Buffer.from(svg), left: x * s, top: y * s };
};

await mkdir(values.contact, { recursive: true });

for (const id of ids) {
  const png = join(values.out, `${id}.png`);
  const jsonFile = join(values.out, `${id}.json`);
  const meta = JSON.parse(await readFile(jsonFile, 'utf8'));
  const px = await pixels(png);
  const cell = { width: meta.cell.width, height: meta.cell.height };
  const idle = meta.cells[CELLS.idle].box;
  const talk = meta.cells[CELLS.talk].box;
  const lose = meta.cells[CELLS.lose].box;

  // Head: a square centred on the top of the idle figure
  const span = headSpan(px, { ...cell, index: CELLS.idle }, idle);
  const centre = Math.round((span.x0 + span.x1) / 2);
  const head = {
    x: Math.max(0, Math.min(cell.width - HEAD, centre - HEAD / 2)),
    y: Math.max(0, idle.y - 1),
    width: HEAD,
    height: HEAD,
  };

  // Mouth: where the idle and talk cells differ in the lower face. The
  // talk head may sit a pixel or two to the side, so the talk cell is
  // aligned on the idle head's span first; the rect is in the idle cell
  // and padded by a pixel.
  const talkSpan = headSpan(px, { ...cell, index: CELLS.talk }, talk);
  const shift = { x: talkSpan.x0 - span.x0, y: talk.y - idle.y };
  let m = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (let y = idle.y + FACE.from; y < idle.y + FACE.to; y++) {
    for (let x = span.x0; x <= span.x1; x++) {
      if (!px.same(CELLS.idle, CELLS.talk, x, y, shift)) {
        m = {
          x0: Math.min(m.x0, x),
          y0: Math.min(m.y0, y),
          x1: Math.max(m.x1, x),
          y1: Math.max(m.y1, y),
        };
      }
    }
  }
  const mouth =
    m.x0 === Infinity
      ? null
      : {
          x: m.x0 - 1,
          y: m.y0 - 1,
          width: m.x1 - m.x0 + 3,
          height: m.y1 - m.y0 + 3,
        };
  // Where that rect is in the talk cell
  const talkMouth = mouth && { x: mouth.x + shift.x, y: mouth.y + shift.y };

  // Eye of the lose cell: the figure faces right, head bowed; the eye
  // sits a third down the head, a few pixels in from its facing edge
  const loseSpan = headSpan(px, { ...cell, index: CELLS.lose }, lose, 8);
  const eye = { x: loseSpan.x1 - 5, y: lose.y + 11 };

  meta.features = { head, mouth, talkMouth, eye };
  await writeFile(jsonFile, `${JSON.stringify(meta, null, 2)}\n`);
  console.log(
    `${id}: head ${head.x},${head.y} · mouth ${mouth ? `${mouth.x},${mouth.y} ${mouth.width}x${mouth.height}, talk shifted ${shift.x},${shift.y}` : 'none'} · eye ${eye.x},${eye.y}`,
  );

  // Contact: the idle, talk and lose cells at 4x with the rects
  const w = cell.width * 3;
  const cells = await Promise.all(
    [CELLS.idle, CELLS.talk, CELLS.lose].map(index =>
      sharp(png)
        .extract({
          left: index * cell.width,
          top: 0,
          width: cell.width,
          height: cell.height,
        })
        .png()
        .toBuffer(),
    ),
  );
  const marks = [
    rect4x(head.x, head.y, head.width, head.height, '#f2c14e'),
    ...(mouth
      ? [
          rect4x(mouth.x, mouth.y, mouth.width, mouth.height, '#7fd6d0'),
          rect4x(
            talkMouth.x + cell.width,
            talkMouth.y,
            mouth.width,
            mouth.height,
            '#7fd6d0',
          ),
        ]
      : []),
    rect4x(eye.x + cell.width * 2, eye.y, 1, 1, '#ff5a8a'),
  ];
  await sharp({
    create: {
      width: w,
      height: cell.height,
      channels: 4,
      background: '#2b3036',
    },
  })
    .composite(
      cells.map((input, i) => ({ input, left: i * cell.width, top: 0 })),
    )
    .png()
    .toBuffer()
    .then(b =>
      sharp(b)
        .resize(w * 4, cell.height * 4, { kernel: 'nearest' })
        .composite(marks)
        .png()
        .toFile(join(values.contact, `${id}-features.png`)),
    );
}
