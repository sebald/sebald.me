import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// TODO: create utitlies to set classes directly instead of "knowing" the css var for surface (buttons too)
export const styles = cva({
  base: ['rounded-3xl p-6 flex flex-col gap-5'],
  variants: {
    variant: {
      dark: ['surface', 'surface-dark'],
      clear: ['surface', 'surface-clear'],
      ghost: ['surface', 'surface-ghost'],
      tinted: ['surface', 'surface-tinted'],
      opaque: ['surface', 'surface-opaque'],
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
});

export interface CardProps
  extends PropsWithChildren,
    VariantProps<typeof styles> {}

export const Card = ({ children, variant }: CardProps) => (
  <div className={styles({ variant })}>{children}</div>
);
