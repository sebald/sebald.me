import { cva } from '../../utils/styles';
import { text } from '../text/text.styles';

/**
 * How a column of form rows places them, `Content`'s and a `Form`'s
 * (inside a `Content`) alike, so a form's rows look as the window's own
 */
export const rows = [
  // Every row spans the columns; a field and a readout take them over
  // (below), the rest is a row of its own across them
  '*:col-span-full',
  // Form rows start 8 in, a cursor column as a Picker's and Actions':
  // a focused field's cursor has room left of its label, and the
  // names line up with a menu's labels and the buttons
  '*:data-[slot=field]:ml-cursor-column *:data-[slot=readout]:ml-cursor-column *:data-[slot=ledger]:ml-cursor-column',
  // A readout's name in the label column, its number where the controls
  // start, as a field's value; upright, its number at the row's end
  'not-tall:*:data-[slot=readout]:grid not-tall:*:data-[slot=readout]:grid-cols-subgrid',
  'tall:*:data-[slot=readout]:flex tall:*:data-[slot=readout]:justify-between',
  // A field in it has its label in the column, the words under the
  // control after it, a stepper's as a text field's: every description
  // and error in a window starts on one edge, the control column's. These
  // areas override the `Field`'s own stepper areas by source order (the two
  // selectors weigh the same). On a tall stage it stays stacked, as anywhere.
  // The label spans the rows and a last row takes what a label on two
  // lines adds, so the words stay right under the control
  'not-tall:*:data-[slot=field]:grid-cols-subgrid',
  "not-tall:*:data-[slot=field]:[grid-template-areas:'label_control_control'_'label_description_count'_'label_error_count'_'label_._.']",
  'not-tall:*:data-[slot=field]:grid-rows-[auto_auto_auto_minmax(0,1fr)]',
  'not-tall:*:data-[slot=field]:*:data-[slot=field-label]:mb-0',
];

/** The parts' own look; where they sit is the container's */
export const parts = {
  /** A heading's look */
  title: text.heading,
  /**
   * Three columns the rows in it share (a `Field` and a `Readout` take
   * them over by subgrid): the labels, as wide as the longest; the
   * controls right after them, 4 stage pixels on; what is left at the end
   * of a line (a field's count). So a value sits by its name and the
   * window is as wide as its rows. Not on a tall stage, where there is no
   * room for a column: a field's label goes above it. Its children are
   * rows, 4 stage pixels apart: the one gap every screen would otherwise
   * spell for itself
   */
  content: cva({
    base: [
      'm-0 grid gap-regular not-tall:grid-cols-[max-content_minmax(0,1fr)_max-content]',
      ...rows,
    ],
  }),
  /**
   * Side by side 12 stage pixels apart, the room a focused `Button`'s
   * cursor needs between two (`foundations/focus.mdx`): 3 seen from its
   * button, at least twice that from the one before; a row under another
   * 4. Holding buttons, it starts 8 in, a cursor column like a `Picker`'s:
   * the first button's cursor has room, and the buttons line up with a
   * menu's labels
   */
  actions: cva({
    base: [
      'flex flex-wrap items-center gap-x-cursor-apart gap-y-regular',
      // Holding a menu, a column that may get less room than the menu's
      // rows (a window in a `Screen`): the menu takes the cut and scrolls,
      // the rest of the window keeps its size. The menu is as wide as its
      // rows, so a setting's value sits by its name even where the legend
      // makes the window wider; held upright it spans the width, so a tap
      // anywhere on a row reaches it. A button beside it keeps its own
      'has-[>[data-slot=picker]]:min-h-0 has-[>[data-slot=picker]]:flex-col has-[>[data-slot=picker]]:items-start tall:*:data-[slot=picker]:self-stretch',
      'has-[>[data-slot=button]]:pl-cursor-column',
    ],
  }),
};
