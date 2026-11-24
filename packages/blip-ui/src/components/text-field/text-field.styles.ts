import { cva } from '../../utils/styles';

/**
 * A line to type in, the control of a `Field`. The field is ink, darker
 * than the window, with one underline as its only edge: dim at rest,
 * thicker and bright with the focus (the kit's mark for a field: two
 * pixels, primary), red when invalid (focused or not; the caret alone
 * shows the focus then). Its label and what is under it are the
 * `Field`'s. Spacing in `--bui-px` and the text in em, so a phone keeps
 * it legible.
 */
export const textField = {
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
};
