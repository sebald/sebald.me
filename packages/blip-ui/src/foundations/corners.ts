/**
 * Stepped corners: the rounded corner as a pixel staircase, how far in
 * each row from the corner starts, top row first. An outline takes the
 * outermost, each ring inside it one step less, so the corner curves the
 * same way through every layer.
 */
export const CORNERS = [[3, 1, 1], [2, 1], [1]] as const;

/**
 * A `clip-path` with the staircase at all four corners, walked clockwise:
 * each corner's steps as offsets from that corner, mirrored onto it, in
 * the order the outline passes them. Lengths are in `unit` (`--px`).
 */
export const rounded = (steps: readonly number[], unit = '--px') => {
  // From the left edge up to the top edge, round the top left corner,
  // the bottom row's step first
  const topLeft = [
    [0, steps.length],
    ...steps
      .map((indent, row) => [
        [indent, row + 1],
        [indent, row],
      ])
      .reverse()
      .flat(),
  ];
  const at = (n: number, from: 'start' | 'end') =>
    from === 'start'
      ? `calc(var(${unit}) * ${n})`
      : `calc(100% - var(${unit}) * ${n})`;
  const place = (x: 'start' | 'end', y: 'start' | 'end', reverse: boolean) =>
    (reverse ? [...topLeft].reverse() : topLeft).map(
      ([dx, dy]) => `${at(dx!, x)} ${at(dy!, y)}`,
    );
  return `polygon(${[
    ...place('start', 'start', false),
    ...place('end', 'start', true),
    ...place('end', 'end', false),
    ...place('start', 'end', true),
  ].join(', ')})`;
};
