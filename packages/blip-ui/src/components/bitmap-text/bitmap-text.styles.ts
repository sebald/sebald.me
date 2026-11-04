import { cva } from '../../utils/styles';

/**
 * The ramp is three variables the letters read: the top row lit
 * (`--t-light`), the middle rows (`--t-main`), the bottom two shaded
 * (`--t-shade`). A tone fills them from an accent's ramp.
 */
export const bitmapText = {
  root: cva({
    base: 'block overflow-visible',
    variants: {
      /** The colour ramp of the letters */
      tone: {
        primary:
          '[--t-main:var(--bui-primary)] [--t-light:var(--bui-primary-light)] [--t-shade:var(--bui-primary-shade)]',
        secondary:
          '[--t-main:var(--bui-secondary)] [--t-light:var(--bui-secondary-light)] [--t-shade:var(--bui-secondary-shade)]',
        neutral:
          '[--t-main:var(--bui-neutral)] [--t-light:var(--bui-neutral-light)] [--t-shade:var(--bui-neutral-shade)]',
        info: '[--t-main:var(--bui-info)] [--t-light:var(--bui-info-light)] [--t-shade:var(--bui-info-shade)]',
        danger:
          '[--t-main:var(--bui-danger)] [--t-light:var(--bui-danger-light)] [--t-shade:var(--bui-danger-shade)]',
        /** White-hot, shaded in the primary colour */
        spark:
          '[--t-main:var(--bui-spark)] [--t-light:var(--bui-spark)] [--t-shade:var(--bui-primary)]',
      },
    },
    defaultVariants: { tone: 'primary' },
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
