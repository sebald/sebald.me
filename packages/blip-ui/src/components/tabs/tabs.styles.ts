import { cva } from '../../utils/styles';

/**
 * Folder tabs hung from a window's top left, drawn in the window's own
 * layers (ink, frame, inner line), over the panel, which is the window.
 * The others stand on the window's edge, dimmer; the current one reaches
 * over its edge rows and opens into it, its frame and inner line turning
 * into the window's. Wrap arrows at the row's ends.
 *
 * The tabs' lengths are art on the stage grid (`--px`), as
 * the window's rings are: `--t-ring`, its three rings; `--t-over`, how
 * far the current tab reaches over the window (the rings and the light
 * row under them); the label's box is in `--bui-px`, so the text has
 * room at any scale.
 */
export const tabs = {
  root: cva({ base: 'flex min-h-0 flex-col' }),
  // Neighbours share their ink column
  list: cva({ base: 'flex items-end [&>*+*]:-ml-(--px)' }),
  /** The row: the arrows and the list, from the window's top left */
  row: cva({
    base: [
      '[--t-ring:calc(var(--px)*3)] [--t-over:calc(var(--px)*4)] [--t-label:calc(var(--bui-px)*9)]',
      'flex items-end gap-related',
      '-mb-(--t-over) ml-(--t-over)',
    ],
  }),
  /** An arrow: a tab's height, standing where the others stand, so it centres on the labels */
  arrow: cva({
    base: [
      'flex h-[calc(var(--t-ring)+var(--t-label))] cursor-pointer items-center pt-(--t-ring) mb-(--t-over)',
      'text-(--bui-muted) hover:text-(--bui-text-bright)',
    ],
  }),
  tab: cva({
    base: [
      'cursor-pointer outline-none',
      'data-[disabled]:cursor-default data-[disabled]:bui-disabled',
      // The label's box clear of the rings: their height on top, and
      // beside it the rings and four pixels
      '[--t-inline:calc(var(--t-ring)+--theme(--spacing-control-x))]',
      'group relative flex h-[calc(var(--t-ring)+var(--t-label))] items-center pt-(--t-ring) px-(--t-inline) mb-(--t-over)',
      'text-(--bui-muted) hover:text-(--bui-text-bright)',
      '[--t-frame:var(--bui-frame-dim)] [--t-inner:var(--bui-surface-shade)] [--t-face:var(--bui-surface-shade)] [--t-light:none]',
      // The current tab: over the window's edge, in the window's colours
      'data-[active]:z-1 data-[active]:mb-0 data-[active]:h-[calc(var(--t-ring)+var(--t-label)+var(--t-over))] data-[active]:pb-(--t-over) data-[active]:text-(--bui-heading)',
      'data-[active]:[--t-frame:var(--bui-frame)] data-[active]:[--t-inner:var(--bui-frame-inner)] data-[active]:[--t-face:var(--bui-surface)]',
      // Open, it carries the window's light from its top edge, and its face
      // runs on over the panel's top room, so the panel's own light does
      // not cross under it: one light, falling from the tab into the window.
      // It ends where the panel's content starts (the tab already stands a
      // stage pixel into the panel's body), never over it
      'data-[active]:[--t-light:inset_0_var(--px)_0_var(--bui-surface-light)]',
      'data-[active]:[--t-below:calc(var(--px)-(--theme(--spacing-window)))]',
    ],
  }),
  /** A ring of a window tab, like the window's: square at the bottom, where it stands */
  ring: cva({ base: 'absolute' }),
  /** Inside the rings: the panel's fill, with the light row along the top */
  face: cva({
    base: 'absolute bg-(--t-face) shadow-(--t-light)',
  }),
  /** Over the face of the open tab only: the window's light, solid row and fade */
  light: cva({ base: 'absolute hidden group-data-[active]:block' }),
  /**
   * The current tab's feet, over its ink, frame and inner columns where
   * it meets the window: the window's frame row, inner line and light
   * row, run on to where they turn up into the tab's
   */
  foot: cva({
    base: 'absolute bottom-0 hidden size-(--t-ring) group-data-[active]:block',
  }),
  /** The focus mark is an underline of the label (`bui-focus-line`) */
  label: cva({ base: 'relative group-focus-visible:bui-focus-line' }),
  panel: cva({
    base: [
      'relative flex min-h-0 flex-1 flex-col outline-none',
      // The mark over the window's own edge: the window is the panel's
      // child and would cover an outline of the panel's
      'after:pointer-events-none after:absolute after:inset-0 after:content-[""] focus-visible:after:bui-focus',
    ],
  }),
};
