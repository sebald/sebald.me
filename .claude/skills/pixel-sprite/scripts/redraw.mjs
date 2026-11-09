// A room's looked-at details drawn again after the shrink (see
// shrink.mjs). Shrunk smoothly, a one-pixel line goes pale and two wide;
// shrunk on the art's pixels, it goes crooked. So a loop script takes the
// detail off the plate before the shrink (`takeOff`) and draws it again
// after it on the shrunk grid (`drawShapes`): the same boxes, lines and
// arrows, given in the render's pixels where they were drawn, every line
// one pixel and straight, arrowheads and small marks at their drawn size.

import { FEET, roomBox } from './shrink.mjs';

/**
 * Where a render pixel lands in the shrunk frame (raw RGB, W wide): the
 * room is shrunk by `factor` about the floor line and centred
 */
export const shrunkGrid = (W, factor, feet = FEET) => {
  const { x: left, y: top } = roomBox(W, 0, factor, feet);
  return {
    sx: x => Math.round(x * factor - 0.1) + left,
    sy: y => Math.round(y * factor - 0.1) + top,
  };
};

/**
 * Take a detail off the plate: every pixel in `box` that `isInk` takes
 * the nearest pixel beside it in the same row that is not ink (left
 * first), so the board under it carries on, light or shade included
 */
export const takeOff = ({ base, rgb, setPx }, plate, box, isInk) => {
  for (let y = box.y0; y < box.y1; y++)
    for (let x = box.x0; x < box.x1; x++) {
      if (!isInk(rgb(base, x, y))) continue;
      for (let d = 1; d < 16; d++) {
        const left = rgb(base, x - d, y);
        if (!isInk(left)) {
          setPx(plate, x, y, left);
          break;
        }
        const right = rgb(base, x + d, y);
        if (!isInk(right)) {
          setPx(plate, x, y, right);
          break;
        }
      }
    }
};

/** Arrowheads as offsets from the tip, in shrunk pixels */
const HEADS = {
  right: [0, 0, -1, -1, -1, 1, -2, -2, -2, 2],
  left: [0, 0, 1, -1, 1, 1, 2, -2, 2, 2],
  up: [0, 0, -1, 1, 1, 1, -2, 2, 2, 2],
  down: [0, 0, -1, -1, 1, -1, -2, -2, 2, -2],
  upLeft: [0, 0, 1, 0, 2, 0, 0, 1, 0, 2],
};

/** Flat [x, y, x, y, …] as pairs */
const pairs = flat => {
  const out = [];
  for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]]);
  return out;
};

/** One pixel of a raw RGB frame `f`, W wide, set to `rgb` */
export const putRgb = (f, W, x, y, rgb) => {
  const i = (y * W + x) * 3;
  f[i] = rgb[0];
  f[i + 1] = rgb[1];
  f[i + 2] = rgb[2];
};

/**
 * Draw shapes on a shrunk frame `f` (raw RGB, W wide). Each shape has an
 * `ink` and one of:
 * - `rect: [x0, y0, x1, y1]`, its outline;
 * - `line: [x, y, x, y, …]`, a polyline through the points;
 * and optionally `head: [x, y, way]`, an arrowhead at a tip (`right`,
 * `left`, `up`, `down`, `upLeft`), and `marks: [x, y, x, y, …]`, single
 * pixels in shrunk offsets from `at: [x, y]` (text, a scribble). All
 * points are in the render's pixels except the marks. `colour(f, i,
 * ink)` gives a pixel's RGB, `i` its index in `f`, so a colour can follow
 * what is under it (a beam).
 */
export const drawShapes = (f, W, shapes, { sx, sy, colour }) => {
  const put = (X, Y, ink) =>
    putRgb(f, W, X, Y, colour(f, (Y * W + X) * 3, ink));
  // A one-pixel line between two shrunk points (Bresenham)
  const stroke = ([ax, ay], [bx, by], ink) => {
    const dx = Math.abs(bx - ax);
    const dy = -Math.abs(by - ay);
    const stepX = ax < bx ? 1 : -1;
    const stepY = ay < by ? 1 : -1;
    let err = dx + dy;
    for (let x = ax, y = ay; ;) {
      put(x, y, ink);
      if (x === bx && y === by) return;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x += stepX;
      }
      if (e2 <= dx) {
        err += dx;
        y += stepY;
      }
    }
  };
  for (const shape of shapes) {
    const { ink } = shape;
    const flat = shape.rect
      ? (([x0, y0, x1, y1]) => [x0, y0, x1, y0, x1, y1, x0, y1, x0, y0])(
          shape.rect,
        )
      : (shape.line ?? []);
    const points = pairs(flat).map(([x, y]) => [sx(x), sy(y)]);
    for (let i = 1; i < points.length; i++)
      stroke(points[i - 1], points[i], ink);
    if (points.length === 1) put(...points[0], ink);
    if (shape.head) {
      const [x, y, way] = shape.head;
      for (const [dx, dy] of pairs(HEADS[way]))
        put(sx(x) + dx, sy(y) + dy, ink);
    }
    if (shape.marks) {
      const [x, y] = shape.at;
      for (const [dx, dy] of pairs(shape.marks))
        put(sx(x) + dx, sy(y) + dy, ink);
    }
  }
};
