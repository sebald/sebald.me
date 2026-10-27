/**
 * Buddy mode: the ghost of the player's predecessor whispers the reply,
 * slowly. While the player hesitates on defence, the ghost fades in
 * behind the player's shoulder with a line, and the wrong counters dim in
 * three steps while the right one and one decoy stay bright. The cost is built into
 * the existing rules: a counter after the silence bar is half full earns
 * no momentum, and the bar's fallback still fires at the end, so waiting
 * for the whisper is never free. Presentation only; the reducer knows
 * nothing about it.
 */
import { BUDDY_BARKS } from './lines';

/** Dim steps for the wrong counters, 0 (none) to `BUDDY_STEPS` (dimmest) */
export const BUDDY_STEPS = 3;

/** Milliseconds the whisper takes when there is no silence bar to pace it */
export const BUDDY_WINDOW_MS = 8000;

/**
 * Where the three steps land on the window: not before half of it, so
 * the ghost never shows while a fast answer is still possible, and the
 * last one before the fallback.
 */
export const BUDDY_MARKS = [0.5, 0.7, 0.88] as const;

/**
 * How far the whisper has got: the step the wrong counters are dimmed
 * to after `elapsed` ms, by `BUDDY_MARKS` on the silence limit or on
 * the window.
 */
export const buddyStep = (elapsed: number, limit: number | null): number => {
  const window = limit ?? BUDDY_WINDOW_MS;
  return BUDDY_MARKS.filter(fraction => elapsed >= fraction * window).length;
};

/**
 * The wrong counter the ghost leaves bright, so the last call is still
 * the player's: a two-way choice at the end of the whisper. Fixed per
 * exchange by the salt (turn and seed).
 */
export const buddyKeeps = <T>(
  menu: readonly T[],
  answer: T,
  salt: number,
): T | undefined => {
  const wrong = menu.filter(id => id !== answer);
  return wrong[Math.abs(salt) % Math.max(1, wrong.length)];
};

/**
 * The ghost's entrance and exit, in ms: it is spat out of a black hole
 * and swallowed back into it.
 */
export const GHOST_ANIM_MS = 450;

/** How far in the ghost is after `elapsed` ms, 0 to 1, eased to snap in */
export const ghostEnter = (elapsed: number): number => {
  const t = Math.max(0, Math.min(1, elapsed / GHOST_ANIM_MS));
  return 1 - (1 - t) ** 2;
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

/** Where the ghost floats: behind the player's shoulder */
export const GHOST = {
  /** Left of the player's cell, in stage pixels */
  behind: 36,
  /** Above the feet line; its tail brushes the floor, its head is under the bars */
  lift: 0,
} as const;
