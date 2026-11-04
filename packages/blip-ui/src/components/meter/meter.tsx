import type { HTMLAttributes } from 'react';

import { px } from '../../foundations/pixel';
import type { VariantProps } from '../../utils/styles';
import { meter } from './meter.styles';

type Variants = VariantProps<typeof meter.root>;

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
  tone?: NonNullable<Variants['tone']>;
  /**
   * One cell, in stage pixels
   * @default { width: 4, height: 6 }
   */
  cell?: { width: number; height: number };
  /**
   * Every lit cell in the light colour, for a full meter blinking
   * @default false
   */
  bright?: boolean;
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
  tone,
  cell = { width: 4, height: 6 },
  bright = false,
  className,
  ...props
}: MeterProps) => {
  const lit = Math.max(0, Math.min(max, Math.round(value)));
  return (
    // The native <meter> can't hold the cells, so the role it is
    <span
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={lit}
      aria-valuetext={`${lit} of ${max}`}
      className={meter.root({ tone, className })}
      {...props}
    >
      {Array.from({ length: max }, (_, i) => {
        const on = i < lit;
        return (
          <span
            key={i}
            aria-hidden
            className={meter.cell({
              state: on ? (bright ? 'bright' : 'lit') : 'empty',
            })}
            style={{ width: px(cell.width), height: px(cell.height) }}
          >
            {!on && <span className={meter.dots()} />}
          </span>
        );
      })}
    </span>
  );
};
