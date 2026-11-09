import { type Font, glyphOf, lit, supported } from '../../foundations/bitmap';

/**
 * BitmapText's drawing as data: the font, and a word laid out as the
 * rectangles it is made of, in the order they are drawn. The component
 * renders them as SVG; `drawBitmapText` paints them on a canvas, for a
 * picture made outside the page (a result card to save), so both draw
 * the same letters.
 */

/** The letters, digits and a few marks, five by seven pixels each, `#` inked */
export const FONT: Font = {
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
  '/': ['....#', '....#', '...#.', '..#..', '.#...', '#....', '#....'],
  '&': ['.##..', '#..#.', '#.#..', '.#...', '#.#.#', '#..#.', '.##.#'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};

/** The letters the font can draw, for the docs */
export const BITMAP_GLYPHS = supported(FONT);

/** Characters drawn as another: the dashes of a range or score (`23–9`) as the hyphen */
const ALIASES: Readonly<Record<string, string>> = { '–': '-', '—': '-' };

export const GLYPH = { width: 5, height: 7, gap: 1 } as const;

/** Room round the word: its ink line (one pixel) all round, its drop (two) below and right */
const INK = 1;
const ROOM = INK * 2 + 2;

/** What a rectangle is: the ink (the drop and the line) or a row of the letter */
export type BitmapPart = 'ink' | 'light' | 'main' | 'shade';

export interface BitmapRect {
  x: number;
  y: number;
  width: number;
  height: number;
  part: BitmapPart;
  /** The letter it belongs to, by place */
  letter: number;
}

export interface BitmapLayout {
  width: number;
  height: number;
  /** The rectangles by letter, one group a character (a space's empty) */
  letters: BitmapRect[][];
}

/** A word's box at `scale`, without laying out its letters */
export const bitmapTextSize = (
  text: string,
  scale: number,
): { width: number; height: number } => {
  const columns = [...text].length * (GLYPH.width + GLYPH.gap) - GLYPH.gap;
  return {
    width: columns * scale + ROOM,
    height: GLYPH.height * scale + ROOM,
  };
};

/** The top row lit, the bottom two shaded, the rest the colour */
const partOf = (y: number): BitmapPart =>
  y === 0 ? 'light' : y >= GLYPH.height - 2 ? 'shade' : 'main';

/**
 * A word laid out at `scale` units a letter pixel (upper-cased; a
 * dash drawn as the hyphen; any other character the font lacks blank):
 * letter by letter its drop, its ink line, then its pixels, in units of
 * the box it fills
 */
export const bitmapTextLayout = (text: string, scale: number): BitmapLayout => {
  const chars = [...text.toUpperCase()];
  const letters = chars.map((char, letter) => {
    const left = INK + letter * (GLYPH.width + GLYPH.gap) * scale;
    const at = lit(glyphOf(FONT, ALIASES[char] ?? char)).map(({ x, y }) => ({
      x: left + x * scale,
      y: INK + y * scale,
      row: y,
    }));
    return [
      ...at.map(({ x, y }) => ({
        x: x + 2,
        y: y + 2,
        width: scale + 1,
        height: scale + 1,
        part: 'ink' as const,
        letter,
      })),
      ...at.map(({ x, y }) => ({
        x: x - 1,
        y: y - 1,
        width: scale + 2,
        height: scale + 2,
        part: 'ink' as const,
        letter,
      })),
      ...at.map(({ x, y, row }) => ({
        x,
        y,
        width: scale,
        height: scale,
        part: partOf(row),
        letter,
      })),
    ];
  });
  return { ...bitmapTextSize(text, scale), letters };
};

/** A canvas has no CSS variables: the ramp as colours */
export type BitmapColours = Record<BitmapPart, string>;

/**
 * Paint a word on a canvas with its top left at `x`, `y` (canvas
 * pixels): `scale` units a letter pixel, as BitmapText's sizes (1, 2, 3,
 * 5), `unit` canvas pixels a unit (the stage's pixel), in `colours`;
 * returns its box in canvas pixels
 */
export const drawBitmapText = (
  ctx: Pick<CanvasRenderingContext2D, 'fillStyle' | 'fillRect'>,
  text: string,
  {
    x,
    y,
    scale,
    unit = 1,
    colours,
  }: {
    x: number;
    y: number;
    scale: number;
    unit?: number;
    colours: BitmapColours;
  },
): { width: number; height: number } => {
  const layout = bitmapTextLayout(text, scale);
  for (const rect of layout.letters.flat()) {
    ctx.fillStyle = colours[rect.part];
    ctx.fillRect(
      x + rect.x * unit,
      y + rect.y * unit,
      rect.width * unit,
      rect.height * unit,
    );
  }
  return { width: layout.width * unit, height: layout.height * unit };
};
