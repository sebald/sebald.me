// The room, smaller than Gemini drew it. Three rounds of renders kept the
// furniture a fifth or more too large for the cast (desks at the hip,
// but chairs, tables and doors a head too tall), so the finished frames
// of a scene loop are scaled down as a whole about the floor line and
// padded back to the stage with the render's own corner colour, which the
// band's window never reaches. Shrunk on the art's pixels: each new
// pixel takes the colour that covers most of what it shrinks, the one
// that stands out most from the patch (an outline, a marker line, a lit
// window) counting double, so one-pixel lines stay one pixel and keep their
// colour. A smooth shrink blended every pixel with its neighbours and
// washed the lines out; a nearest-neighbour one drops every fifth.
// The loop scripts keep working in the render's own pixels; only what is
// written out is smaller.

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

/** How far from the patch's lightness a colour must be to count as detail */
const STANDS_OUT = 24;

/** The ring of source pixels round a patch its surroundings are read from */
const AROUND = 2;

const lightness = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * One frame (raw RGB, W by H) shrunk to w by h on its pixels: per new
 * pixel, the source colours weighted by the area they cover, double for
 * the detail (the one farthest from the surroundings' mean, if far
 * enough), and
 * the heaviest wins.
 */
const shrinkOnPixels = (f, W, H, w, h, factor) => {
  const out = Buffer.alloc(w * h * 3);
  const cover = new Map();
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
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
      const o = (y * w + x) * 3;
      out[o] = best >> 16;
      out[o + 1] = (best >> 8) & 255;
      out[o + 2] = best & 255;
    }
  return out;
};

/**
 * The frames (raw RGB, W by H) shrunk by `factor` about the floor line,
 * centred, on a canvas of the same size. Returns raw RGB frames, in the
 * render's own colours.
 */
export const shrinkFrames = (
  frames,
  W,
  H,
  { factor = ROOM_FACTOR, feet = FEET } = {},
) => {
  if (factor === 1) return frames;
  const w = Math.round(W * factor);
  const h = Math.round(H * factor);
  const left = Math.round((W - w) / 2);
  const top = feet - Math.round(feet * factor);

  return frames.map(f => {
    const data = shrinkOnPixels(f, W, H, w, h, factor);
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
        const d = ((y + top) * W + x + left) * 3;
        out[d] = data[s];
        out[d + 1] = data[s + 1];
        out[d + 2] = data[s + 2];
      }
    return out;
  });
};
