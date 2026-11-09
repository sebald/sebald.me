import type { HTMLAttributes } from 'react';

import { FLOOR, px } from '../../foundations/pixel';
import type { VariantProps } from '../../utils/styles';
import { meter } from './meter.styles';

type Variants = VariantProps<typeof meter.root>;

/** One cell by size, in stage pixels */
const CELL = {
  default: { width: 4, height: 6 },
  compact: { width: 3, height: 6 },
} as const;

export interface MeterProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children'
> {
  /** Cells lit; whole cells only, clamped to `0..max` */
  value: number;
  /** Cells in all */
  max: number;
  /**
   * The lit cells' colour ramp
   * @default 'primary'
   */
  variant?: NonNullable<Variants['variant']>;
  /**
   * The cells' size: `compact` fits a long pool where room is short
   * @default 'default'
   */
  size?: NonNullable<Variants['size']>;
  /**
   * Blink the lit cells, between their colour and its light, at the
   * arcade rhythm: a full pool asking to be used. Steady under reduced
   * motion
   * @default false
   */
  blink?: boolean;
}

/**
 * A row of boxes, `value` of `max` lit and the rest empty and dithered:
 * how much of a pool is collected. Whole cells only, drawn in the stage's
 * pixel with an ink line round each. Give it an accessible name
 * (`aria-label`) so a screen reader knows what is measured.
 */
export const Meter = ({
  value,
  max,
  variant,
  size = 'default',
  blink = false,
  className,
  ...props
}: MeterProps) => {
  const lit = Math.max(0, Math.min(max, Math.round(value)));
  return (
    // The native <meter> can't hold the cells, so the role it is
    <span
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="meter"
      data-slot="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={lit}
      aria-valuetext={`${lit} of ${max}`}
      className={meter.root({ variant, size, className })}
      {...props}
    >
      {Array.from({ length: max }, (_, i) => {
        const on = i < lit;
        return (
          <span
            key={i}
            aria-hidden
            className={meter.cell({
              state: on ? 'lit' : 'empty',
            })}
            style={{
              width: px(CELL[size].width, FLOOR),
              height: px(CELL[size].height, FLOOR),
            }}
          >
            {!on && <span className={meter.dots()} />}
            {on && blink && <span className={meter.flash()} />}
          </span>
        );
      })}
    </span>
  );
};
