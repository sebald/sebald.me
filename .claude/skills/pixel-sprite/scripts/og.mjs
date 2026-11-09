// The link preview of `/lab/pushback`: the logo over the corner office.
//
//   node .claude/skills/pixel-sprite/scripts/og.mjs [--dim 0.62]
//
// The office's poster cropped to its room (`roomBox` in shrink.mjs, from
// the factor in `rooms.json`, as the game finds it), covering 1200 by 630 and dimmed
// under a vignette, with the logo sheet on top at 4x, nearest, so its
// pixels stay square. Written as the route's `opengraph-image.png` and
// `twitter-image.png`; run it again after the logo or the office changes.

import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';

import { ROOM_FACTORS, roomBox } from './shrink.mjs';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const { values } = parseArgs({
  options: { dim: { type: 'string', default: '0.62' } },
});
const dim = Number(values.dim);

const ASSETS = 'packages/pushback/src/assets';
const ROUTE = 'src/app/(page)/lab/pushback';
const OG = { width: 1200, height: 630 };
const LOGO_SCALE = 4;

// The scene in stage pixels and the room inside it
const SCENE = { width: 480, height: 270 };
const room = roomBox(SCENE.width, SCENE.height, ROOM_FACTORS.office);

const poster = sharp(`${ASSETS}/scenes/office/poster.png`);
const { width: posterWidth } = await poster.metadata();
const k = posterWidth / SCENE.width;
const background = await poster
  .extract({
    left: room.x * k,
    top: room.y * k,
    width: room.width * k,
    height: room.height * k,
  })
  .resize(OG.width, OG.height, { fit: 'cover', position: 'centre' })
  .toBuffer();

const shade = Buffer.from(
  `<svg width="${OG.width}" height="${OG.height}"><defs><radialGradient id="v" cx="50%" cy="50%" r="75%"><stop offset="0" stop-color="#0b0e15" stop-opacity="${dim}"/><stop offset="1" stop-color="#0b0e15" stop-opacity="${Math.min(1, dim + 0.18)}"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#v)"/></svg>`,
);

const sheet = sharp(`${ASSETS}/sheets/logo.png`);
const { width: logoWidth } = await sheet.metadata();
const logo = await sheet
  .resize({ width: logoWidth * LOGO_SCALE, kernel: 'nearest' })
  .toBuffer();
const { width, height } = await sharp(logo).metadata();

const image = await sharp(background)
  .composite([
    { input: shade },
    {
      input: logo,
      left: Math.round((OG.width - width) / 2),
      top: Math.round((OG.height - height) / 2),
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

for (const name of ['opengraph-image.png', 'twitter-image.png']) {
  await sharp(image).png({ compressionLevel: 9 }).toFile(`${ROUTE}/${name}`);
  console.log(`${ROUTE}/${name}`);
}
