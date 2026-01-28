import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

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

// Props
// ---------------
export interface CalloutProps
  extends PropsWithChildren, VariantProps<typeof styles> {
  title?: React.ReactNode;
}

// Component
// ---------------
export const Callout = ({ children, variant, title }: CalloutProps) => (
  <aside className={styles({ variant })}>
    {title && <strong className="mb-6 block font-semibold">{title}</strong>}
    {children}
  </aside>
);
