import type { CSSProperties, SVGAttributes } from 'react';

import { px } from '../../foundations/pixel';
import type { VariantProps } from '../../utils/styles';
import { bitmapTextLayout } from './bitmap-text.layout';
import { bitmapText } from './bitmap-text.styles';

export { BITMAP_GLYPHS } from './bitmap-text.layout';

type Variants = VariantProps<typeof bitmapText.root>;

export interface BitmapTextProps extends Omit<
  SVGAttributes<SVGSVGElement>,
  'children'
> {
  /** What it says: letters from `BITMAP_GLYPHS` and spaces, upper-cased; any other character is left blank */
  children: string;
  /**
   * The colour ramp: the top row lit, the bottom two shaded
   * @default 'primary'
   */
  variant?: NonNullable<Variants['variant']>;
  /**
   * How big: `small` for a line on the wide stage, where the stage
   * pixel is large (one stage pixel a letter pixel), `default` for a
   * line (two),
   * `medium` for a screen's title on the tall stage, where the stage
   * pixel is small (three), `large` for the word a screen is about (five)
   * @default 'default'
   */
  size?: keyof typeof SIZES;
}

/** Stage pixels a letter pixel, by size */
const SIZES = { small: 1, default: 2, medium: 3, large: 5 } as const;

/**
 * Text in a five by seven pixel font, the way the logo's letters are
 * drawn: each letter pixel one, two, three or five stage pixels, an ink line round it,
 * a hard drop down and to the right, the top row lit and the
 * bottom two shaded. Each letter is a group (`data-slot="bitmap-letter"`)
 * with its place in `--i`, to animate them one by one. Decorative
 * (`aria-hidden`): say it in text too.
 */
export const BitmapText = ({
  children,
  variant,
  size = 'default',
  className,
  style,
  ...props
}: BitmapTextProps) => {
  const { width, height, letters } = bitmapTextLayout(children, SIZES[size]);
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      data-slot="bitmap-text"
      className={bitmapText.root({ variant, className })}
      style={{ width: px(width), height: px(height), ...style }}
      {...props}
    >
      {letters.map((parts, i) => (
        // Each letter its own group, its place in `--i`, so a letter can
        // move on its own: `[&>[data-slot=bitmap-letter]]` and a delay of
        // `calc(var(--i) * 90ms)`. The drop, the ink line, then the letter
        <g
          key={i}
          data-slot="bitmap-letter"
          style={{ '--i': i } as CSSProperties}
        >
          {parts.map(({ x, y, width: w, height: h, part }) => (
            <rect
              key={`${part}${x}-${y}-${w}`}
              x={x}
              y={y}
              width={w}
              height={h}
              className={
                part === 'ink'
                  ? bitmapText.ink()
                  : bitmapText.letter({ row: part })
              }
            />
          ))}
        </g>
      ))}
    </svg>
  );
};
