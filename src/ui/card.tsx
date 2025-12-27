import type { VariantProps } from 'cva';
import { cva } from 'cva';
import type { PropsWithChildren } from 'react';

// TODO: create utitlies to set classes directly instead of "knowing" the css var for surface (buttons too)
export const styles = cva({
  base: ['rounded-3xl p-6 flex flex-col gap-5'],
  variants: {
    variant: {
      default: ['surface'],
      clear: ['surface-clear'],
      ghost: ['surface-ghost'],
      tinted: ['surface-tinted'],
      opaque: ['surface-opaque'],
      'default-2': [
        'surface-2',
        'surface-bg-[linear-gradient(135deg,oklch(from_var(--color-oatmeal-900)_l_c_h_/_0.8),oklch(from_var(--color-oatmeal-950)_l_c_h_/_0.9))]',
        'surface-blur-[blur(20px)]',
        'surface-border-[oklch(from_var(--color-oatmeal-700)_l_c_h_/_0.6)]',
        'surface-edge-[oklch(from_var(--color-oatmeal-500)_l_c_h_/_0.6)]',
        'surface-highlight-[oklch(from_var(--color-oatmeal-200)_l_c_h_/_0.1)]',
        'surface-inner-shadow-[oklch(from_var(--color-oatmeal-950)_l_c_h_/_0.3)]',
        'surface-shadow-[oklch(from_var(--color-oatmeal-950)_l_c_h_/_0.09)]',
        'surface-text-[var(--color-oatmeal-200)]',
      ],
      'clear-2': [
        'surface-2',
        'surface-bg-[linear-gradient(135deg,oklch(1_0_0_/_0.45),oklch(1_0_0_/_0.15))]',
        'surface-blur-[blur(12px)]',
        'surface-border-[oklch(1_0_0_/_0.8)]',
        'surface-edge-[oklch(1_0_0_/_0.9)]',
        'surface-highlight-[oklch(1_0_0_/_1)]',
        'surface-inner-shadow-[transparent]',
        'surface-shadow-[oklch(from_var(--color-oatmeal-900)_l_c_h_/_0.06)]',
        'surface-text-[var(--color-oatmeal-700)]',
      ],
      'ghost-2': [
        'surface-2',
        'surface-bg-[linear-gradient(135deg,oklch(from_var(--color-oatmeal-800)_l_c_h_/_0.35),oklch(from_var(--color-oatmeal-950)_l_c_h_/_0.5))]',
        'surface-blur-[blur(40px)]',
        'surface-border-[oklch(from_var(--color-oatmeal-300)_l_c_h_/_0.1)]',
        'surface-edge-[transparent]',
        'surface-highlight-[transparent]',
        'surface-inner-shadow-[transparent]',
        'surface-shadow-[oklch(from_var(--color-oatmeal-900)_l_c_h_/_0.06)]',
        'surface-text-[var(--color-oatmeal-50)]',
      ],
      'tinted-2': [
        'surface-2',
        'surface-bg-[linear-gradient(135deg,oklch(from_var(--color-oatmeal-600)_l_c_h_/_0.65),oklch(from_var(--color-oatmeal-800)_l_c_h_/_0.75))]',
        'surface-blur-[blur(12px)]',
        'surface-border-[oklch(from_var(--color-oatmeal-600)_l_c_h_/_0.5)]',
        'surface-edge-[oklch(from_var(--color-oatmeal-400)_l_c_h_/_0.4)]',
        'surface-highlight-[oklch(from_var(--color-oatmeal-100)_l_c_h_/_0.15)]',
        'surface-inner-shadow-[transparent]',
        'surface-shadow-[oklch(from_var(--color-oatmeal-800)_l_c_h_/_0.11)]',
        'surface-text-[var(--color-oatmeal-100)]',
      ],
      'opaque-2': [
        'surface-2',
        'surface-bg-[linear-gradient(145deg,oklch(from_var(--color-oatmeal-800)_l_c_h_/_0.95)_0%,oklch(from_var(--color-oatmeal-950)_l_c_h_/_1)_100%)]',
        'surface-blur-[blur(4px)]',
        'surface-border-[oklch(from_var(--color-oatmeal-900)_l_c_h)]',
        'surface-edge-[transparent]',
        'surface-highlight-[oklch(1_0_0_/_0.25)]',
        'surface-inner-shadow-[oklch(from_var(--color-oatmeal-500)_l_c_h_/_0.1)]',
        'surface-shadow-[oklch(0_0_0_/_0.15)]',
        'surface-text-[var(--color-oatmeal-300)]',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps
  extends PropsWithChildren,
    VariantProps<typeof styles> {}

export const Card = ({ children, variant }: CardProps) => (
  <div className={styles({ variant })}>{children}</div>
);
