'use client';

import { Button as Primitive } from '@base-ui/react/button';
import type { ButtonProps as PrimitiveProps } from '@base-ui/react/button';
import { cva, VariantProps } from 'cva';

export const styles = cva({
  base: [
    'inline-flex items-center justify-center rounded-full gap-0.5',
    'cursor-pointer',
    'h-11 px-8 font-semibold',
    'transition-[box-shadow,color,transform] duration-250 ease-in-out',
    'focus-visible:focus-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  variants: {
    variant: {
      recessed: [
        'text-oatmeal-300 bg-oatmeal-700/15 border border-oatmeal-950',
        'shadow-[0_1px_0_0_oklch(from_var(--color-oatmeal-400)_l_c_h/0.2),inset_0_1px_0_0_oklch(from_var(--color-oatmeal-400)_l_c_h/0.15),inset_0_-1px_0_0_oklch(from_var(--color-oatmeal-950)_l_c_h/0.6)]',
        'hover:bg-oatmeal-300/10',
        'active:bg-oatmeal-300/15',
      ],
      'recessed-primary': [
        'text-oatmeal-300 bg-linear-135 from-oatmeal-300/20 to-oatmeal-300/10 border border-oatmeal-950',
        'shadow-[0_1px_0_0_oklch(from_var(--color-oatmeal-400)_l_c_h/0.2),inset_0_1px_0_0_oklch(from_var(--color-oatmeal-400)_l_c_h/0.15),inset_0_-1px_0_0_oklch(from_var(--color-oatmeal-950)_l_c_h/0.6)]',
        'hover:bg-oatmeal-300/5',
        'active:bg-oatmeal-300/10',
      ],
    },
  },
  defaultVariants: {
    variant: 'recessed',
  },
});

export type ButtonProps = PrimitiveProps & VariantProps<typeof styles>;

export const Button = ({ variant, ...props }: ButtonProps) => (
  <Primitive {...props} className={styles({ variant })} />
);
