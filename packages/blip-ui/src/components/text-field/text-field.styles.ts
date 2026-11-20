import { cva } from '../../utils/styles';

/**
 * A label over a box of the stage's text. The box is drawn like a
 * secondary button's outline: stepped corners, an ink line round it, the
 * frame inside it, the dark of an empty cell as its ground. The frame
 * turns bright with the focus and red when it is invalid. Spacing in `--bui-px` and the text in em, so a phone
 * keeps it legible.
 */
export const textField = {
  root: cva({
    base: 'group flex min-w-0 flex-col gap-[calc(var(--bui-px)*2)]',
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
      'min-h-[calc(--spacing(11)-var(--bui-px)*2)]',
      // A block for the caret where the browser can draw one
      'caret-(--bui-primary) [caret-shape:block]',
      'placeholder:text-(--bui-dim)',
      'data-[disabled]:cursor-default',
    ],
  }),
  /**
   * The box: an unclipped wrapper that carries the focus ring (a
   * clip-path would cut an outline), with the layers of a secondary
   * `Button`'s outline inside, cut with stepped corners: ink, frame, the
   * dark of the cell. The frame is bright with the focus and red when
   * invalid, read from the root's state.
   */
  box: cva({
    base: 'block group-focus-within:bui-focus group-data-[disabled]:bui-disabled',
  }),
  ink: cva({ base: 'block bg-(--bui-ink) p-(--bui-px)' }),
  frame: cva({
    base: [
      'block bg-(--bui-frame-dim) p-(--bui-px)',
      'group-focus-within:bg-(--bui-frame) group-data-[invalid]:bg-(--bui-danger)',
    ],
  }),
  description: cva({ base: 'm-0 text-[0.75em] text-(--bui-muted)' }),
  error: cva({ base: 'm-0 text-[0.85em] text-(--bui-danger-light)' }),
};
