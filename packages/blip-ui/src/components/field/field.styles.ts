import { cva } from '../../utils/styles';

/**
 * A control with the words around it, placed by their slots on a grid:
 * the label above the control, everything the whole row, so rows line up
 * on the left edge; what is under the control below it, the characters
 * left at the end of that line. A container with a label column puts the
 * label beside the control instead (`Content` on a wide stage, by the
 * field's slot). Rows with nothing in them take no room: what is under
 * the control keeps its distance by its own margin, not by the grid's gap
 */
export const field = {
  root: cva({
    base: [
      'group/field grid min-w-0 items-baseline gap-x-regular',
      'grid-cols-[minmax(0,1fr)_auto]',
      "[grid-template-areas:'label_label'_'control_control'_'description_count'_'error_count']",
      // The control is whatever is not one of the words
      '*:[grid-area:control]',
      '*:data-[slot=field-label]:[grid-area:label]',
      '*:data-[slot=field-label]:mb-related',
      '*:data-[slot=field-description]:[grid-area:description]',
      '*:data-[slot=field-description]:mt-related',
      '*:data-[slot=field-error]:[grid-area:error]',
      '*:data-[slot=field-error]:mt-related',
      '*:data-[slot=field-count]:[grid-area:count]',
      '*:data-[slot=field-count]:mt-related',
      // A stepper's row is a setting's, as on a phone's settings screen:
      // the name and the value on one line, the value at its end, its
      // words under the whole row. In a container with a label column
      // (`Content`, wide) the label goes in that column, the value and its
      // arrows still at the row's end
      "has-[>[data-slot=stepper]]:[grid-template-areas:'label_control'_'description_description'_'error_error']",
      'has-[>[data-slot=stepper]]:*:data-[slot=field-label]:mb-0',
      // A stepper's words sit right under its row, a line's leading
      // already above them, so they read as its and not the next row's
      // (about half the room the next row has, with its leading)
      'has-[>[data-slot=stepper]]:*:data-[slot=field-description]:mt-joined',
      'has-[>[data-slot=stepper]]:*:data-[slot=field-error]:mt-joined',
      // Over the stepper's touch target, which reaches into the gap above
      // them: a tap on the words is not a tap on the value
      'has-[>[data-slot=stepper]]:*:data-[slot=field-description]:relative',
      'has-[>[data-slot=stepper]]:*:data-[slot=field-error]:relative',
    ],
  }),
  /** The name, in the window's bright text; what the cursor points at */
  label: cva({
    base: 'relative text-(--bui-text-bright) data-[disabled]:bui-disabled',
  }),
  /**
   * The menus' cursor, 3 stage pixels left of the label, while the control
   * has the keys' focus (the field's focus mark, `foundations/focus.mdx`).
   * Under a finger there is no cursor, as on a menu: the caret and the
   * control's own mark show the focus
   */
  cursor: cva({
    base: [
      'pointer-events-none absolute top-1/2 right-[calc(100%+--theme(--spacing-cursor))] -translate-y-1/2',
      'h-[calc(var(--bui-px)*5)] w-[calc(var(--bui-px)*3)] text-(--bui-primary) bui-point-right',
      'opacity-0 [@media(hover:hover),(pointer:fine)]:group-has-[:focus-visible]/field:opacity-100',
    ],
  }),
  /** What to type or in what form, small and muted */
  description: cva({ base: 'm-0 text-[0.75em] text-(--bui-muted)' }),
  /** What is wrong, in words and red */
  error: cva({ base: 'm-0 text-[0.85em] text-(--bui-danger-light)' }),
  /** Muted while there is room, in the primary colour once it is full */
  count: cva({
    base: [
      'text-[0.85em] text-(--bui-muted) tabular-nums',
      'data-[full]:text-(--bui-primary) data-[disabled]:bui-disabled',
    ],
  }),
};
