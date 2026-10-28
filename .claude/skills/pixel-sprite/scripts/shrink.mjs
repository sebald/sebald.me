// The room, smaller than Gemini drew it. Three rounds of renders kept the
// furniture a fifth or more too large for the cast (desks at the hip,
// but chairs, tables and doors a head too tall), so the finished frames
// of a scene loop are scaled down as a whole about the floor line and
// padded back to the stage with the render's own corner colour, which the
// band's window never reaches. A smooth downscale, then every pixel
// snapped to the palette of the first frame: hard edges again, the
// one-pixel outlines kept as a tone where a nearest-neighbour shrink
// would drop every fifth one. The loop scripts keep working in the
// render's own pixels; only what is written out is smaller.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

/**
 * The factor each room is shrunk by, by scene; 1 would write the render
 * as is. Kept with the scenes, where the game reads it too: the title
 * fits the room's picture, not the padded render, to the stage.
 */
export { default as ROOM_FACTORS } from '../../../../src/assets/lab/pushback/scenes/rooms.json' with { type: 'json' };

/** The factor a room takes unless the scenes say otherwise */
export const ROOM_FACTOR = 0.8;

/** The scene's floor line (the duellists' feet), which stays put */
export const FEET = 230;

/** Colours of the first frame after the shrink, as the loop's palette */
const paletteOf = async (png, colours) => {
  const { data, info } = await sharp(png)
    .png({ palette: true, colours, dither: 0 })
    .toBuffer()
    .then(buf =>
      sharp(buf).raw().removeAlpha().toBuffer({ resolveWithObject: true }),
    );
  const seen = new Set();
  const out = [];
  for (let i = 0; i < info.width * info.height * 3; i += 3) {
    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([data[i], data[i + 1], data[i + 2]]);
  }
  return out;
};

/**
 * The frames (raw RGB, W by H) shrunk by `factor` about the floor line,
 * centred, on a canvas of the same size. Returns raw RGB frames.
 */
export const shrinkFrames = async (
  frames,
  W,
  H,
  { factor = ROOM_FACTOR, feet = FEET, colours = 64 } = {},
) => {
  if (factor === 1) return frames;
  const w = Math.round(W * factor);
  const h = Math.round(H * factor);
  const left = Math.round((W - w) / 2);
  const top = feet - Math.round(feet * factor);

  const small = f =>
    sharp(f, { raw: { width: W, height: H, channels: 3 } })
      .resize(w, h, { kernel: 'lanczos3' })
      .png()
      .toBuffer();

  const palette = await paletteOf(await small(frames[0]), colours);
  const nearest = new Map();
  const snap = (r, g, b) => {
    const key = (r << 16) | (g << 8) | b;
    let hit = nearest.get(key);
    if (hit) return hit;
    let best = palette[0];
    let bestD = Infinity;
    for (const c of palette) {
      const d = (c[0] - r) ** 2 + (c[1] - g) ** 2 + (c[2] - b) ** 2;
      if (d < bestD) {
        bestD = d;
        best = c;
      }
    }
    nearest.set(key, best);
    return best;
  };

  return Promise.all(
    frames.map(async f => {
      const { data } = await sharp(await small(f))
        .raw()
        .removeAlpha()
        .toBuffer({ resolveWithObject: true });
      const out = Buffer.alloc(W * H * 3);
      // The render's corner colour fills what the window never shows
      const [cr, cg, cb] = [f[0], f[1], f[2]];
      for (let i = 0; i < W * H * 3; i += 3) {
        out[i] = cr;
        out[i + 1] = cg;
        out[i + 2] = cb;
      }
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const s = (y * w + x) * 3;
          const [r, g, b] = snap(data[s], data[s + 1], data[s + 2]);
          const d = ((y + top) * W + x + left) * 3;
          out[d] = r;
          out[d + 1] = g;
          out[d + 2] = b;
        }
      return out;
    }),
  );
};
