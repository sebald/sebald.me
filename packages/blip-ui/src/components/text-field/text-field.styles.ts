import { cva } from '../../utils/styles';

/**
 * A line to type in, the control of a `Field`. No ground of its own: the
 * window shows through, and one underline is its only edge, one pixel: dim
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
      'bg-transparent font-[inherit] text-[1em] leading-[1.25] text-(--bui-text-bright)',
      // A line of text with four pixels above and below (`field`), so it
      // holds its own beside a button and is a thumb's height. No inset
      // at the sides: with no ground, the text starts where its line and
      // the words under it start
      'px-0 py-field',
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
