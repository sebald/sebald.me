/**
 * Sprites as data: which sheet a duellist is drawn from and which cell a
 * pose uses. Everything here is pure; `src/ui/lab/pushback/sheets.ts`
 * loads the PNGs and applies it.
 */
import type { Look } from './characters';
import type { Role } from './lines';
import { FRAME_MS, type Pose } from './stage';

// Sheets
// ---------------

/** The ten model sheets under `src/assets/lab/pushback/sheets/` */
export type SheetId =
  | 'pm-jo'
  | 'pm-piet'
  | 'pm-nadia'
  | 'dev-sam'
  | 'dev-lena'
  | 'dev-bo'
  | 'designer-ines'
  | 'designer-theo'
  | 'designer-kim'
  | 'boss';

export const SHEET_IDS: readonly SheetId[] = [
  'pm-jo',
  'pm-piet',
  'pm-nadia',
  'dev-sam',
  'dev-lena',
  'dev-bo',
  'designer-ines',
  'designer-theo',
  'designer-kim',
  'boss',
];

/** The sheet of a playable look */
export const PLAYER_SHEETS: Record<Role, Record<Look, SheetId>> = {
  pm: { a: 'pm-jo', b: 'pm-piet' },
  dev: { a: 'dev-sam', b: 'dev-lena' },
  designer: { a: 'designer-ines', b: 'designer-theo' },
};

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * What `sheet.mjs` writes next to a sheet: the cells and their boxes;
 * and what `features.mjs` adds to a model sheet: the parts the game
 * animates or shows on their own.
 */
export interface SheetMeta {
  cell: { width: number; height: number };
  count: number;
  cells: {
    /** Where the figure sits inside its cell */
    box: Rect;
    clipped: boolean;
  }[];
  features?: {
    /** The head in the idle cell: the portrait */
    head: Rect;
    /** The lower face in the idle cell, mouth closed */
    mouth: Rect | null;
    /** Where that patch goes in the talk cell */
    talkMouth: { x: number; y: number } | null;
    /** The eye in the lose cell, where the tears start */
    eye: { x: number; y: number };
  };
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

/** The cell a pose shows */
export const cellFor = (pose: Pose): number => POSE_CELL[pose];

/**
 * The mouth while a line types, one entry per frame: open (1) and closed
 * (0) in an uneven rhythm, about three openings a second, so the hand
 * stays up and only the mouth moves. Swapping the whole talk cell for
 * the idle one every frame waved the hand eight times a second.
 */
export const TALK = [1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0] as const;

/** Is the mouth open at `elapsed` ms into a line: closed once it is typed */
export const mouthOpen = (elapsed: number, typing: boolean): boolean =>
  typing && TALK[Math.floor(elapsed / FRAME_MS) % TALK.length] === 1;

/**
 * Tears on the lose pose: a drop falls from the eye for `fall` frames,
 * two pixels a frame, then nothing until the period is over.
 */
export const TEARS = { period: 10, fall: 5, step: 2 } as const;

/**
 * Who loses without tears: the Stakeholder takes it offline, slumped,
 * and does not cry about it
 */
export const TEARLESS: ReadonlySet<SheetId> = new Set<SheetId>(['boss']);

/** Whether a sheet cries on its lose pose */
export const cries = (sheet: SheetId): boolean => !TEARLESS.has(sheet);

/** How far below the eye the drop is at `elapsed` ms, or null between drops */
export const tearDrop = (elapsed: number): number | null => {
  const frame = Math.floor(elapsed / FRAME_MS) % TEARS.period;
  return frame < TEARS.fall ? frame * TEARS.step : null;
};

/** The ghost's cell: it points from the second whisper step on */
export const ghostCell = (step: number, elapsed: number): number =>
  step >= 2
    ? GHOST_CELLS.point
    : GHOST_CELLS.hover[Math.floor(elapsed / 600) % 2]!;
