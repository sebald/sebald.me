'use client';

import { Button as Primitive } from '@base-ui/react/button';
import type { ButtonProps as PrimitiveProps } from '@base-ui/react/button';
import { cva, VariantProps } from 'cva';

export const styles = cva({
  base: [
    'relative inline-flex items-center justify-center gap-2',
    'h-11 px-8',
    'border border-transparent rounded-full',
    'text-sm font-semibold tracking-wide',
    'cursor-pointer',
    'transition-transform duration-200',

    '[background-clip:padding-box,border-box]',
    '[background-origin:padding-box,border-box]',

    '[background-image:var(--btn-bg),var(--btn-border)]',
    'hover:[background-image:var(--btn-bg-hover),var(--btn-border-hover)]',
    'shadow-(--btn-shadow)',

    /* States */
    'focus-visible:focus-ring',
    'active:scale-[0.98]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  variants: {
    variant: {
      primary: [
        'text-oatmeal-900',
        '[--btn-bg:linear-gradient(to_bottom,var(--color-oatmeal-200),var(--color-oatmeal-300))]',
        '[--btn-border:linear-gradient(to_bottom,var(--color-oatmeal-200),var(--color-oatmeal-400))]',
        '[--btn-bg-hover:linear-gradient(to_bottom,var(--color-oatmeal-100),var(--color-oatmeal-200))]',
        '[--btn-border-hover:linear-gradient(to_bottom,var(--color-oatmeal-200),var(--color-oatmeal-400))]',
        '[--btn-shadow:inset_0_1px_0_0_oklch(1_0_0/0.55),inset_0_-2px_4px_0_oklch(from_var(--color-oatmeal-500)_l_c_h/0.1),0_2px_4px_-1px_oklch(0_0_0/0.15),0_4px_6px_-1px_oklch(0_0_0/0.1)]',
      ],
      secondary: [
        'text-oatmeal-100',
        '[--btn-bg:linear-gradient(135deg,var(--color-oatmeal-800),var(--color-oatmeal-900))]',
        '[--btn-border:linear-gradient(135deg,var(--color-oatmeal-600),var(--color-oatmeal-800))]',
        '[--btn-bg-hover:linear-gradient(135deg,var(--color-oatmeal-700),var(--color-oatmeal-800))]',
        '[--btn-border-hover:linear-gradient(135deg,var(--color-oatmeal-400),var(--color-oatmeal-600))]',
        '[--btn-shadow:inset_0_1px_0_0_oklch(1_0_0/0.25),inset_0_-1px_1px_0_oklch(0_0_0/0.5),0_4px_12px_-2px_oklch(0_0_0/0.5),0_2px_4px_-1px_oklch(0_0_0/0.3)]',
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
