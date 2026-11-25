import { cva } from '../../utils/styles';

/**
 * A line to type in, the control of a `Field`. The field is ink, darker
 * than the window, with one underline as its only edge, one pixel: dim
 * at rest, primary with the focus (a second cue to the `Field`'s cursor;
 * it doesn't thicken, nothing grows), red when invalid, focused or not. Its label and what is under it are the
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
      'px-control-x py-control',
      // The underline (`--ul`: its colour), one pixel, inside the box so
      // nothing moves between states. It is the only edge: focus and
      // invalid turn its colour, no outline. Dim, the dimmest tone that
      // holds 3:1 against the window
      '[--ul:var(--bui-dim)]',
      'shadow-[inset_0_calc(var(--bui-px)*-1)_0_var(--ul)]',
      'focus:[--ul:var(--bui-primary)]',
      // Red when invalid, focused or not: the Field's cursor shows the focus
      'data-[invalid]:[--ul:var(--bui-danger)] data-[invalid]:caret-(--bui-danger-light)',
      'data-[disabled]:bui-disabled',
      // A block for the caret where the browser can draw one
      'caret-(--bui-primary) [caret-shape:block]',
      'placeholder:text-(--bui-muted)',
      'data-[disabled]:cursor-default',
    ],
  }),
};
