/**
 * Whether a stepper's values are off and on, which a screen reader is
 * told as a switch: only `['Off', 'On']`, so Normal and Hard are read as
 * their words, not as off and on
 */
export const isToggle = (values: readonly string[]) =>
  values.length === 2 && values[0] === 'Off' && values[1] === 'On';

/**
 * Where a key takes a stepper at `at` of `count` values: Left back, Right,
 * Enter and Space on, both round past the ends; Home and End to them.
 * `null` for a key that is not its own, or with nothing to step to
 */
export const stepTo = (key: string, at: number, count: number) => {
  if (count < 2) return null;
  switch (key) {
    case 'ArrowLeft':
      return (at - 1 + count) % count;
    case 'ArrowRight':
    case 'Enter':
    case ' ':
      return (at + 1) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
};
