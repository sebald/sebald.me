/**
 * Sprites as data: which sheet a duellist is drawn from, which cell a
 * pose uses, and the swaps that turn the six base sheets into the nine
 * colleagues (a base sheet plus a prop in the hand). Everything
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

/** How a colleague is drawn: a base sheet as drawn, with a prop */
export interface Swap {
  base: SheetId;
  prop?: PropId;
}

/** A key that is the same for the same drawing */
export const swapKey = (swap: Swap): string =>
  [swap.base, swap.prop ?? ''].join('|');

/**
 * Where the prop's centre goes, inside the cell: the hand of the forward
 * arm, on the facing side, a little above the hip of the figure's box.
 */
export const HAND = { x: 0.8, y: 0.6 } as const;

export const handAnchor = (box: SheetMeta['cells'][number]['box']) => ({
  x: Math.round(box.x + box.width * HAND.x),
  y: Math.round(box.y + box.height * HAND.y),
});
