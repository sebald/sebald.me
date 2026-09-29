// Shared helpers for the per-scene loop scripts: load the snapped scene, read
// and write pixels, and export the loop as a 3x animated WebP plus a poster.

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// sharp is no direct dependency, resolve the copy that ships with Next
export const sharp = createRequire(require.resolve('next/package.json'))(
  'sharp',
);

// The loop is exported at 3x with hard edges. The page then only scales it a
// little and smoothly, so every art pixel keeps the same size on screen (at
// native size, the browser has to round each pixel to 1 or 2 CSS pixels).
export const SCALE = 3;

// Colours
// ---------------
export const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
export const sat = ([r, g, b]) => {
  const mx = Math.max(r, g, b);
  return mx === 0 ? 0 : (mx - Math.min(r, g, b)) / mx;
};
export const scale = (c, f) => c.map(v => Math.min(255, Math.round(v * f)));
export const mix = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
export const hex = c => c.map(v => v.toString(16).padStart(2, '0')).join('');

// Deterministic hash noise, 0..1, so every render is identical
export const hash = (a, b, c = 0) => {
  let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

// Scene
// ---------------
export const loadScene = async src => {
  const { data: base, info } = await sharp(src)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // RGB frames
  const rgb = (b, x, y) => {
    const i = (y * W + x) * 3;
    return [b[i], b[i + 1], b[i + 2]];
  };
  const setPx = (b, x, y, [r, g, bl]) => {
    const i = (y * W + x) * 3;
    b[i] = r;
    b[i + 1] = g;
    b[i + 2] = bl;
  };

  // Transparent RGBA layers, for parts that move by less than an art pixel
  const newLayer = () => Buffer.alloc(W * H * 4);
  const setLayerPx = (b, x, y, [r, g, bl]) => {
    const i = (y * W + x) * 4;
    b[i] = r;
    b[i + 1] = g;
    b[i + 2] = bl;
    b[i + 3] = 255;
  };

  // Pixels of the scene in a box that match a predicate
  const collect = ({ x0, y0, x1, y1 }, test) => {
    const out = [];
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const c = rgb(base, x, y);
        if (test(c, x, y)) out.push([x, y, c]);
      }
    return out;
  };

  // Average colour of the non-matching pixels around a group, e.g. as the
  // "off" state of a light
  const surround = (group, test) => {
    const acc = [0, 0, 0];
    let n = 0;
    for (const [x, y] of group)
      for (const [dx, dy] of [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2],
      ]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const c = rgb(base, nx, ny);
        if (test(c)) continue;
        acc[0] += c[0];
        acc[1] += c[1];
        acc[2] += c[2];
        n++;
      }
    return n ? acc.map(v => Math.round(v / n)) : [20, 24, 36];
  };

  return { base, W, H, rgb, setPx, newLayer, setLayerPx, collect, surround };
};

// Export
// ---------------
/**
 * Writes `scene.webp` (lossless, looping) and `poster.png` (frame 0) at 3x.
 * `frames` are native RGB buffers; `layersAt(t)` optionally returns RGBA
 * layers to lay over frame `t`, each moved up by `lift` export pixels. With
 * `FRAMES_DIR` set, the frames are also written there for review.
 */
export const writeLoop = async ({
  scene: { W, H },
  frames,
  delay,
  outDir,
  layersAt = () => [],
}) => {
  const up = (buf, channels) =>
    sharp(buf, { raw: { width: W, height: H, channels } })
      .resize(W * SCALE, H * SCALE, { kernel: 'nearest' })
      .png()
      .toBuffer();

  // Up by `lift` export pixels, cropped so it still fits the frame
  const lifted = async (layer, lift) =>
    lift === 0
      ? layer
      : sharp(layer)
          .extract({
            left: 0,
            top: lift,
            width: W * SCALE,
            height: H * SCALE - lift,
          })
          .toBuffer();

  const scaled = await Promise.all(
    frames.map(async (f, t) => {
      const frame = await up(f, 3);
      const layers = layersAt(t);
      if (!layers.length) return frame;
      const overlays = await Promise.all(
        layers.map(async ({ layer, lift }) => ({
          input: await lifted(await up(layer, 4), lift),
          top: 0,
          left: 0,
        })),
      );
      return sharp(frame).composite(overlays).png().toBuffer();
    }),
  );

  await sharp(scaled, { join: { animated: true } })
    .webp({
      lossless: true,
      loop: 0,
      delay: Array(frames.length).fill(delay),
    })
    .toFile(`${outDir}/scene.webp`);

  // Frame 0 doubles as the reduced-motion poster
  await sharp(scaled[0]).png({ palette: true }).toFile(`${outDir}/poster.png`);

  if (process.env.FRAMES_DIR)
    await Promise.all(
      scaled.map((p, t) =>
        sharp(p).toFile(
          `${process.env.FRAMES_DIR}/f${String(t).padStart(2, '0')}.png`,
        ),
      ),
    );
};
