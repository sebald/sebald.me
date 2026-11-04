'use client';

import type { ButtonHTMLAttributes } from 'react';

import { CORNERS, rounded } from '../../foundations/corners';
import type { VariantProps } from '../../utils/styles';
import { button } from './button.styles';

type Variants = VariantProps<typeof button.root>;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The action's weight: `primary` for the one action a screen is for,
   * `secondary` beside it, `destructive` for what can't be undone
   * @default 'primary'
   */
  variant?: NonNullable<Variants['variant']>;
  /**
   * `default` is a thumb's height (44 CSS pixels); `small` only where a
   * pointer aims
   * @default 'default'
   */
  size?: NonNullable<Variants['size']>;
}

/**
 * A pixel button, for the actions a screen offers outside its menus:
 * stepped corners like the windows', `primary` for the main action,
 * `secondary` beside it and `destructive` for what can't be undone.
 * Sized in the stage's pixel (`--px`), never finer than 3 CSS pixels.
 */
export const Button = ({
  variant,
  size,
  className,
  style,
  children,
  ...props
}: ButtonProps) => {
  // The outline's face rounds its own corners a step in, or it would
  // square the frame's
  const framed = variant === 'secondary';
  return (
    <button
      type="button"
      className={button.root({ variant, size, className })}
      style={{ clipPath: rounded(CORNERS[0], '--b-px'), ...style }}
      {...props}
    >
      <span
        className={button.ring()}
        style={{ clipPath: rounded(CORNERS[1], '--b-px') }}
      >
        <span
          className={button.face()}
          style={
            framed ? { clipPath: rounded(CORNERS[2], '--b-px') } : undefined
          }
        >
          {children}
        </span>
      </span>
    </button>
  );
};
