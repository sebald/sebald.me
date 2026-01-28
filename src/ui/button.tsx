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
    'transition-all duration-150',

    /* States */
    'focus-visible:focus-ring outline-none',
    'active:scale-[0.97]',
    'disabled:cursor-default disabled:opacity-40',
  ],
  variants: {
    variant: {
      primary: ['bg-mist-100 text-mist-800 font-medium', 'hover:bg-mist-50'],
      secondary: ['bg-mist-500/25 text-mist-200', 'hover:bg-mist-500/50'],
      icon: [
        'size-11 rounded-full',
        'bg-mist-800 text-mist-500',
        'hover:bg-mist-500/50 hover:text-mist-50',
      ],
      link: linkStyles({
        variant: 'inherit',
        className: 'appearance-none w-fit',
      }),
    },
  },
  compoundVariants: [
    {
      variant: ['primary', 'secondary'],
      className: ['h-11 px-6', 'text-base rounded-xl'],
    },
    {
      variant: ['primary', 'secondary', 'link'],
      className: ['[&_svg]:size-4'],
    },
    {
      variant: ['icon'],
      className: ['[&_svg]:size-5'],
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
