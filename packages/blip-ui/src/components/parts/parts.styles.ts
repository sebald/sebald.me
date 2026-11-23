import { cva } from '../../utils/styles';
import { text } from '../text/text.styles';

/** The parts' own look; where they sit is the container's */
export const parts = {
  /** A heading's look */
  title: text.heading,
  /**
   * `--bui-label-width`: the width of the label column the rows in it
   * share (a `TextField`, a `Switch`, a `Readout` take it for their
   * label). Not on a tall stage, where there is no room for a column:
   * the labels are as wide as their text and a field's goes above it.
   * Its children are rows, 4 stage pixels apart: the one gap every
   * screen would otherwise spell for itself
   */
  content: cva({
    base: 'm-0 grid gap-[calc(var(--bui-px)*4)] [--bui-label-width:11ch] tall:[--bui-label-width:initial]',
  }),
  /**
   * Side by side 8 stage pixels apart, room for a focused `Button`'s
   * cursor between two (3 wide, 2 from its button); a row under another 4.
   * Holding buttons, it starts 8 in, a cursor column like a `Picker`'s:
   * the first button's cursor has room, and the buttons line up with a
   * menu's labels
   */
  actions: cva({
    base: [
      'flex flex-wrap items-center gap-x-[calc(var(--bui-px)*8)] gap-y-[calc(var(--bui-px)*4)] *:data-[slot=picker]:basis-full',
      'has-[>[data-slot=button]]:pl-[calc(var(--bui-px)*8)]',
    ],
  }),
};
