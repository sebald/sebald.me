import { cva, type VariantProps } from 'cva';
import type { CSSProperties } from 'react';

// Styles
// ---------------
const style = cva({
  base: ['rounded-[1px]'],
  variants: {
    variant: {
      light:
        'bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.1)]',
      default:
        'bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.2)]',
    },
    orientation: {
      horizontal: 'h-0.5 w-[calc(100%-var(--inset)*2)] mx-auto',
      vertical: 'w-0.5 h-[calc(100%-var(--inset)*2)] min-h-4 my-auto',
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
