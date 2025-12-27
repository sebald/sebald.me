import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// TODO: create utitlies to set classes directly instead of "knowing" the css var for surface (buttons too)
export const styles = cva({
  base: ['rounded-3xl p-6 flex flex-col gap-5'],
  variants: {
    variant: {
      default: ['surface'],
      clear: ['surface-clear'],
      ghost: ['surface-ghost'],
      tinted: ['surface-tinted'],
      opaque: ['surface-opaque'],
      'default-2': ['surface-2', 'surface-default-2'],
      'clear-2': ['surface-2', 'surface-clear-2'],
      'ghost-2': ['surface-2', 'surface-ghost-2'],
      'tinted-2': ['surface-2', 'surface-tinted-2'],
      'opaque-2': ['surface-2', 'surface-opaque-2'],
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
