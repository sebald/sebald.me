import type { SVGAttributes } from 'react';

import { type Font, glyphOf, lit, supported } from '../../foundations/bitmap';
import { px } from '../../foundations/pixel';
import type { VariantProps } from '../../utils/styles';
import { bitmapText } from './bitmap-text.styles';

/** The letters, digits and a few marks, five by seven pixels each, `#` inked */
const FONT: Font = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  C: ['.####', '#....', '#....', '#....', '#....', '#....', '.####'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.####', '#....', '#....', '#..##', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#.#.#', '#..##', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  V: ['#...#', '#...#', '#...#', '#...#', '.#.#.', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '..#..', '.#...'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  "'": ['..#..', '..#..', '.#...', '.....', '.....', '.....', '.....'],
  '-': ['.....', '.....', '.....', '.###.', '.....', '.....', '.....'],
  ':': ['.....', '.##..', '.##..', '.....', '.##..', '.##..', '.....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

/** The letters the font can draw, for the docs */
export const BITMAP_GLYPHS = supported(FONT);

const GLYPH = { width: 5, height: 7, gap: 1 } as const;

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
   * How big: `default` for a line (two stage pixels a letter pixel),
   * `large` for the word a screen is about (five)
   * @default 'default'
   */
  size?: keyof typeof SIZES;
}

/** Stage pixels a letter pixel, by size */
const SIZES = { default: 2, large: 5 } as const;

/**
 * Text in a five by seven pixel font, the way the logo's letters are
 * drawn: each letter pixel two or five stage pixels, an ink line round it,
 * a hard drop down and to the right, the top row lit and the
 * bottom two shaded. Decorative (`aria-hidden`): say it in text too.
 */
export const BitmapText = ({
  children,
  variant,
  size = 'default',
  className,
  style,
  ...props
}: BitmapTextProps) => {
  const scale = SIZES[size];
  const chars = [...children.toUpperCase()];
  // Room round the word for its ink line (one pixel) and its drop (two)
  const before = 1;
  const after = 3;
  const columns = chars.length * (GLYPH.width + GLYPH.gap) - GLYPH.gap;
  const width = columns * scale + before + after;
  const height = GLYPH.height * scale + before + after;
  const row = (y: number) =>
    y === 0 ? 'light' : y >= GLYPH.height - 2 ? 'shade' : 'main';
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
      {chars.map((char, i) => {
        const left = before + i * (GLYPH.width + GLYPH.gap) * scale;
        const at = lit(glyphOf(FONT, char)).map(({ x, y }) => ({
          x: left + x * scale,
          y: before + y * scale,
          row: y,
        }));
        return (
          <g key={i}>
            {/* The drop, then the ink line, then the letter */}
            {at.map(({ x, y }) => (
              <rect
                key={`d${x}-${y}`}
                x={x + 2}
                y={y + 2}
                width={scale + 1}
                height={scale + 1}
                className={bitmapText.ink()}
              />
            ))}
            {at.map(({ x, y }) => (
              <rect
                key={`o${x}-${y}`}
                x={x - 1}
                y={y - 1}
                width={scale + 2}
                height={scale + 2}
                className={bitmapText.ink()}
              />
            ))}
            {at.map(({ x, y, row: r }) => (
              <rect
                key={`l${x}-${y}`}
                x={x}
                y={y}
                width={scale}
                height={scale}
                className={bitmapText.letter({ row: row(r) })}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
};
