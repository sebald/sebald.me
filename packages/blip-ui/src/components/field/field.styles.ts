import { cva } from '../../utils/styles';

/**
 * A control with the words around it, placed by their slots on a grid.
 * On a wide stage the label sits in the container's label column
 * (`--bui-label-width`, set by `Content`; as wide as its text outside
 * one) and what is under the control in the column after it; on a tall
 * stage the label goes above the control and everything takes the whole
 * row, so a phone's rows line up on the left edge. The characters left
 * sit at the end of the line under the control. Rows with nothing in them
 * take no room: what is under the control keeps its distance by its own
 * margin, not by the grid's gap
 */
export const field = {
  root: cva({
    base: [
      'grid min-w-0 items-baseline gap-x-[calc(var(--bui-px)*3)]',
      'grid-cols-[var(--bui-label-width,max-content)_minmax(0,1fr)_auto]',
      "[grid-template-areas:'label_control_control'_'._description_count'_'._error_count']",
      'tall:grid-cols-[minmax(0,1fr)_auto]',
      "tall:[grid-template-areas:'label_label'_'control_control'_'description_count'_'error_count']",
      // The control is whatever is not one of the words
      '*:[grid-area:control]',
      '*:data-[slot=field-label]:[grid-area:label]',
      'tall:*:data-[slot=field-label]:mb-[calc(var(--bui-px)*2)]',
      '*:data-[slot=field-description]:[grid-area:description]',
      '*:data-[slot=field-description]:mt-[calc(var(--bui-px)*2)]',
      '*:data-[slot=field-error]:[grid-area:error]',
      '*:data-[slot=field-error]:mt-[calc(var(--bui-px)*2)]',
      '*:data-[slot=field-count]:[grid-area:count]',
      '*:data-[slot=field-count]:mt-[calc(var(--bui-px)*2)]',
    ],
  }),
  /** The name, in the window's bright text */
  label: cva({
    base: 'text-(--bui-text-bright) data-[disabled]:bui-disabled',
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
