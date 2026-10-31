/**
 * Seeded random numbers for the game (mulberry32). The state is a plain
 * number, so a reducer can keep it in its state and stay pure: the same
 * seed always plays the same duel, which is what the tests and the
 * simulation rely on.
 */
export type RngState = number;

/** Turn any number into a usable state; a seed of 0 would stick at 0 */
export const seedRng = (seed: number): RngState => seed >>> 0 || 0x9e3779b9;

/** One step: a value in [0, 1) and the state to continue from */
export const nextRandom = (
  state: RngState,
): [value: number, next: RngState] => {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4_294_967_296, next];
};

/**
 * A cursor over the state for code that draws several numbers in a row.
 * Read `state` back when done and store it.
 */
export class Rng {
  state: RngState;

  constructor(state: RngState) {
    this.state = state;
  }

  /** A value in [0, 1) */
  next() {
    const [value, next] = nextRandom(this.state);
    this.state = next;
    return value;
  }

  /** An integer in [0, n) */
  int(n: number) {
    return Math.floor(this.next() * n);
  }

  /** True with probability `p` */
  chance(p: number) {
    return this.next() < p;
  }

  /** One item, or undefined for an empty list */
  pick<T>(items: readonly T[]): T | undefined {
    return items.length === 0 ? undefined : items[this.int(items.length)];
  }

  /** A new array with the items in random order (Fisher-Yates) */
  shuffle<T>(items: readonly T[]): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [result[i], result[j]] = [result[j]!, result[i]!];
    }
    return result;
  }

  /** Up to `n` distinct items in random order */
  sample<T>(items: readonly T[], n: number): T[] {
    return this.shuffle(items).slice(0, n);
  }
}
