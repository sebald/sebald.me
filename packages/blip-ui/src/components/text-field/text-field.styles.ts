import { cva } from '../../utils/styles';

/**
 * A label over a box of the stage's text. The box is drawn like a meter's
 * cell: an ink line round it, the frame inside it, the dark of an empty
 * cell as its ground. The frame turns bright with the focus and red when
 * it is invalid. Spacing in `--bui-px` and the text in em, so a phone
 * keeps it legible.
 */
export const textField = {
  root: cva({ base: 'flex min-w-0 flex-col gap-[calc(var(--bui-px)*2)]' }),
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
      'data-[full]:text-(--bui-primary)',
    ],
  }),
  input: cva({
    base: [
      // A field is typed in: the stage turns selecting off, and Safari
      // then lets nothing be typed
      'm-0 w-full min-w-0 select-text appearance-none rounded-none border-0 outline-none',
      'bg-(--bui-empty) font-[inherit] text-[1em] leading-[1.35] text-(--bui-text-bright)',
      'px-[calc(var(--bui-px)*3)] py-[calc(var(--bui-px)*2)]',
      // A block for the caret where the browser can draw one
      'caret-(--bui-primary) [caret-shape:block]',
      'placeholder:text-(--bui-dim)',
      'shadow-[0_0_0_var(--bui-px)_var(--bui-ink),inset_0_0_0_var(--bui-px)_var(--bui-frame-dim)]',
      'focus:bui-focus focus:shadow-[0_0_0_var(--bui-px)_var(--bui-ink),inset_0_0_0_var(--bui-px)_var(--bui-frame)]',
      'data-[invalid]:shadow-[0_0_0_var(--bui-px)_var(--bui-ink),inset_0_0_0_var(--bui-px)_var(--bui-danger)]',
      'data-[disabled]:bui-disabled data-[disabled]:cursor-default',
    ],
  }),
  description: cva({ base: 'm-0 text-[0.75em] text-(--bui-muted)' }),
  error: cva({ base: 'm-0 text-[0.85em] text-(--bui-danger-light)' }),
};
