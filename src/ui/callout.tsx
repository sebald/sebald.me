import type { PropsWithChildren } from 'react';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
const styles = cva({
  base: ['rounded-lg border', 'p-6', 'text-sm leading-relaxed'],
  variants: {
    variant: {
      note: 'border-indigo-700/30 bg-indigo-950/30 text-indigo-300',
      info: 'border-blue-700/30 bg-blue-950/30 text-blue-300',
      warning: 'border-yellow-700/30 bg-yellow-950/30 text-yellow-300',
      success: 'border-green-700/30 bg-green-950/30 text-green-300',
      danger: 'border-red-700/30 bg-red-950/30 text-red-300',
    },
  },
  defaultVariants: {
    variant: 'note',
  },
});

const titleStyles = cva({
  base: 'mb-6 block font-semibold',
  variants: {
    variant: {
      note: 'text-indigo-200',
      info: 'text-blue-200',
      warning: 'text-yellow-200',
      success: 'text-green-200',
      danger: 'text-red-200',
    },
  },
  defaultVariants: {
    variant: 'note',
  },
});

// Props
// ---------------
export interface CalloutProps
  extends PropsWithChildren, VariantProps<typeof styles> {
  title?: React.ReactNode;
  className?: string;
}

// Component
// ---------------
export const Callout = ({
  children,
  variant,
  title,
  className,
}: CalloutProps) => (
  <aside className={styles({ variant, className })}>
    {title && <strong className={titleStyles({ variant })}>{title}</strong>}
    {children}
  </aside>
);
