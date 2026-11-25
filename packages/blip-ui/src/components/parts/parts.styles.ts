import { cva } from '../../utils/styles';
import { text } from '../text/text.styles';

/**
 * How a column of form rows places them, `Content`'s and a `Form`'s
 * (inside a `Content`) alike, so a form's rows look as the window's own
 */
export const rows = [
  // Form rows start 8 in, a cursor column as a Picker's and Actions':
  // a focused field's cursor has room left of its label, and the
  // names line up with a menu's labels and the buttons
  '*:data-[slot=field]:ml-cursor-column *:data-[slot=readout]:ml-cursor-column',
  // A field in it has its label in the column, the words under the
  // control after it; on a tall stage it stays stacked, as anywhere.
  // The label spans the rows and a last row takes what a label on two
  // lines adds, so the words stay right under the control
  'not-tall:*:data-[slot=field]:grid-cols-[var(--bui-label-width)_minmax(0,1fr)_auto]',
  "not-tall:*:data-[slot=field]:[grid-template-areas:'label_control_control'_'label_description_count'_'label_error_count'_'label_._.']",
  'not-tall:*:data-[slot=field]:grid-rows-[auto_auto_auto_minmax(0,1fr)]',
  'not-tall:*:data-[slot=field]:*:data-[slot=field-label]:mb-0',
  // A stepper's row is a setting, as on a phone's settings screen: its
  // description and error explain the row, so they start at the label and
  // take the row's width. A text field's stay under its box, with the count
  "not-tall:*:data-[slot=field]:has-[>[data-slot=stepper]]:[grid-template-areas:'label_control_control'_'description_description_description'_'error_error_error']",
  'not-tall:*:data-[slot=field]:has-[>[data-slot=stepper]]:grid-rows-none',
];

/** The parts' own look; where they sit is the container's */
export const parts = {
  /** A heading's look */
  title: text.heading,
  /**
   * `--bui-label-width`: the width of the label column the rows in it
   * share (a `Field` and a `Readout` take it for their
   * label). Not on a tall stage, where there is no room for a column:
   * the labels are as wide as their text and a field's goes above it.
   * Its children are rows, 4 stage pixels apart: the one gap every
   * screen would otherwise spell for itself
   */
  content: cva({
    base: [
      'm-0 grid gap-regular [--bui-label-width:11ch] tall:[--bui-label-width:initial]',
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
      'flex flex-wrap items-center gap-x-cursor-apart gap-y-regular *:data-[slot=picker]:basis-full',
      'has-[>[data-slot=button]]:pl-cursor-column',
    ],
  }),
};
