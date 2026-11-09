import { cva } from '../../utils/styles';

/**
 * The ramp is three variables the letters read: the top row lit
 * (`--t-light`), the middle rows (`--t-main`), the bottom two shaded
 * (`--t-shade`). A variant fills them from an accent's ramp.
 */
export const bitmapText = {
  root: cva({
    base: 'block overflow-visible',
    variants: {
      /** The colour ramp of the letters */
      variant: {
        primary:
          '[--t-main:var(--bui-primary)] [--t-light:var(--bui-primary-light)] [--t-shade:var(--bui-primary-shade)]',
        /** Quiet: a loss, something that is over */
        neutral:
          '[--t-main:var(--bui-neutral)] [--t-light:var(--bui-neutral-light)] [--t-shade:var(--bui-neutral-shade)]',
        /** White-hot, shaded in the primary colour */
        spark:
          '[--t-main:var(--bui-spark)] [--t-light:var(--bui-spark)] [--t-shade:var(--bui-primary)]',
      },
    },
    defaultVariants: { variant: 'primary' },
  }),
  ink: cva({ base: 'fill-(--bui-ink)' }),
  letter: cva({
    base: 'fill-(--t-main)',
    variants: {
      row: { light: 'fill-(--t-light)', main: '', shade: 'fill-(--t-shade)' },
    },
    defaultVariants: { row: 'main' },
  }),
};
