/**
 * Sprites as data: which sheet a duellist is drawn from, which cell a
 * pose uses, and the swaps that turn the six base sheets into the nine
 * colleagues (a hue-based recolour plus a prop in the hand). Everything
 * here is pure; `src/ui/lab/pushback/sheets.ts` loads the PNGs and
 * applies it.
 */
import type { Look } from './characters';
import type { Role } from './lines';
import { FRAME_MS, type Pose } from './stage';

// Sheets
// ---------------

/** The seven model sheets under `src/assets/lab/pushback/sheets/` */
export type SheetId =
  | 'pm-jo'
  | 'pm-piet'
  | 'dev-sam'
  | 'dev-lena'
  | 'designer-ines'
  | 'designer-theo'
  | 'boss';

export const SHEET_IDS: readonly SheetId[] = [
  'pm-jo',
  'pm-piet',
  'dev-sam',
  'dev-lena',
  'designer-ines',
  'designer-theo',
  'boss',
];

/** The sheet of a playable look */
export const PLAYER_SHEETS: Record<Role, Record<Look, SheetId>> = {
  pm: { a: 'pm-jo', b: 'pm-piet' },
  dev: { a: 'dev-sam', b: 'dev-lena' },
  designer: { a: 'designer-ines', b: 'designer-theo' },
};

/** What `sheet.mjs` writes next to a sheet: the cells and their boxes */
export interface SheetMeta {
  cell: { width: number; height: number };
  count: number;
  cells: {
    /** Where the figure sits inside its cell */
    box: { x: number; y: number; width: number; height: number };
    clipped: boolean;
  }[];
}

/** Model sheet cells, left to right */
export const POSE_CELL: Record<Pose, number> = {
  idle: 0,
  talk: 1,
  taunt: 2,
  flinch: 3,
  win: 4,
  lose: 5,
};

/** The cells of the ghost sheet: two hover frames and the point */
export const GHOST_CELLS = { hover: [0, 1], point: 2 } as const;

/**
 * The cell a pose shows at `elapsed` ms into it. Talk alternates the
 * open mouth with the idle cell every frame while the line types, and
 * rests on the open mouth once it is typed.
 */
export const cellFor = (pose: Pose, elapsed: number, typing: boolean) => {
  if (pose === 'talk' && typing) {
    return Math.floor(elapsed / FRAME_MS) % 2 === 0
      ? POSE_CELL.talk
      : POSE_CELL.idle;
  }
  return POSE_CELL[pose];
};

/** The ghost's cell: it points from the second whisper step on */
export const ghostCell = (step: number, elapsed: number): number =>
  step >= 2
    ? GHOST_CELLS.point
    : GHOST_CELLS.hover[Math.floor(elapsed / 600) % 2]!;

// Swaps
// ---------------

/** The eight items of the prop sheet, in cell order */
export type PropId =
  | 'coffee'
  | 'gantt'
  | 'energy-drink'
  | 'keyboard'
  | 'marker'
  | 'tote'
  | 'swatches'
  | 'tiny-laptop';

export const PROPS: readonly PropId[] = [
  'coffee',
  'gantt',
  'energy-drink',
  'keyboard',
  'marker',
  'tote',
  'swatches',
  'tiny-laptop',
];

/**
 * One material recoloured: every pixel whose hue is near `from` (or, for
 * a grey `from`, whose lightness is near it) becomes `to`, keeping its
 * own light and shade. `from` is one representative shade of the material
 * on the base sheet, as `sheet.mjs` prints it.
 */
export interface Tint {
  from: string;
  to: string;
  /** Hue tolerance in degrees (`HUE_TOLERANCE`); tighter keeps the skin */
  tolerance?: number;
  /** Least saturation a pixel needs (`GREY`); higher keeps pale hair */
  minSaturation?: number;
}

/** How a colleague is drawn: a base sheet, recoloured, with a prop */
export interface Swap {
  base: SheetId;
  tints?: Tint[];
  prop?: PropId;
}

/** A key that is the same for the same drawing */
export const swapKey = (swap: Swap): string =>
  [
    swap.base,
    swap.prop ?? '',
    ...(swap.tints ?? []).map(
      t => `${t.from}>${t.to}/${t.tolerance ?? ''}/${t.minSaturation ?? ''}`,
    ),
  ].join('|');

/**
 * Where the prop's centre goes, inside the cell: the hand of the forward
 * arm, on the facing side, a little above the hip of the figure's box.
 */
export const HAND = { x: 0.8, y: 0.6 } as const;

export const handAnchor = (box: SheetMeta['cells'][number]['box']) => ({
  x: Math.round(box.x + box.width * HAND.x),
  y: Math.round(box.y + box.height * HAND.y),
});

// Colour
// ---------------

export type Rgb = [number, number, number];

export const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

/** Hue in degrees, 0 for a grey */
export const hue = ([r, g, b]: Rgb): number => {
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  if (mx === mn) return 0;
  const d = mx - mn;
  let h: number;
  if (mx === r) h = ((g - b) / d) % 6;
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
};

/** HSV saturation, 0 to 1 */
export const saturation = ([r, g, b]: Rgb): number => {
  const mx = Math.max(r, g, b);
  return mx === 0 ? 0 : (mx - Math.min(r, g, b)) / mx;
};

/** Relative luminance, 0 to 255 */
export const luminance = ([r, g, b]: Rgb): number =>
  0.299 * r + 0.587 * g + 0.114 * b;

const hueDelta = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/** Below this a colour counts as grey and matches by lightness instead */
export const GREY = 0.14;

/** Hue tolerance of a tint, in degrees */
export const HUE_TOLERANCE = 14;

/** A grey matches within this much luminance, so the outline stays out */
export const GREY_BAND = 20;

/** Does a pixel belong to the material a tint names? */
export const tintMatches = (
  pixel: Rgb,
  from: Rgb,
  { tolerance = HUE_TOLERANCE, minSaturation = GREY }: Partial<Tint> = {},
): boolean => {
  const fromSat = saturation(from);
  const pixelSat = saturation(pixel);
  if (fromSat < GREY) {
    return (
      pixelSat < GREY &&
      Math.abs(luminance(pixel) - luminance(from)) <= GREY_BAND
    );
  }
  return (
    pixelSat >= minSaturation && hueDelta(hue(pixel), hue(from)) <= tolerance
  );
};

/** `to`, at the pixel's own light and shade relative to `from` */
export const shade = (pixel: Rgb, from: Rgb, to: Rgb): Rgb => {
  const factor = luminance(pixel) / Math.max(1, luminance(from));
  return to.map(v => Math.max(0, Math.min(255, Math.round(v * factor)))) as Rgb;
};

/** Apply tints to RGBA pixels in place; transparent pixels are skipped */
export const recolour = (rgba: Uint8ClampedArray, tints: Tint[]): void => {
  const rules = tints.map(t => ({
    from: hexToRgb(t.from),
    to: hexToRgb(t.to),
    options: { tolerance: t.tolerance, minSaturation: t.minSaturation },
  }));
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue;
    const pixel: Rgb = [rgba[i]!, rgba[i + 1]!, rgba[i + 2]!];
    for (const rule of rules) {
      if (!tintMatches(pixel, rule.from, rule.options)) continue;
      const [r, g, b] = shade(pixel, rule.from, rule.to);
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
      break;
    }
  }
};
