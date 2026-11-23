import { cva } from '../../utils/styles';

/**
 * A label and a line to type in. The field is ink, darker than the
 * window, with one underline as its only edge: dim at rest, thicker and
 * bright with the focus (the kit's mark for a field: two pixels, primary),
 * red when invalid (focused or not; the caret alone shows the focus then). The label is the name of a `Switch`, to
 * the left of the field where the container gives a label width
 * (`--bui-label-width`, set by `Content` on a wide stage) and above it
 * where it doesn't. Spacing in `--bui-px` and the text in em, so a phone
 * keeps it legible.
 */
export const textField = {
  root: cva({
    base: 'flex min-w-0 flex-wrap items-baseline gap-x-[calc(var(--bui-px)*3)] gap-y-[calc(var(--bui-px)*2)]',
  }),
  /** The name, as a Switch's: as wide as the container's label column, or the whole row */
  label: cva({
    base: 'w-(--bui-label-width,100%) shrink-0 text-(--bui-text-bright) data-[disabled]:bui-disabled',
  }),
  /** The field with what is under it, in the column after the label */
  control: cva({
    base: 'flex min-w-0 flex-1 flex-col gap-[calc(var(--bui-px)*2)]',
  }),
  /** The description or the error, and at its end the characters left */
  meta: cva({
    base: 'flex items-baseline justify-between gap-[calc(var(--bui-px)*3)]',
  }),
  /** Muted while there is room, in the primary colour once it is full */
  count: cva({
    base: [
      'ml-auto text-[0.85em] text-(--bui-muted) tabular-nums',
      'data-[full]:text-(--bui-primary) data-[disabled]:bui-disabled',
    ],
  }),
  input: cva({
    base: [
      // A field is typed in: the stage turns selecting off, and Safari
      // then lets nothing be typed
      'm-0 w-full min-w-0 select-text appearance-none rounded-none border-0 outline-none',
      'bg-(--bui-ink) font-[inherit] text-[1em] leading-[1.25] text-(--bui-text-bright)',
      // Low, a line of text with two pixels above and below: not a
      // Button's height, which made it read as a second window
      'px-[calc(var(--bui-px)*4)] py-[calc(var(--bui-px)*2)]',
      // The underline (`--ul`: its colour, `--ul-n`: how many pixels
      // thick), inside the box so nothing moves between states. It is the
      // only edge and all the state shows: focus and invalid turn it, no
      // outline. Dim is what a Switch's track is when off
      '[--ul:var(--bui-dim)] [--ul-n:1]',
      'shadow-[inset_0_calc(var(--bui-px)*var(--ul-n)*-1)_0_var(--ul)]',
      'focus:[--ul:var(--bui-primary)] focus:[--ul-n:2]',
      // Red when invalid, focused or not: no second cue in this state, the
      // red caret alone shows the focus (decided; short of 2.4.7 there)
      'data-[invalid]:[--ul:var(--bui-danger)] data-[invalid]:[--ul-n:1] data-[invalid]:caret-(--bui-danger-light)',
      'data-[disabled]:bui-disabled',
      // A block for the caret where the browser can draw one
      'caret-(--bui-primary) [caret-shape:block]',
      'placeholder:text-(--bui-muted)',
      'data-[disabled]:cursor-default',
    ],
  }),
  description: cva({ base: 'm-0 text-[0.75em] text-(--bui-muted)' }),
  error: cva({ base: 'm-0 text-[0.85em] text-(--bui-danger-light)' }),
};
