/**
 * Only the part of Node's `process` a bundler fills in: the kit is built
 * without Node's types, and in a browser there may be no `process` at all
 */
declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * Whether the game is being built, not shipped: for the kit's console
 * errors that say how a piece is misused. A bundler replaces
 * `process.env.NODE_ENV`, so the check and the message drop out of a
 * production build
 */
export const building = () =>
  !(typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
