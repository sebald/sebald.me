/**
 * Buddy mode: the ghost of the player's predecessor whispers the reply,
 * slowly. While the player hesitates on defence, the ghost fades in
 * behind the player's shoulder with a line, and the wrong counters dim in
 * three steps while the right one stays bright. The cost is built into
 * the existing rules: a counter after the silence bar is half full earns
 * no momentum, and the bar's fallback still fires at the end, so waiting
 * for the whisper is never free. Presentation only; the reducer knows
 * nothing about it.
 */
import { BUDDY_BARKS } from './lines';

/** Dim steps for the wrong counters, 0 (none) to `BUDDY_STEPS` (dimmest) */
export const BUDDY_STEPS = 3;

/** Milliseconds the whisper takes when there is no silence bar to pace it */
export const BUDDY_WINDOW_MS = 6000;

/**
 * How far the whisper has got: the step the wrong counters are dimmed
 * to after `elapsed` ms. With a silence limit the steps land at 30, 55
 * and 80 percent of it, so the last step shows before the fallback and
 * the first after the momentum cutoff is close.
 */
export const buddyStep = (elapsed: number, limit: number | null): number => {
  const window = limit ?? BUDDY_WINDOW_MS;
  const marks = [0.3, 0.55, 0.8].map(fraction => fraction * window);
  return marks.filter(mark => elapsed >= mark).length;
};

/** Opacity of a wrong counter at a step, in three visible drops */
export const buddyOpacity = (step: number): number =>
  [1, 0.7, 0.45, 0.25][Math.max(0, Math.min(BUDDY_STEPS, step))]!;

/**
 * The ghost's line for an appearance: the barks in turn from a start
 * set by the duel's seed, so a duel never repeats one before it has
 * used them all.
 */
export const buddyLine = (exchange: number, seed: number): string =>
  BUDDY_BARKS[(Math.abs(seed) + exchange) % BUDDY_BARKS.length]!;

/** Where the ghost floats: behind the player's shoulder, off the floor */
export const GHOST = {
  /** Left of the player's cell, in native pixels */
  behind: 46,
  /** Above the feet line: it hovers at head height, clear of the box */
  lift: 64,
} as const;
