import { cva } from '../../utils/styles';

/**
 * The meter's parts. The tone sets the lit cells' ramp through `--m-*`
 * variables, so the parts' classes stay the same. A readout: drawn in
 * `--bui-px`, never finer than `--bui-min-px`, so a phone keeps it legible.
 */
export const meter = {
  root: cva({
    base: 'inline-flex items-center gap-[calc(var(--bui-px)*2)] p-(--bui-px) align-middle',
    variants: {
      tone: {
        /** The player's side, the main pool */
        primary:
          '[--m-light:var(--bui-primary-light)] [--m-mid:var(--bui-primary)] [--m-shade:var(--bui-primary-shade)]',
        /** The other side */
        secondary:
          '[--m-light:var(--bui-secondary-light)] [--m-mid:var(--bui-secondary)] [--m-shade:var(--bui-secondary-shade)]',
        /** A quiet pool */
        neutral:
          '[--m-light:var(--bui-neutral-light)] [--m-mid:var(--bui-neutral)] [--m-shade:var(--bui-neutral-shade)]',
        /** Time */
        info: '[--m-light:var(--bui-info-light)] [--m-mid:var(--bui-info)] [--m-shade:var(--bui-info-shade)]',
        /** What runs low or is dangerous */
        danger:
          '[--m-light:var(--bui-danger-light)] [--m-mid:var(--bui-danger)] [--m-shade:var(--bui-danger-shade)]',
      },
    },
    defaultVariants: { tone: 'primary' },
  }),
  // An ink line a pixel wide around every cell
  cell: cva({
    base: 'relative inline-block shrink-0',
    variants: {
      state: {
        /** A light top row, the colour, a shaded bottom row */
        lit: [
          'shadow-[0_0_0_var(--bui-px)_var(--bui-ink)]',
          'bg-[linear-gradient(to_bottom,var(--m-light)_0_var(--bui-px),var(--m-mid)_var(--bui-px)_calc(100%-var(--bui-px)),var(--m-shade)_calc(100%-var(--bui-px))_100%)]',
        ],
        /** All over in the light colour: a full bar blinking */
        bright: 'bg-(--m-light) shadow-[0_0_0_var(--bui-px)_var(--bui-ink)]',
        /** Dark, a rim in the dots' colour inside the ink, a checker of dots */
        empty:
          'bg-(--bui-empty) shadow-[0_0_0_var(--bui-px)_var(--bui-ink),inset_0_0_0_var(--bui-px)_var(--bui-empty-dots)]',
      },
    },
  }),
  dots: cva({
    base: [
      'absolute inset-(--bui-px)',
      'bg-[repeating-conic-gradient(var(--bui-empty-dots)_0_25%,transparent_0_50%)]',
      'bg-size-[calc(var(--bui-px)*2)_calc(var(--bui-px)*2)]',
    ],
  }),
};
