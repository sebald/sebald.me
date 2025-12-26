import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

export const styles = cva({
  base: ['rounded-3xl p-6 flex flex-col gap-5'],
  variants: {
    variant: {
      default: ['surface'],
      clear: ['surface-clear'],
      ghost: ['surface-ghost'],
      tinted: ['surface-tinted'],
      opaque: ['surface-opaque'],
      'default-2': ['surface-2-base', 'surface-2'],
      'clear-2': ['surface-2-base', 'surface-clear-2'],
      'ghost-2': ['surface-2-base', 'surface-ghost-2'],
      'tinted-2': ['surface-2-base', 'surface-tinted-2'],
      'opaque-2': ['surface-2-base', 'surface-opaque-2'],
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
