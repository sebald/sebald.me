import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// Styles
// ---------------
export const styles = cva({
  base: ['rounded-3xl p-6 flex flex-col gap-5'],
  variants: {
    variant: {
      dark: ['panel', 'panel-dark'],
      clear: ['panel', 'panel-clear'],
      ghost: ['panel', 'panel-ghost'],
      tinted: ['panel', 'panel-tinted'],
      opaque: ['panel', 'panel-opaque'],
    },
  },
  defaultVariants: {
    variant: 'dark',
  },
});

// Props
// ---------------
export interface CardProps
  extends PropsWithChildren,
    VariantProps<typeof styles> {}

// Component
// ---------------
export const Card = ({ children, variant }: CardProps) => (
  <div className={styles({ variant })}>{children}</div>
);
