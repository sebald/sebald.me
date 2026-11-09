'use client';

import { useContext } from 'react';

import { DOT, FLOOR, px } from '../../foundations/pixel';
import { cn } from '../../utils/styles';
import { ControlsLayout } from '../controls/controls';
import { ICONS, ICON_COLOURS, type IconName } from './icons';

/** CSS pixels per icon pixel on the tall stage's bar, where a thumb sets the size */
const BAR_DOT = 1.5;

export interface PixelIconProps {
  /** Which icon, by name (`ICONS`) */
  icon: IconName;
  className?: string;
}

/**
 * A pixel-art icon at the stage's pixels: an icon pixel is `DOT` of a
 * stage pixel. On the tall stage's bar of controls, where a thumb sets the
 * size, it is 1.5 CSS pixels instead; the bar tells it. Decorative: the
 * button around it carries the name.
 */
export const PixelIcon = ({ icon, className }: PixelIconProps) => {
  const rows = ICONS[icon];
  const bar = useContext(ControlsLayout) === 'bar';
  const size = (n: number) =>
    bar ? `${Math.round(n * BAR_DOT)}px` : px(n * DOT, FLOOR);
  return (
    <svg
      aria-hidden
      data-slot="pixel-icon"
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      className={cn('block shrink-0', className)}
      style={{ width: size(rows[0].length), height: size(rows.length) }}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              style={{ fill: ICON_COLOURS[cell] }}
            />
          ),
        ),
      )}
    </svg>
  );
};
