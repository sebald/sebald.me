/**
 * Every colour of the chrome and the letters, in one place. The canvas
 * reads them as hex; the DOM reads them as CSS variables the stage sets
 * on its root (`paletteVars`), written `text-(--pb-muted)`,
 * `bg-(--pb-fill)`, `ring-(--pb-frame)` and so on, so a shade is changed
 * once and the inventory's palette shows what the game uses. The sprites
 * and the rooms keep their own colours: nothing here recolours a sheet.
 */
export const PALETTE = {
  // Ground and ink
  /** Behind the panel and outside the window's corners */
  bg: '#07080d',
  /** Outlines, the ink line around everything drawn */
  ink: '#0b0d16',

  // The quiet window
  /** The window's frame, and the frame unlit (a dim face, a blank row) */
  frame: '#b7b09d',
  frameDim: '#4a5066',
  frameInner: '#1c2236',
  /** The window's fill, and its two dithered rows */
  fill: '#131829',
  fillTop: '#1a2035',

  // The sides
  /** The player's side: the name plate, the pips, the dialogue mark */
  gold: '#f2c14e',
  goldLight: '#fff1b8',
  goldShade: '#b8871f',
  /** The opponent's side */
  ember: '#f0a36f',
  emberLight: '#ffd6b8',
  emberShade: '#b86a35',

  // Empty
  /** Empty ticks, pips and tracks, with their dots */
  empty: '#0f1433',
  emptyDots: '#19224f',
  /** The marker on the centre tick, the rail's thumb */
  steel: '#8a92b8',

  // The letters
  /** Body text in the windows */
  text: '#c9c4b4',
  /** A line to pick */
  textBright: '#d6d1c2',
  /** Headings and names */
  heading: '#f3eedc',
  /** Prompts, blurbs, hints, the reply shown after a miss */
  muted: '#8a92b8',
  /** The legend, an idle role label */
  dim: '#5c6488',

  // The ghost
  /** Its sprite placeholder and its bubble's letters */
  ghost: '#bfe8ea',
  ghostLight: '#e8fbfb',
  /** The bubble's ring and tail, the black hole's rim */
  ghostRim: '#2f5e60',
  /** The bubble's fill */
  ghostInk: '#0b1516',
  /** The black hole */
  ghostHole: '#05060a',

  // The placeholder room, until a scene loop has loaded
  wall: '#2e3a4a',
  floor: '#23292f',
} as const;

export type PaletteKey = keyof typeof PALETTE;

/** The CSS variable of a colour: `--pb-gold-light` for `goldLight` */
export const pbVar = (name: PaletteKey): string =>
  `--pb-${name.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`;

/** The palette as CSS variables, set on the stage's root */
export const paletteVars: Record<string, string> = Object.fromEntries(
  (Object.keys(PALETTE) as PaletteKey[]).map(key => [pbVar(key), PALETTE[key]]),
);
