// Fit a snapped scene into the stage: where a `w`x`h` image sits inside a
// `W`x`H` frame, centred. Smaller sides are padded by repeating the edge
// rows and columns (so the edges of a render must stay plain), larger ones
// are cropped centred. Pure, so it can be tested from the Node test runner.

/** @returns {{ left: number, top: number, cropX: number, cropY: number, copyW: number, copyH: number }} */
export const padBox = (w, h, W, H) => {
  const copyW = Math.min(w, W);
  const copyH = Math.min(h, H);
  return {
    // Where the copied block lands in the frame
    left: Math.floor((W - copyW) / 2),
    top: Math.floor((H - copyH) / 2),
    // Where it is taken from in the source (a centred crop when larger)
    cropX: Math.floor((w - copyW) / 2),
    cropY: Math.floor((h - copyH) / 2),
    copyW,
    copyH,
  };
};

/**
 * Pad or crop raw RGB pixels (`channels` per pixel) to `W`x`H`. Columns
 * outside the copied block repeat its first or last column, rows above and
 * below repeat the first or last padded row, so the corners come out right.
 */
export const padPixels = (data, w, h, W, H, channels = 3) => {
  const box = padBox(w, h, W, H);
  const out = Buffer.alloc(W * H * channels);
  for (let y = 0; y < H; y++) {
    const sy = Math.min(
      Math.max(y - box.top, 0) + box.cropY,
      box.cropY + box.copyH - 1,
    );
    for (let x = 0; x < W; x++) {
      const sx = Math.min(
        Math.max(x - box.left, 0) + box.cropX,
        box.cropX + box.copyW - 1,
      );
      const si = (sy * w + sx) * channels;
      const oi = (y * W + x) * channels;
      for (let c = 0; c < channels; c++) out[oi + c] = data[si + c];
    }
  }
  return out;
};
