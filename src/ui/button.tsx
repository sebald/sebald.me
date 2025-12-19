'use client';

import { Button as Primitive } from '@base-ui/react/button';
import type { ButtonProps as PrimitiveProps } from '@base-ui/react/button';
import { cva, VariantProps } from 'cva';

export const styles = cva({
  base: 'rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2',
  variants: {
    variant: {
      primary: 'bg-black text-white hover:bg-gray-800 focus:ring-gray-900',
      secondary:
        'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});

export type ButtonProps = PrimitiveProps & VariantProps<typeof styles>;

export const Button = ({ variant, ...props }: ButtonProps) => (
  <Primitive {...props} className={styles({ variant })} />
);
