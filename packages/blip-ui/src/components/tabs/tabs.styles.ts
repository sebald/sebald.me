import { cva } from '../../utils/styles';

/**
 * Two ways to show the tabs:
 *
 * - `plain`: text tabs over the panel, the current one underlined, for
 *   tabs that stand on their own.
 * - `window`: folder tabs hung from a window's top left, drawn in the
 *   window's own layers (ink, frame, inner line). The others stand on
 *   the window's edge, dimmer; the current one reaches over its edge
 *   rows and opens into it, its frame and inner line turning into the
 *   window's. Wrap arrows at the row's ends.
 *
 * The window variant's lengths are art on the stage grid (`--px`), as
 * the window's rings are: `--t-ring`, its three rings; `--t-over`, how
 * far the current tab reaches over the window (the rings and the light
 * row under them); the label's box is in `--bui-px`, so the text has
 * room at any scale.
 */
export const tabs = {
  root: cva({ base: 'flex min-h-0 flex-col' }),
  list: cva({
    base: [
      '[--t-ring:calc(var(--px)*3)] [--t-over:calc(var(--px)*4)] [--t-label:calc(var(--bui-px)*9)]',
    ],
    variants: {
      on: {
        plain:
          'mb-[calc(var(--bui-px)*2)] flex justify-center gap-[calc(var(--bui-px)*4)]',
        // Neighbours share their ink column
        window: 'flex items-end [&>*+*]:-ml-(--px)',
      },
    },
    defaultVariants: { on: 'plain' },
  }),
  /** The window's row: the arrows and the list, from its top left */
  row: cva({
    base: [
      '[--t-ring:calc(var(--px)*3)] [--t-over:calc(var(--px)*4)] [--t-label:calc(var(--bui-px)*9)]',
      'flex items-end gap-[calc(var(--bui-px)*3)]',
      '-mb-(--t-over) ml-(--t-over)',
    ],
  }),
  /** An arrow: a tab's height, standing where the others stand, so it centres on the labels */
  arrow: cva({
    base: [
      'flex h-[calc(var(--t-ring)+var(--t-label))] cursor-pointer items-center pt-(--t-ring) mb-(--t-over)',
      'text-(--bui-muted) hover:text-(--bui-primary)',
    ],
  }),
  tab: cva({
    base: [
      'cursor-pointer outline-none focus-visible:bui-focus',
      'data-[disabled]:cursor-default data-[disabled]:bui-disabled',
    ],
    variants: {
      on: {
        plain: [
          'border-b-[length:var(--px)] px-[calc(var(--bui-px)*2)] pb-(--bui-px)',
          'border-transparent text-(--bui-muted) hover:text-(--bui-text-bright)',
          // The active tab: the underline and the text in the primary colour
          'data-[active]:border-(--bui-primary) data-[active]:text-(--bui-primary)',
        ],
        window: [
          // The label's box clear of the rings: their height on top, and
          // beside it the rings and four pixels
          '[--t-inline:calc(var(--t-ring)+var(--bui-px)*4)]',
          'group relative flex h-[calc(var(--t-ring)+var(--t-label))] items-center pt-(--t-ring) px-(--t-inline) mb-(--t-over)',
          'text-(--bui-muted) hover:text-(--bui-text-bright)',
          '[--t-frame:var(--bui-frame-dim)] [--t-inner:var(--bui-surface-shade)] [--t-face:var(--bui-surface-shade)] [--t-light:none]',
          // The current tab: over the window's edge, in the window's colours
          'data-[active]:z-1 data-[active]:mb-0 data-[active]:h-[calc(var(--t-ring)+var(--t-label)+var(--t-over))] data-[active]:pb-(--t-over) data-[active]:text-(--bui-primary)',
          'data-[active]:[--t-frame:var(--bui-frame)] data-[active]:[--t-inner:var(--bui-frame-inner)] data-[active]:[--t-face:var(--bui-surface)]',
          'data-[active]:[--t-light:inset_0_var(--px)_0_var(--bui-surface-light)]',
        ],
      },
    },
    defaultVariants: { on: 'plain' },
  }),
  /** A ring of a window tab, like the window's: square at the bottom, where it stands */
  ring: cva({ base: 'absolute' }),
  /** Inside the rings: the panel's fill, with the light row along the top */
  face: cva({
    base: 'absolute bg-(--t-face) shadow-(--t-light)',
  }),
  /**
   * The current tab's feet, over its ink, frame and inner columns where
   * it meets the window: the window's frame row, inner line and light
   * row, run on to where they turn up into the tab's
   */
  foot: cva({
    base: 'absolute bottom-0 hidden size-(--t-ring) group-data-[active]:block',
  }),
  label: cva({ base: 'relative' }),
  panel: cva({
    base: 'min-h-0 flex-1 outline-none focus-visible:bui-focus',
    variants: {
      on: { plain: '', window: 'flex flex-col' },
    },
    defaultVariants: { on: 'plain' },
  }),
};
