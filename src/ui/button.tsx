'use client';

import { Button as Primitive } from '@base-ui/react/button';
import type { ButtonProps as PrimitiveProps } from '@base-ui/react/button';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

import { styles as linkStyles } from './link';

// Styles
// ---------------
export const styles = cva({
  base: [
    'relative inline-flex items-center justify-center gap-1.5',
    'cursor-pointer',

    /* States */
    'focus-visible:focus-ring outline-none',
    'active:scale-[0.97]',
    'disabled:cursor-default disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: ['bg-mist-600 text-mist-50', 'hover:bg-mist-700'],
      secondary: [],
      icon: ['text-current size-11 rounded-full', 'hover:bg-mist-700'],
      link: linkStyles({
        className: 'appearance-none leading-[inherit] inline w-fit',
      }),
    },
  },
  compoundVariants: [
    {
      variant: ['primary', 'secondary'],
      className: ['h-11 px-8', 'text-base font-semibold rounded-lg'],
    },
  ],
  defaultVariants: {
    variant: 'secondary',
  },
});

// Props
// ---------------
export type ButtonProps = PrimitiveProps & VariantProps<typeof styles>;

// Component
// ---------------
export const Button = ({ variant, ...props }: ButtonProps) => (
  <Primitive {...props} className={styles({ variant })} />
);
