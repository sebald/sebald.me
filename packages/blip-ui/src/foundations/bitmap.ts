/**
 * Bitmap letters: a glyph is a row of strings, `#` for a lit pixel and
 * `.` for an empty one. A font is a map from a character to its glyph.
 * The stamp (3x5) and the bitmap text (5x7) draw from the same shape.
 */
export type Glyph = readonly string[];
export type Font = Readonly<Record<string, Glyph>>;

export interface Dot {
  x: number;
  y: number;
}

/** The lit pixels of a glyph, row by row */
export const lit = (glyph: Glyph): Dot[] =>
  glyph.flatMap((row, y) =>
    [...row].flatMap((cell, x) => (cell === '#' ? [{ x, y }] : [])),
  );

/**
 * A character's glyph; the blank space for one the font doesn't have
 * (the font must have a `' '`)
 */
export const glyphOf = (font: Font, char: string): Glyph =>
  font[char] ?? font[' ']!;

/** The characters a font can draw, as one string, for the docs */
export const supported = (font: Font) =>
  Object.keys(font)
    .filter(char => char !== ' ')
    .join('');
