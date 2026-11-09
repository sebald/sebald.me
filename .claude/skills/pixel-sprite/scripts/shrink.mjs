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
import { sharp } from '../../pixel-header/scripts/sharp.mjs';

/**
 * The factor each room is shrunk by, by scene; 1 would write the render
 * as is. Kept with the scenes, where the game reads it too: the title
 * fits the room's picture, not the padded render, to the stage.
 */
export { default as ROOM_FACTORS } from '../../../../packages/pushback/src/assets/scenes/rooms.json' with { type: 'json' };

/** The factor a room takes unless the scenes say otherwise */
export const ROOM_FACTOR = 0.8;

/** The scene's floor line (the duellists' feet), which stays put */
export const FEET = 230;

/**
 * Where the shrunk room sits in a render W by H: shrunk by `factor` about
 * the floor line and centred. The game's `roomBox` (`packages/pushback/
 * src/lib/stage.ts`) rounds the same way and must stay in step.
 */
export const roomBox = (W, H, factor, feet = FEET) => {
  const width = Math.round(W * factor);
  return {
    x: Math.round((W - width) / 2),
    y: feet - Math.round(feet * factor),
    width,
    height: Math.round(H * factor),
  };
};

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

/** How far from the patch's lightness a colour must be to count as detail */
const STANDS_OUT = 24;

/** The ring of source pixels round a patch its surroundings are read from */
const AROUND = 2;

const lightness = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * The crisp shrink, for the shrunk pixels in `box`: per new pixel, the
 * source colours weighted by the area they cover, double for the detail
 * (the one farthest from the surroundings' mean, if far enough), and the
 * heaviest wins, handed to `put(x, y, rgb)`. One-pixel lines stay one
 * pixel and keep their colour, but some rows and columns double and
 * others drop, which makes a diagonal or a curve step unevenly: only
 * for boxes of straight lines (a whiteboard, sticky notes), never a room.
 */
const shrinkOnPixels = (f, W, H, factor, box, put) => {
  const cover = new Map();
  for (let y = box.y0; y < box.y1; y++)
    for (let x = box.x0; x < box.x1; x++) {
      const x0 = x / factor;
      const x1 = (x + 1) / factor;
      const y0 = y / factor;
      const y1 = (y + 1) / factor;
      cover.clear();
      // The last row and column can reach past the render's edge
      for (let sy = Math.floor(y0); sy < Math.min(H, Math.ceil(y1)); sy++)
        for (let sx = Math.floor(x0); sx < Math.min(W, Math.ceil(x1)); sx++) {
          const area =
            (Math.min(x1, sx + 1) - Math.max(x0, sx)) *
            (Math.min(y1, sy + 1) - Math.max(y0, sy));
          if (area <= 0) continue;
          const i = (sy * W + sx) * 3;
          const key = (f[i] << 16) | (f[i + 1] << 8) | f[i + 2];
          cover.set(key, (cover.get(key) ?? 0) + area);
        }
      // What the pixel sits in: the patch and a ring of source pixels
      // round it, so a line wider than the patch still reads as the line
      let mean = 0;
      let total = 0;
      for (
        let sy = Math.max(0, Math.floor(y0) - AROUND);
        sy < Math.min(H, Math.ceil(y1) + AROUND);
        sy++
      )
        for (
          let sx = Math.max(0, Math.floor(x0) - AROUND);
          sx < Math.min(W, Math.ceil(x1) + AROUND);
          sx++
        ) {
          const i = (sy * W + sx) * 3;
          mean += lightness(f[i], f[i + 1], f[i + 2]);
          total++;
        }
      mean /= total;
      // The detail is the colour farthest from its surroundings, lighter
      // or darker: a line or a speck pulls their mean less than what it
      // sits on
      let detail = -1;
      let farthest = STANDS_OUT;
      for (const key of cover.keys()) {
        const d = Math.abs(
          lightness(key >> 16, (key >> 8) & 255, key & 255) - mean,
        );
        if (d > farthest) {
          farthest = d;
          detail = key;
        }
      }
      let best = 0;
      let heaviest = -1;
      for (const [key, area] of cover) {
        const weight = key === detail ? area * 2 : area;
        if (weight > heaviest) {
          heaviest = weight;
          best = key;
        }
      }
      put(x, y, best);
    }
};

/** At most this many colours, so lossless WebP keeps its palette mode */
const MAX_COLOURS = 256;

/**
 * The palette with `keep` in it (the colours a loop script draws after
 * the shrink, see redraw.mjs), the closest pairs merged to make room, so
 * the frames stay within `MAX_COLOURS`; one slot is left for the corner
 * colour the padding takes
 */
const fitPalette = (palette, keep) => {
  const out = [...palette];
  const d = (a, b) =>
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
  while (out.length + keep.length > MAX_COLOURS - 1) {
    let drop = 0;
    let closest = Infinity;
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) {
        const e = d(out[i], out[j]);
        if (e < closest) {
          closest = e;
          drop = j;
        }
      }
    out.splice(drop, 1);
  }
  return [...out, ...keep];
};

/**
 * The frames (raw RGB, W by H) shrunk by `factor` about the floor line,
 * centred, on a canvas of the same size. Returns raw RGB frames. `crisp`
 * lists boxes in the render's pixels ({ x0, y0, x1, y1 }) shrunk on the
 * art's pixels instead (`shrinkOnPixels`). `keep` lists the colours drawn
 * after the shrink, which the palette makes room for.
 */
export const shrinkFrames = async (
  frames,
  W,
  H,
  {
    factor = ROOM_FACTOR,
    feet = FEET,
    colours = 64,
    crisp = [],
    keep = [],
  } = {},
) => {
  if (factor === 1) return frames;
  const { x: left, y: top, width: w, height: h } = roomBox(W, H, factor, feet);

  const small = f =>
    sharp(f, { raw: { width: W, height: H, channels: 3 } })
      .resize(w, h, { kernel: 'lanczos3' })
      .png()
      .toBuffer();

  // The first frame is shrunk once: its palette is the loop's, and it is drawn
  const first = await small(frames[0]);
  const palette = fitPalette(await paletteOf(first, colours), keep);
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
      const { data } = await sharp(f === frames[0] ? first : await small(f))
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
      for (const c of crisp) {
        const box = {
          x0: Math.floor(c.x0 * factor),
          y0: Math.floor(c.y0 * factor),
          x1: Math.ceil(c.x1 * factor),
          y1: Math.ceil(c.y1 * factor),
        };
        // Snapped to the loop's palette like the rest: a frame of more
        // than 256 colours loses lossless WebP's palette and grows by half
        shrinkOnPixels(f, W, H, factor, box, (x, y, rgb) => {
          const d = ((y + top) * W + x + left) * 3;
          const [r, g, b] = snap(rgb >> 16, (rgb >> 8) & 255, rgb & 255);
          out[d] = r;
          out[d + 1] = g;
          out[d + 2] = b;
        });
      }
      return out;
    }),
  );
};
