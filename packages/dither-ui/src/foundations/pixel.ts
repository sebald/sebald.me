/**
 * The pixel unit: one pixel of the game's native canvas, in CSS pixels.
 * The stage sets `--px` to its scale (3px at three times); every length
 * in the kit is a whole number of them.
 */
export const UNIT = '--px';

/** A length in pixels of the unit, for inline styles: `px(3)` is three */
export const px = (n: number, unit: string = UNIT) =>
  n === 0 ? '0px' : `calc(var(${unit}) * ${n})`;
