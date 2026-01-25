import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// Styles
// ---------------
export const styles = cva({
  base: [
    'relative w-96 backdrop-blur-2xl bg-linear-to-b from-white/20 to-white/5 border border-white/40 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden group hover:bg-white/20 transition-colors duration-500',
  ],
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
