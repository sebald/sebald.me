'use client';

import { Button as Primitive } from '@base-ui/react/button';
import type { ButtonProps as PrimitiveProps } from '@base-ui/react/button';
import { cva, VariantProps } from 'cva';

export const styles = cva({
  base: [
    'inline-flex items-center justify-center rounded-full gap-0.5',
    'cursor-pointer border',
    'h-12 px-8 font-semibold',
    'transition-[box-shadow,color,transform] duration-250 ease-in-out',
    'focus-visible:focus-ring',
    'disabled:opacity-50 disabled:pointer-events-none',
  ],
  variants: {
    variant: {
      primary: [
        'bg-oatmeal-900 text-oatmeal-50 border-oatmeal-900 shadow-sm',
        'hover:bg-oatmeal-800',
        'active:scale-[0.98]',
      ],
      secondary: [
        'bg-oatmeal-200 text-oatmeal-900 border-oatmeal-300 shadow-sm',
        'hover:bg-oatmeal-300 hover:border-oatmeal-400',
        'active:scale-[0.98]',
      ],
      ghost: [
        'text-oatmeal-700 border-transparent',
        'hover:bg-oatmeal-600/10',
        'active:scale-[0.98]',
      ],
      // Used only inside cards.
      cutout: [
        'text-oatmeal-300 bg-oatmeal-700/15 border-oatmeal-950 shadow-cutout',
        'hover:bg-oatmeal-300/10',
        'active:bg-oatmeal-300/15',
      ],
      'cutout-primary': [
        'text-oatmeal-300 bg-linear-135 from-oatmeal-300/25 to-oatmeal-300/10 border-oatmeal-950 shadow-cutout',
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
