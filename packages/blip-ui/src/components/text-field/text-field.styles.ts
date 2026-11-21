import { cva } from '../../utils/styles';

/**
 * A label over a slot to type in. The slot is sunk into what it sits in,
 * not framed (a framed box in a window reads as a window in a window): the
 * dark of an empty meter cell, with an ink edge along its top and left
 * where the surface above it casts its shade, and a line along its
 * bottom. The line says what state it is in by more than its colour: a
 * thin dim one at rest (a thicker one on a touch screen, which has no
 * hover or focus to show it), a thick bright one with the focus, and a
 * dashed red one when it is invalid. Spacing in `--bui-px` and the text
 * in em, so a phone keeps it legible.
 */
export const textField = {
  root: cva({
    base: 'flex min-w-0 flex-col gap-[calc(var(--bui-px)*2)]',
  }),
  /** The label and, at its end, the characters left */
  row: cva({
    base: 'flex items-baseline justify-between gap-[calc(var(--bui-px)*3)]',
  }),
  label: cva({
    base: 'text-[0.85em] text-(--bui-muted) data-[disabled]:bui-disabled',
  }),
  /** Dim while there is room, in the primary colour once it is full */
  count: cva({
    base: [
      'text-[0.85em] text-(--bui-dim) tabular-nums',
      'data-[full]:text-(--bui-primary) data-[disabled]:bui-disabled',
    ],
  }),
  input: cva({
    base: [
      // A field is typed in: the stage turns selecting off, and Safari
      // then lets nothing be typed
      'm-0 w-full min-w-0 select-text appearance-none rounded-none border-0 outline-none',
      'bg-(--bui-empty) font-[inherit] text-[1em] leading-[1.25] text-(--bui-text-bright)',
      'px-[calc(var(--bui-px)*4)] py-[calc(var(--bui-px)*3)]',
      // A thumb's height at least, with the outline the same as a default
      // `Button`'s (44 CSS pixels, ink line included), so a field and a
      // button in one row are one height
      'min-h-[calc(--spacing(11)+var(--bui-px)*2)]',
      // The ink along the top and the left, the line along the bottom
      // (`--f-*`: its colour, its height, its dash and where it repeats)
      'shadow-[inset_var(--bui-px)_var(--bui-px)_0_var(--bui-ink)]',
      '[--f-line:var(--bui-frame-dim)] [--f-h:var(--bui-px)] [--f-on:100%] [--f-per:100%]',
      'touch:[--f-h:calc(var(--bui-px)*2)]',
      'bg-no-repeat [background-position:bottom] [background-size:100%_var(--f-h)]',
      '[background-image:repeating-linear-gradient(to_right,var(--f-line)_0_var(--f-on),transparent_var(--f-on)_var(--f-per))]',
      'focus:bui-focus focus:[--f-line:var(--bui-frame)] focus:[--f-h:calc(var(--bui-px)*3)]',
      'data-[invalid]:[--f-line:var(--bui-danger)] data-[invalid]:[--f-h:calc(var(--bui-px)*2)] data-[invalid]:[--f-on:calc(var(--bui-px)*2)] data-[invalid]:[--f-per:calc(var(--bui-px)*4)]',
      'data-[disabled]:bui-disabled',
      // A block for the caret where the browser can draw one
      'caret-(--bui-primary) [caret-shape:block]',
      'placeholder:text-(--bui-dim)',
      'data-[disabled]:cursor-default',
    ],
  }),
  description: cva({ base: 'm-0 text-[0.75em] text-(--bui-muted)' }),
  error: cva({ base: 'm-0 text-[0.85em] text-(--bui-danger-light)' }),
};
