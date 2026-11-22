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
  actions: cva({
    base: 'flex flex-wrap items-center gap-[calc(var(--bui-px)*4)] *:data-[slot=picker]:basis-full',
  }),
};
