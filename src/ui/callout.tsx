import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// Styles
// ---------------
const styles = cva({
  base: ['rounded-lg border', 'px-4 py-3', 'text-sm'],
  variants: {
    variant: {
      note: 'border-mist-700/30 bg-mist-800/30 text-mist-300',
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
  extends PropsWithChildren,
    VariantProps<typeof styles> {}

// Component
// ---------------
export const Callout = ({ children, variant }: CalloutProps) => (
  <aside className={styles({ variant })}>{children}</aside>
);
