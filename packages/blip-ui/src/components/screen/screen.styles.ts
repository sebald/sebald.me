import { type ClassValue, cva } from '../../utils/styles';
import type { ScreenProps } from './screen';

export const screen = {
  root: cva({
    base: [
      // Fills the stage's layer, a column. `--s-bottom` keeps the content
      // clear of the bar of controls (0 on the wide stage); `--s-top` is
      // where a screen's title starts, in stage pixels as the title's own
      'absolute inset-0 flex min-h-0 flex-col gap-regular',
      '[--s-bottom:calc(var(--bui-bar)+--theme(--spacing-edge))] [--s-top:calc(var(--px)*8)]',
      'p-edge pb-(--s-bottom)',
      // The title is the column's first row, in the flow instead of drawn
      // at the stage's top: what follows starts under it, whatever its
      // height (a blurb, the tall stage's larger letters)
      'has-[>[data-slot=screen-title]]:pt-(--s-top) *:data-[slot=screen-title]:static',
      // A form has no scroll of its own: its window keeps its height, and a
      // menu window in the same column, which scrolls, takes the cut
      '*:data-[slot=window]:has-[[data-slot=form]]:shrink-0',
    ],
    variants: {
      variant: {
        /** A column from the top down */
        default: '',
        /** One group in the middle, its text centred */
        centered: 'items-center justify-center text-center',
        /**
         * Two windows: side by side on the wide stage, as tall as the room
         * under the title, each its own column; upright, one above the
         * other as the column has them. Each keeps its own title, legend
         * and keys, and its list scrolls in its own room
         */
        split: [
          'grid grid-cols-2 grid-rows-[minmax(0,1fr)] gap-x-section',
          'has-[>[data-slot=screen-title]]:grid-rows-[auto_minmax(0,1fr)]',
          '*:data-[slot=screen-title]:col-span-full',
          'tall:flex',
        ],
      } satisfies Record<NonNullable<ScreenProps['variant']>, ClassValue>,
    },
    defaultVariants: { variant: 'default' },
  }),
};
