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
      primary: [
        'bg-oatmeal-900 text-oatmeal-50',
        'hover:bg-oatmeal-800',
        'active:scale-[0.98]',
      ],
      secondary: [
        'bg-oatmeal-200 text-oatmeal-900',
        'hover:bg-oatmeal-300 hover:border-oatmeal-400',
        'active:scale-[0.98]',
      ],
      ghost: [
        'text-oatmeal-700',
        'hover:bg-oatmeal-600/10',
        'active:scale-[0.98]',
      ],
      // Used only inside cards.
      glass: [
        'text-oatmeal-950 bg-linear-145 from-oatmeal-50/85 to-oatmeal-100/75',
        'border border-x-oatmeal-50/40 border-t-[oklch(1_0_0/0.8)] border-b-oatmeal-200/40',
        'backdrop-blur-md h-[43px]',
        'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.7),inset_0_0_12px_oklch(1_0_0/0.2),0_4px_10px_-2px_oklch(0_0_0/0.1),0_2px_4px_-2px_oklch(0_0_0/0.1)]',
      ],
      cutout: [
        'text-oatmeal-300 bg-oatmeal-700/15 border border-oatmeal-950 shadow-cutout',
        'hover:bg-oatmeal-300/10',
        'active:bg-oatmeal-300/15',
      ],
      'cutout-primary': [
        'text-oatmeal-300 bg-linear-135 from-oatmeal-300/20 to-oatmeal-300/10 border border-oatmeal-950 shadow-cutout',
        'hover:bg-oatmeal-300/5',
        'active:bg-oatmeal-300/10',
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
