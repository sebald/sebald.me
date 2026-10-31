/**
 * Masks that fade on the stage's pixel grid in an ordered dither: a
 * pixel on or off and nothing between, four columns wide and repeated
 * across, sized in stage pixels by whoever uses them.
 */

/** The 4 by 4 ordered dither: the order pixels light up in */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;

/** A 4 by `rows` mask, each row lit to its level from 0 to 1 */
const mask = (levels: number[]) => {
  const rects: string[] = [];
  levels.forEach((level, y) => {
    for (let x = 0; x < 4; x++)
      if (BAYER[y % 4]![x]! < level * 16)
        rects.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="${levels.length}" shape-rendering="crispEdges" fill="white">${rects.join('')}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
};

/** Full at the top, none at the bottom, over `rows` stage pixels */
export const fadeMask = (rows: number) =>
  mask(Array.from({ length: rows }, (_, y) => 1 - (y + 0.5) / rows));

/** Full in the middle, fading out over `edge` rows at the top and bottom */
export const edgeMask = (rows: number, edge: number) =>
  mask(
    Array.from({ length: rows }, (_, y) =>
      Math.min(1, (Math.min(y, rows - 1 - y) + 0.5) / edge),
    ),
  );
