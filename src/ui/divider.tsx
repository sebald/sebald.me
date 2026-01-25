import { cva, type VariantProps } from 'cva';
import type { CSSProperties } from 'react';

// Styles
// ---------------
const style = cva({
  base: ['rounded-[1px]'],
  variants: {
    variant: {
      default: 'bg-mist-700',
    },
    orientation: {
      horizontal: 'h-px w-[calc(100%-var(--inset)*2)] mx-auto',
      vertical: 'w-px h-[calc(100%-var(--inset)*2)] min-h-4 my-auto',
    },
  },
  defaultVariants: {
    variant: 'default',
    orientation: 'horizontal',
  },
});

// Props
// ---------------
interface DividerProps extends VariantProps<typeof style> {
  inset?: string | number;
}

// Component
// ---------------
export const Divider = ({ variant, orientation, inset = 0 }: DividerProps) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={style({ variant, orientation })}
    style={{ '--inset': `calc(var(--spacing) * ${inset})` } as CSSProperties}
  />
);
