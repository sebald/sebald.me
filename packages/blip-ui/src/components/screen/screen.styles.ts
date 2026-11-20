import { type ClassValue, cva } from '../../utils/styles';
import type { ScreenProps } from './screen';

export const screen = {
  root: cva({
    base: [
      // Fills the stage's layer, a column. `--s-bottom` keeps the content
      // clear of the bar of controls (0 on the wide stage); `--s-top` is
      // where a screen's title starts, in stage pixels as the title's own
      'absolute inset-0 flex min-h-0 flex-col gap-[calc(var(--bui-px)*4)]',
      '[--s-bottom:calc(var(--bui-bar)+var(--bui-px)*6)] [--s-top:calc(var(--px)*8)]',
      'p-[calc(var(--bui-px)*6)] pb-(--s-bottom)',
      // The title is the column's first row, in the flow instead of drawn
      // at the stage's top: what follows starts under it, whatever its
      // height (a blurb, the tall stage's larger letters)
      'has-[>[data-slot=screen-title]]:pt-(--s-top) *:data-[slot=screen-title]:static',
    ],
    variants: {
      variant: {
        /** A column from the top down */
        default: '',
        /** One group in the middle, its text centred */
        centered:
          '[--s-bottom:calc(var(--bui-bar)+var(--bui-px)*8)] items-center justify-center p-[calc(var(--bui-px)*8)] pb-(--s-bottom) text-center',
      } satisfies Record<NonNullable<ScreenProps['variant']>, ClassValue>,
    },
    defaultVariants: { variant: 'default' },
  }),
};
