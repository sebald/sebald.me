import { cva } from '../../utils/styles';

/**
 * The round of the controls: a corner button of the wide stage, or a
 * button on the tall stage's bar. Both at least 44 CSS pixels to touch.
 *
 * Focus is the menus' cursor, as on a `Button`, two pixels from the icon:
 * just outside the box in a corner (`Controls` leaves the room), inside its
 * left padding on the bar, where the stage's edge leaves none outside.
 */
export const iconButton = cva({
  base: [
    'relative flex min-h-11 min-w-11 cursor-pointer items-center justify-center outline-none',
    // The cursor: a stepped triangle as a Picker's, shown with the focus
    "before:pointer-events-none before:absolute before:top-1/2 before:content-['']",
    'before:h-[calc(var(--bui-px)*5)] before:w-[calc(var(--bui-px)*3)] before:-translate-y-1/2',
    'before:text-(--bui-primary) before:bui-point-right before:opacity-0 focus-visible:before:opacity-100',
    'disabled:cursor-default disabled:bui-disabled',
  ],
  variants: {
    /** Where it is, from `Controls`: never set by hand */
    layout: {
      /** Icon only, in a corner of the wide stage */
      corner:
        'p-[calc(var(--bui-px)*2)] hover:brightness-125 before:right-full',
      /** In the bar along the bottom, with its label beside the icon */
      bar: 'gap-2 px-4 text-[0.85em] whitespace-nowrap text-(--bui-muted) active:text-(--bui-text-bright) before:left-0',
    },
  },
  defaultVariants: { layout: 'corner' },
});
