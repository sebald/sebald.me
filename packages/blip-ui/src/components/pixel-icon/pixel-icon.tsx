import { FLOOR, px } from '../../foundations/pixel';
import { cn } from '../../utils/styles';
import { ICONS, ICON_COLOURS, type IconName } from './icons';

/** A pixel of an icon in `FLOOR` pixels (never finer than `--bui-min-px`), as fine as a stopwatch's */
export const DOT = 2 / 3;

export interface PixelIconProps {
  /** Which icon, by name (`ICONS`) */
  icon: IconName;
  /**
   * CSS pixels per icon pixel, for a bar sized for a thumb (the tall
   * stage's); without it an icon pixel is `DOT` of a stage pixel
   */
  dot?: number;
  className?: string;
}

/**
 * A pixel-art icon at the stage's pixels, or at a size in CSS pixels where
 * the controls are sized for a thumb. Decorative: the button around it
 * carries the name.
 */
export const PixelIcon = ({ icon, dot, className }: PixelIconProps) => {
  const rows = ICONS[icon];
  const size = (n: number) =>
    dot === undefined ? px(n * DOT, FLOOR) : `${Math.round(n * dot)}px`;
  return (
    <svg
      aria-hidden
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
