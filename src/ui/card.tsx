import type { PropsWithChildren } from 'react';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

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
  extends PropsWithChildren, VariantProps<typeof styles> {
  className?: string;
}

// Component
// ---------------
export const Card = ({ children, inset, className }: CardProps) => (
  <div className={styles({ inset, className })}>{children}</div>
);
