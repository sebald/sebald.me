// The pure parts of cutting a model sheet: keying the flat background,
// finding the figures by the gaps between them and placing each one in a
// cell. Pixels are RGB buffers plus a mask; nothing here touches sharp,
// so it runs under the Node test runner.

/** The most common colour on the image border: the sheet's background */
export const borderColour = (data, w, h, channels = 3) => {
  const counts = new Map();
  const add = (x, y) => {
    const i = (y * w + x) * channels;
    const key = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  for (let x = 0; x < w; x++) {
    add(x, 0);
    add(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    add(0, y);
    add(w - 1, y);
  }
  let best = ['0,0,0', -1];
  for (const entry of counts) if (entry[1] > best[1]) best = entry;
  return best[0].split(',').map(Number);
};

const distance = (data, i, [r, g, b]) =>
  Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b);

/**
 * The background as a mask (1 = background): everything reachable from
 * the border through pixels within `tolerance` of the background colour,
 * so a dark outline or a dark shirt inside a figure is never keyed.
 * `soft` then also takes near-background pixels (the soft shadow under
 * the feet) that touch the keyed area, in the lower part of the image.
 */
export const keyBackground = (
  data,
  w,
  h,
  colour,
  { tolerance = 10, soft = 40, softFrom = 0.5, channels = 3 } = {},
) => {
  const mask = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    const p = y * w + x;
    if (mask[p]) return;
    if (distance(data, p * channels, colour) > tolerance) return;
    mask[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    const x = p % w;
    const y = (p - x) / w;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  // The soft shadow: near-background pixels next to the background,
  // grown outwards until nothing near-background touches the keyed area.
  // Only in the lower part of the image (`softFrom` of the height), where
  // the shadows are, so dark hair near the top is never taken.
  let grown = true;
  while (grown) {
    grown = false;
    for (let y = Math.floor(h * softFrom); y < h; y++)
      for (let x = 0; x < w; x++) {
        const p = y * w + x;
        if (mask[p]) continue;
        if (distance(data, p * channels, colour) > soft) continue;
        const touches =
          (x > 0 && mask[p - 1]) ||
          (x < w - 1 && mask[p + 1]) ||
          (y > 0 && mask[p - w]) ||
          (y < h - 1 && mask[p + w]);
        if (touches) {
          mask[p] = 1;
          grown = true;
        }
      }
  }
  return mask;
};

/**
 * Label the connected groups of foreground pixels (4-connected). Returns
 * the label map (0 = background) and each group's size and box.
 */
export const labelGroups = (mask, w, h) => {
  const labels = new Int32Array(w * h);
  const groups = [];
  for (let start = 0; start < w * h; start++) {
    if (mask[start] || labels[start]) continue;
    const label = groups.length + 1;
    const stack = [start];
    labels[start] = label;
    const group = { label, size: 0, x0: w, x1: -1, y0: h, y1: -1 };
    while (stack.length) {
      const p = stack.pop();
      const x = p % w;
      const y = (p - x) / w;
      group.size++;
      if (x < group.x0) group.x0 = x;
      if (x > group.x1) group.x1 = x;
      if (y < group.y0) group.y0 = y;
      if (y > group.y1) group.y1 = y;
      for (const q of [
        x > 0 ? p - 1 : -1,
        x < w - 1 ? p + 1 : -1,
        y > 0 ? p - w : -1,
        y < h - 1 ? p + w : -1,
      ]) {
        if (q < 0 || mask[q] || labels[q]) continue;
        labels[q] = label;
        stack.push(q);
      }
    }
    groups.push(group);
  }
  return { labels, groups };
};

/**
 * The figures of a sheet: the `count` largest groups, left to right, each
 * with the smaller groups nearest to it by centre (a flying sticky note,
 * the steam over a cup). Groups under `specks` pixels are dust and
 * dropped. Without `count`, every group of at least `minSize` pixels is
 * a figure of its own. A figure's `labels` say which pixels are its, so
 * a hand reaching into the next figure's columns is never copied twice.
 */
export const findFigures = (
  mask,
  w,
  h,
  { count, specks = 6, minSize = 40 } = {},
) => {
  const { labels, groups } = labelGroups(mask, w, h);
  const kept = groups.filter(g => g.size >= specks);
  const bySize = [...kept].sort((a, b) => b.size - a.size);
  const main = (
    count ? bySize.slice(0, count) : kept.filter(g => g.size >= minSize)
  ).sort((a, b) => a.x0 - b.x0);
  const figures = main.map(g => ({
    labels: [g.label],
    x0: g.x0,
    x1: g.x1,
    y0: g.y0,
    y1: g.y1,
  }));
  for (const g of kept) {
    if (main.includes(g)) continue;
    const cx = (g.x0 + g.x1) / 2;
    const cy = (g.y0 + g.y1) / 2;
    let best = null;
    let bestD = Infinity;
    for (const f of figures) {
      const dx = Math.max(f.x0 - cx, 0, cx - f.x1);
      const dy = Math.max(f.y0 - cy, 0, cy - f.y1);
      const d = Math.hypot(dx, dy);
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    if (!best) continue;
    best.labels.push(g.label);
    best.x0 = Math.min(best.x0, g.x0);
    best.x1 = Math.max(best.x1, g.x1);
    best.y0 = Math.min(best.y0, g.y0);
    best.y1 = Math.max(best.y1, g.y1);
  }
  return { labels, figures };
};

/**
 * Where a box lands in a `cell`: centred horizontally, on the cell's
 * bottom row (`anchor: 'bottom'`, figures stand on their feet) or centred
 * (`'centre'`, items). A box wider or taller than the cell is clipped,
 * and the result says so.
 */
export const placeInCell = (box, cell, anchor = 'bottom') => {
  const x = Math.floor((cell.width - box.width) / 2);
  const y =
    anchor === 'bottom'
      ? cell.height - box.height
      : Math.floor((cell.height - box.height) / 2);
  return {
    x,
    y,
    clipped: box.width > cell.width || box.height > cell.height,
  };
};

/**
 * Copy the figures into a row of cells as RGBA. Returns the buffer and
 * the per-cell record (the box inside the cell, the figure's size).
 */
export const cutCells = (
  data,
  labels,
  w,
  figures,
  cell,
  { anchor = 'bottom', channels = 3 } = {},
) => {
  const out = Buffer.alloc(figures.length * cell.width * cell.height * 4);
  const stride = figures.length * cell.width;
  const cells = figures.map((figure, index) => {
    const own = new Set(figure.labels);
    const box = {
      x: figure.x0,
      y: figure.y0,
      width: figure.x1 - figure.x0 + 1,
      height: figure.y1 - figure.y0 + 1,
    };
    const at = placeInCell(box, cell, anchor);
    for (let dy = 0; dy < box.height; dy++) {
      const cy = at.y + dy;
      if (cy < 0 || cy >= cell.height) continue;
      for (let dx = 0; dx < box.width; dx++) {
        const cx = at.x + dx;
        if (cx < 0 || cx >= cell.width) continue;
        const sx = box.x + dx;
        const sy = box.y + dy;
        if (!own.has(labels[sy * w + sx])) continue;
        const si = (sy * w + sx) * channels;
        const oi = (cy * stride + index * cell.width + cx) * 4;
        out[oi] = data[si];
        out[oi + 1] = data[si + 1];
        out[oi + 2] = data[si + 2];
        out[oi + 3] = 255;
      }
    }
    return {
      index,
      box: { x: at.x, y: at.y, width: box.width, height: box.height },
      clipped: at.clipped,
    };
  });
  return { data: out, width: stride, height: cell.height, cells };
};

/**
 * Lock the palette: merge the closest pair of colours (weighted by how
 * many pixels use them) until at most `max` are left, then map every
 * opaque pixel to its colour's survivor. JPEG leaves a few hundred
 * shades on a sheet drawn with thirty; this folds them back. In place.
 */
export const quantise = (rgba, max = 32) => {
  const counts = new Map();
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    const key = (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  // Each entry: the colour as a weighted sum, its weight and its members
  const entries = [...counts].map(([key, n]) => ({
    r: (key >> 16) * n,
    g: ((key >> 8) & 255) * n,
    b: (key & 255) * n,
    n,
    keys: [key],
  }));
  const colour = e => [e.r / e.n, e.g / e.n, e.b / e.n];
  while (entries.length > max) {
    let best = [0, 1];
    let bestD = Infinity;
    for (let i = 0; i < entries.length; i++) {
      const a = colour(entries[i]);
      for (let j = i + 1; j < entries.length; j++) {
        const b = colour(entries[j]);
        // Weighted, so a rare shade merges into a common one first
        const d =
          Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) *
          Math.min(entries[i].n, entries[j].n);
        if (d < bestD) {
          bestD = d;
          best = [i, j];
        }
      }
    }
    const [i, j] = best;
    const a = entries[i];
    const b = entries[j];
    entries[i] = {
      r: a.r + b.r,
      g: a.g + b.g,
      b: a.b + b.b,
      n: a.n + b.n,
      keys: [...a.keys, ...b.keys],
    };
    entries.splice(j, 1);
  }
  const lookup = new Map();
  for (const e of entries) {
    const c = colour(e).map(Math.round);
    for (const key of e.keys) lookup.set(key, c);
  }
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    const c = lookup.get((rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2]);
    rgba[i] = c[0];
    rgba[i + 1] = c[1];
    rgba[i + 2] = c[2];
  }
  return entries.length;
};
