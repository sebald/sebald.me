import { cva, type VariantProps } from 'cva';

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
      horizontal: 'h-0.5 w-full',
      vertical: 'w-0.5 h-full min-h-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    orientation: 'horizontal',
  },
});

// Props
// ---------------
interface DividerProps extends VariantProps<typeof style> {}

// Component
// ---------------
export const Divider = ({ variant, orientation }: DividerProps) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={style({ variant, orientation })}
  />
);
