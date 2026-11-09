/**
 * The pixel unit: one pixel of the game's native canvas, in CSS pixels.
 * The stage sets `--px` to its scale (3px at three times); every length
 * in the kit is a whole number of them.
 */
export const UNIT = '--px';

/**
 * The stage pixel never finer than `--bui-min-px` (3 CSS pixels): the
 * unit of spacing, and of controls and readouts, which a phone's tall
 * stage would otherwise thin to nothing. `px(n, FLOOR)` for inline styles.
 */
export const FLOOR = '--bui-px';

/** A pixel of an icon or the stopwatch in `FLOOR` pixels (never finer than `--bui-min-px`), finer than the stage's grid: a readout, kept legible on a phone */
export const DOT = 2 / 3;

/**
 * The spacing scale, in `FLOOR` pixels: every padding, gap and margin in
 * the kit is one of these (`uniformity.test.ts` checks the styles)
 */
export const SPACE = [1, 2, 3, 4, 6, 8] as const;

/** A length in pixels of the unit, for inline styles: `px(3)` is three */
export const px = (n: number, unit: string = UNIT) =>
  n === 0 ? '0px' : `calc(var(${unit}) * ${n})`;
