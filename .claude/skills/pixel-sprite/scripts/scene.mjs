// Turn a Gemini scene render into the game's 480x270 `native.png`.
//
//   node .claude/skills/pixel-sprite/scripts/scene.mjs <render> <out-dir> [--grid N]
//
// Snaps the render to its pixel grid with the pixel-header `snap.mjs`, then
// pads (or crops) the result to the stage size by repeating the plain edge
// rows and columns (see `pad.mjs`). The loop script of the scene takes it
// from there.

import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

import { padPixels } from './pad.mjs';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

export const STAGE = { width: 480, height: 270 };

const SNAP = resolve(
  import.meta.dirname,
  '../../pixel-header/scripts/snap.mjs',
);

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { grid: { type: 'string' } },
});
const [src, outDir] = positionals;
if (!src || !outDir) {
  console.error('Usage: scene.mjs <render> <out-dir> [--grid N]');
  process.exit(1);
}

const tmp = await mkdtemp(join(tmpdir(), 'pushback-scene-'));
const snap = spawnSync(
  process.execPath,
  [SNAP, src, tmp, ...(values.grid ? ['--grid', values.grid] : [])],
  { stdio: 'inherit' },
);
if (snap.status !== 0) process.exit(snap.status ?? 1);

const { data, info } = await sharp(join(tmp, 'native.png'))
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
await rm(tmp, { recursive: true, force: true });

const padded = padPixels(
  data,
  info.width,
  info.height,
  STAGE.width,
  STAGE.height,
  3,
);

await mkdir(outDir, { recursive: true });
await sharp(padded, {
  raw: { width: STAGE.width, height: STAGE.height, channels: 3 },
})
  .png({ palette: true, colours: 64, dither: 0 })
  .toFile(join(outDir, 'native.png'));

console.log(
  `${info.width}x${info.height} -> ${STAGE.width}x${STAGE.height} ${join(outDir, 'native.png')}`,
);
