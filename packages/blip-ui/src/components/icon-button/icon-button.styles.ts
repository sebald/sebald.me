import { cva } from '../../utils/styles';

/**
 * The round of the controls: a corner button of the wide stage, or a
 * button on the tall stage's bar. Both at least 44 CSS pixels to touch.
 *
 * Focus is the menus' cursor, as on a `Button`, three pixels from what it
 * points at: the icon in a corner (`Controls` leaves the room between
 * two), the first of icon and label on the bar, at the edge of its left
 * padding, where the stage's edge leaves no room outside.
 */
export const iconButton = cva({
  base: [
    'group relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center outline-none',
    'disabled:cursor-default disabled:bui-disabled',
  ],
  variants: {
    /** Where it is, from `Controls`: never set by hand */
    layout: {
      /** Icon only, in a corner of the wide stage */
      corner: 'p-[calc(var(--bui-px)*2)] hover:brightness-125',
      /** In the bar along the bottom, with its label beside the icon */
      bar: 'gap-2 px-[calc(var(--bui-px)*6)] text-[0.85em] whitespace-nowrap text-(--bui-muted) active:text-(--bui-text-bright)',
    },
  },
  defaultVariants: { layout: 'corner' },
});

/** The cursor, shown with the focus; where it sits follows the layout */
export const iconButtonCursor = cva({
  base: [
    'pointer-events-none absolute top-1/2 -translate-y-1/2',
    'h-[calc(var(--bui-px)*5)] w-[calc(var(--bui-px)*3)] text-(--bui-primary) bui-point-right',
    'opacity-0 group-focus-visible:opacity-100',
  ],
  variants: {
    layout: {
      /** Three pixels left of the icon it sits beside */
      corner: 'right-[calc(100%+var(--bui-px)*3)]',
      /** In the left padding, three pixels from the first content */
      bar: 'left-0',
    },
  },
  defaultVariants: { layout: 'corner' },
});
