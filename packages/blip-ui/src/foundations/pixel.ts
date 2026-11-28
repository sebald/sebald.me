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
 * The spacing roles, in `FLOOR` pixels: every padding, gap, margin and
 * offset in the kit is one of these, by what it is for, never a number
 * (`foundations/spacing.mdx`; `uniformity.test.ts` checks the styles).
 * Two ladders, each doubling: 1, 2, 4, 8 lays things out, 3, 6, 12 is the
 * cursor's alone. In a class by name (`gap-related`, `p-window`), in a
 * calc as `--theme(--spacing-<role>)` (inlined where it is used: a `var()` would take the root's --bui-px, not the stage's); `styles.css` defines them.
 */
export const SPACING = {
  // The gap between neighbours, by how related they are
  /** Repeats of one thing: rows of a list, a meter's cells */
  joined: 1,
  /** A thing and its own parts: a label and its control, a title and its blurb */
  related: 2,
  /** Separate items of one group: a form's fields, a menu's groups, a name and its value */
  regular: 4,
  /** Regions: the stage's parts, windows side by side */
  section: 8,
  // The padding inside, by what holds it
  /** Inside a control, and its block axis: a menu row, a corner button */
  control: 2,
  /** Inside a text field, above and below its text: a line to write on */
  field: 4,
  /** Inside a control, its inline axis: a button's label, a tab's */
  'control-x': 4,
  /** Inside a window or a speech bubble */
  window: 4,
  /** From the stage's or a screen's edge, and round a dialog */
  edge: 8,
  // The cursor's room (`focus.mdx`), for nothing else
  /** The cursor to what it points at */
  cursor: 3,
  /** Nothing else nearer the cursor on its side */
  'cursor-clear': 6,
  /** Between focusable neighbours */
  'cursor-apart': 12,
  /** The column left of a row or the first button, the cursor sits in */
  'cursor-column': 8,
} as const;

export type SpacingRole = keyof typeof SPACING;

/** A length in pixels of the unit, for inline styles: `px(3)` is three */
export const px = (n: number, unit: string = UNIT) =>
  n === 0 ? '0px' : `calc(var(${unit}) * ${n})`;
