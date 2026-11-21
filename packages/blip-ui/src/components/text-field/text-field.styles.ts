import { cva } from '../../utils/styles';

/**
 * A label over a slot to type in. The slot is sunk into what it sits in,
 * not framed (a framed box in a window reads as a window in a window): the
 * ink, much darker than the window, with a light lip along its bottom
 * and right where the surface catches the light. The lip is the only
 * edge and says the state: dim at rest, bright and thicker with the
 * focus, red when invalid (focused or not; the caret alone shows the
 * focus then). Spacing in `--bui-px` and the text in em, so
 * a phone keeps it legible.
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
      'bg-(--bui-ink) font-[inherit] text-[1em] leading-[1.25] text-(--bui-text-bright)',
      'px-[calc(var(--bui-px)*4)] py-[calc(var(--bui-px)*3)]',
      // A thumb's height at least, with the outline the same as a default
      // `Button`'s (44 CSS pixels, ink line included), so a field and a
      // button in one row are one height
      'min-h-[calc(--spacing(11)+var(--bui-px)*2)]',
      // The lip along the bottom and the right (`--lip`: its colour,
      // `--lip-n`: how many pixels thick). It is the only edge, and it is
      // all the state shows: focus and invalid turn it, no outline
      '[--lip:var(--bui-surface-light)] [--lip-n:1]',
      'shadow-[inset_calc(var(--bui-px)*var(--lip-n)*-1)_calc(var(--bui-px)*var(--lip-n)*-1)_0_var(--lip)]',
      // Bright and twice as thick with the focus
      'focus:[--lip:var(--bui-primary)] focus:[--lip-n:2]',
      // Red when invalid, focused or not: no second cue in this state, the
      // red caret alone shows the focus
      'data-[invalid]:[--lip:var(--bui-danger)] data-[invalid]:[--lip-n:1] data-[invalid]:caret-(--bui-danger-light)',
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
