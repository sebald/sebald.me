'use client';

import type { ButtonHTMLAttributes } from 'react';

import { CORNERS, rounded } from '../../foundations/corners';
import { button } from './button.styles';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The action's weight: `primary` for the one action a screen is for,
   * `secondary` beside it, `destructive` for what can't be undone
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'destructive';
  /**
   * `default` is a thumb's height (44 CSS pixels); `small` only where a
   * pointer aims
   * @default 'default'
   */
  size?: 'default' | 'small';
}

/**
 * A pixel button, for the actions a screen offers outside its menus: a
 * key with stepped corners like the windows', `primary` for the main
 * action, `secondary` beside it and `destructive` for what can't be undone.
 * Focused, the menus' cursor points at it from the left.
 * Sized in the stage's pixel (`--px`), never finer than 3 CSS pixels.
 */
export const Button = ({
  variant,
  size,
  className,
  style,
  children,
  ...props
}: ButtonProps) => (
  <button
    type="button"
    data-slot="button"
    className={button.root({ variant, size, className })}
    style={style}
    {...props}
  >
    {/* The ink and the key in spans: the button itself is not clipped, so
        the focus cursor beside it shows */}
    <span
      className={button.ink()}
      style={{ clipPath: rounded(CORNERS[0], '--b-px') }}
    >
      <span
        className={button.face()}
        style={{ clipPath: rounded(CORNERS[1], '--b-px') }}
      >
        {children}
      </span>
    </span>
  </button>
);
