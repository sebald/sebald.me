import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

export const styles = cva({
  base: ['rounded-3xl p-6 flex flex-col gap-5'],
  variants: {
    variant: {
      default: ['surface', 'text-oatmeal-50'],
      clear: ['surface-clear', 'text-oatmeal-900'],
      ghost: ['surface-ghost', 'text-oatmeal-50'],
      tinted: ['surface-tinted', 'text-oatmeal-50'],
      opaque: ['surface-opaque', 'text-oatmeal-50'],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps
  extends PropsWithChildren,
    VariantProps<typeof styles> {}

export const Card = ({ children, variant }: CardProps) => (
  <div className={styles({ variant })}>{children}</div>
);
