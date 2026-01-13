import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// Styles
// ---------------
export const styles = cva({
  base: ['rounded-3xl flex flex-col gap-5'],
  variants: {
    variant: {
      dark: ['panel', 'panel-dark'],
      clear: ['panel', 'panel-clear'],
      ghost: ['panel', 'panel-ghost'],
      tinted: ['panel', 'panel-tinted'],
      opaque: ['panel', 'panel-opaque'],
    },
    inset: {
      none: '',
      tight: 'p-2',
      snug: 'p-4',
      normal: 'p-6',
      relaxed: 'p-8',
    },
  },
  defaultVariants: {
    variant: 'dark',
    inset: 'normal',
  },
});

// Props
// ---------------
export interface CardProps
  extends PropsWithChildren,
    VariantProps<typeof styles> {}

// Component
// ---------------
export const Card = ({ children, variant, inset }: CardProps) => (
  <div className={styles({ variant, inset })}>{children}</div>
);
