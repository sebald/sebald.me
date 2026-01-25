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
    'relative',
    'cursor-pointer',

    /* States */
    'focus-visible:focus-ring outline-none',
    'active:scale-[0.97]',
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
        'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.55),inset_0_-2px_4px_0_oklch(0_0_0/0.2),0_2px_4px_-1px_oklch(0_0_0/0.15),0_4px_6px_-1px_oklch(0_0_0/0.1)]',
      ],
      dark: [
        'text-oatmeal-100',
        '[--btn-bg:linear-gradient(to_bottom,var(--color-oatmeal-800),var(--color-oatmeal-900))]',
        '[--btn-border:linear-gradient(to_bottom,var(--color-oatmeal-600),var(--color-oatmeal-800))]',
        '[--btn-bg-hover:linear-gradient(to_bottom,var(--color-oatmeal-700),var(--color-oatmeal-800))]',
        '[--btn-border-hover:linear-gradient(to_bottom,var(--color-oatmeal-500),var(--color-oatmeal-800))]',
        'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.4),inset_0_-2px_4px_0_oklch(0_0_0/0.5),0_4px_12px_-2px_oklch(0_0_0/0.4),0_2px_4px_-1px_oklch(0_0_0/0.1)]',
      ],
      accent: [
        'text-blueberry-50',
        '[--btn-bg:linear-gradient(to_bottom,var(--color-blueberry-500),var(--color-blueberry-600))]',
        '[--btn-border:linear-gradient(to_bottom,var(--color-blueberry-400),var(--color-blueberry-700))]',
        '[--btn-bg-hover:linear-gradient(to_bottom,var(--color-blueberry-400),var(--color-blueberry-500))]',
        '[--btn-border-hover:linear-gradient(to_bottom,var(--color-blueberry-300),var(--color-blueberry-600))]',
        'shadow-[inset_0_1px_0_0_oklch(1_0_0/0.4),inset_0_-2px_4px_0_oklch(0_0_0/0.2),0_4px_12px_-2px_oklch(0_0_0/0.4),0_2px_4px_-1px_oklch(0_0_0/0.1)]',
      ],
      ghost: [
        'text-current',
        'bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.15)]',
        'hover:bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.1)]',
      ],
      icon: [
        'text-current',
        'w-11', // height is set in base
        'rounded-full',
        'hover:bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.1)]',
      ],
      outline: [
        'text-current',
        'border-[oklch(from_currentColor_l_c_h/0.4)]',
        'hover:bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.1)]',
      ],
      link: linkStyles({
        className: 'appearance-none leading-[inherit] inline w-fit',
      }),
      inherit: [
        'text-current appearance-none leading-[inherit] inline w-fit',
        'hover:text-link-hover',
      ],
    },
  },
  compoundVariants: [
    {
      variant: ['light', 'dark', 'accent', 'ghost', 'outline', 'icon'],
      className: [
        [
          'relative inline-flex items-center justify-center gap-2',
          'h-11',
          'border border-transparent rounded-full',
          'text-sm font-medium tracking-wide',
          'transition-transform duration-200',

          '[background-clip:padding-box,border-box]',
          '[background-origin:padding-box,border-box]',

          '[background-image:var(--btn-bg),var(--btn-border)]',
          'enabled:hover:[background-image:var(--btn-bg-hover),var(--btn-border-hover)]',
        ],
      ],
    },
    {
      variant: ['light', 'dark', 'accent', 'ghost', 'outline'],
      className: ['px-8'],
    },
  ],
  defaultVariants: {
    variant: 'light',
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
