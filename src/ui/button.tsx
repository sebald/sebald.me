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
    'enabled:hover:[background-image:var(--btn-bg-hover),var(--btn-border-hover)]',
    'enabled:shadow-(--btn-shadow)',

    /* States */
    'focus-visible:focus-ring',
    'active:scale-[0.98]',
    'disabled:cursor-default disabled:opacity-50',
  ],
  variants: {
    variant: {
      light: [
        'text-oatmeal-900',
        '[--btn-bg:linear-gradient(to_bottom,var(--color-oatmeal-200),var(--color-oatmeal-300))]',
        '[--btn-border:linear-gradient(to_bottom,var(--color-oatmeal-200),var(--color-oatmeal-400))]',
        '[--btn-bg-hover:linear-gradient(to_bottom,var(--color-oatmeal-100),var(--color-oatmeal-200))]',
        '[--btn-border-hover:linear-gradient(to_bottom,var(--color-oatmeal-200),var(--color-oatmeal-400))]',
        '[--btn-shadow:inset_0_1px_0_0_oklch(1_0_0/0.55),inset_0_-2px_4px_0_oklch(0_0_0/0.2),0_2px_4px_-1px_oklch(0_0_0/0.15),0_4px_6px_-1px_oklch(0_0_0/0.1)]',
      ],
      dark: [
        'text-oatmeal-100',
        '[--btn-bg:linear-gradient(to_bottom,var(--color-oatmeal-800),var(--color-oatmeal-900))]',
        '[--btn-border:linear-gradient(to_bottom,var(--color-oatmeal-600),var(--color-oatmeal-800))]',
        '[--btn-bg-hover:linear-gradient(to_bottom,var(--color-oatmeal-700),var(--color-oatmeal-800))]',
        '[--btn-border-hover:linear-gradient(to_bottom,var(--color-oatmeal-500),var(--color-oatmeal-800))]',
        '[--btn-shadow:inset_0_1px_0_0_oklch(1_0_0/0.4),inset_0_-2px_4px_0_oklch(0_0_0/0.5),0_4px_12px_-2px_oklch(0_0_0/0.4),0_2px_4px_-1px_oklch(0_0_0/0.1)]',
      ],
      ghost: [
        'text-current border-transparent opacity-70',
        'hover:bg-oatmeal-500/15 hover:opacity-100',
        'active:bg-oatmeal-500/25',
      ],
      highlight: [
        'text-blueberry-50',
        '[--btn-bg:linear-gradient(to_bottom,var(--color-blueberry-500),var(--color-blueberry-600))]',
        '[--btn-border:linear-gradient(to_bottom,var(--color-blueberry-400),var(--color-blueberry-700))]',
        '[--btn-bg-hover:linear-gradient(to_bottom,var(--color-blueberry-400),var(--color-blueberry-500))]',
        '[--btn-border-hover:linear-gradient(to_bottom,var(--color-blueberry-300),var(--color-blueberry-600))]',
        '[--btn-shadow:inset_0_1px_0_0_oklch(1_0_0/0.4),inset_0_-2px_4px_0_oklch(0_0_0/0.2),0_4px_12px_-2px_oklch(0_0_0/0.4),0_2px_4px_-1px_oklch(0_0_0/0.1)]',
      ],
    },
  },
  defaultVariants: {
    variant: 'light',
  },
});

export type ButtonProps = PrimitiveProps & VariantProps<typeof styles>;

export const Button = ({ variant, ...props }: ButtonProps) => (
  <Primitive {...props} className={styles({ variant })} />
);
