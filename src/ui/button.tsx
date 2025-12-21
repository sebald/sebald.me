'use client';

import { Button as Primitive } from '@base-ui/react/button';
import type { ButtonProps as PrimitiveProps } from '@base-ui/react/button';
import { cva, VariantProps } from 'cva';

export const styles = cva({
  base: [
    'inline-flex items-center justify-center rounded-full gap-0.5',
    'cursor-pointer border',
    'h-11 px-8 font-semibold',
    'transition-all ease-in-out',
    'focus-visible:focus-ring',
    'active:scale-[0.98]',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  variants: {
    variant: {
      primary: [
        'bg-linear-135 from-oatmeal-200 to-oatmeal-300 text-oatmeal-950',
        'border-t-oatmeal-200 border-l-oatmeal-200 border-r-oatmeal-400 border-b-oatmeal-400',
        'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.6),inset_0_-2px_4px_0_oklch(from_var(--color-oatmeal-500)_l_c_h/0.1),0_2px_4px_-1px_oklch(0_0_0/0.15),0_4px_6px_-1px_oklch(0_0_0/0.1)]',
        'hover:from-oatmeal-100 hover:to-oatmeal-200 hover:border-oatmeal-300',
      ],
      secondary: [
        'bg-oatmeal-200 text-oatmeal-900',
        'hover:bg-oatmeal-300 hover:border-oatmeal-400',
      ],
      ghost: [
        'text-current border-transparent opacity-70',
        'hover:bg-oatmeal-500/15 hover:opacity-100',
        'active:bg-oatmeal-500/25',
      ],
      highlight: [
        'bg-linear-135 from-blueberry-500 to-blueberry-600 text-blueberry-50',
        'border-t-blueberry-400 border-l-blueberry-400 border-r-blueberry-700 border-b-blueberry-700',
        'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.2),inset_0_-2px_4px_0_oklch(from_var(--color-blueberry-900)_l_c_h/0.4),0_2px_4px_-1px_oklch(from_var(--color-blueberry-900)_l_c_h/0.3),0_4px_6px_-1px_oklch(from_var(--color-blueberry-900)_l_c_h/0.2)]',
        'hover:from-blueberry-400 hover:to-blueberry-500 hover:border-x-blueberry-600 hover:border-b-blueberry-600 hover:border-t-blueberry-300',
      ],
    },
  },
  defaultVariants: {
    variant: 'secondary',
  },
});

export type ButtonProps = PrimitiveProps & VariantProps<typeof styles>;

export const Button = ({ variant, ...props }: ButtonProps) => (
  <Primitive {...props} className={styles({ variant })} />
);
