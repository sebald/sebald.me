import { cva } from '../../utils/styles';

/**
 * The round of the controls: a corner button of the wide stage, or a
 * button on the tall stage's bar. Both at least 44 CSS pixels to touch.
 */
export const iconButton = cva({
  base: [
    'flex min-h-11 min-w-11 cursor-pointer items-center justify-center outline-none',
    'focus-visible:bui-focus',
    'disabled:cursor-default disabled:opacity-50 disabled:saturate-0',
  ],
  variants: {
    variant: {
      /** Icon only, in a corner of the wide stage */
      corner: 'p-[calc(var(--px)*2)] hover:brightness-125',
      /** In the bar along the bottom, with its label beside the icon */
      bar: 'gap-2 px-3 text-[0.85em] text-(--bui-muted) active:text-(--bui-text-bright)',
    },
  },
  defaultVariants: { variant: 'corner' },
});
