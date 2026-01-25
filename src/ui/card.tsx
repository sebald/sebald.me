import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// Styles
// ---------------
export const styles = cva({
  base: ['ui-panel'],
  variants: {
    inset: {
      none: '',
      tight: 'p-2',
      snug: 'p-4',
      normal: 'p-6',
      relaxed: 'p-8',
    },
  },
  defaultVariants: {
    inset: 'normal',
  },
});

// Props
// ---------------
export interface CardProps
  extends PropsWithChildren, VariantProps<typeof styles> {}

// Component
// ---------------
export const Card = ({ children, inset }: CardProps) => (
  <div className={styles({ inset })}>{children}</div>
);
