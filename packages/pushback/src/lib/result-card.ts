/**
 * The result card as a picture to save or share, laid out as data: what
 * goes where on a grid of card units, in the order it is drawn. Pure, so
 * the tests and the inventory's overlay read exactly what the canvas
 * paints (`ui/share.ts` draws it). The text is BitmapText's five by seven
 * font only: the card needs no font file and its letters stay crisp.
 */
import { bitmapTextLayout } from '@sebald/blip-ui';

import { type Look, LOOKS, MODE_LABELS, MODES } from './characters';
import { type PairId, ROLE_LABELS, RUN_VERDICTS, inTurn } from './lines';
import type { RunState } from './run';
import { formatScore, resultModel } from './save';

/** The card in units: 400 by 210, three canvas pixels each, 1200 by 630 */
export const CARD = { width: 400, height: 210, unit: 3 } as const;

/** The head square's pixels (24) at this many units each */
export const FACE_SCALE = 3;
const FACE = 24 * FACE_SCALE;

/** The logo at one canvas pixel a pixel of its sheet (226 by 77), in units */
export const LOGO_BOX = { width: 226 / CARD.unit, height: 77 / CARD.unit };

/** A colour by what it says, mapped to the palette where it is drawn */
export type CardTone = 'gold' | 'red' | 'steel' | 'heading' | 'muted';

export type CardPart =
  /** The corner office behind everything, dimmed */
  | { kind: 'room' }
  /** The window the card sits in */
  | { kind: 'panel'; x: number; y: number; width: number; height: number }
  /** The player's face, framed */
  | { kind: 'face'; x: number; y: number; size: number }
  | {
      kind: 'text';
      /** What it is, for the tests and the overlay */
      name: string;
      text: string;
      x: number;
      y: number;
      /** Units a letter pixel, BitmapText's sizes */
      scale: 1 | 2 | 3;
      tone: CardTone;
      /** Its box, in units */
      width: number;
      height: number;
    }
  /** The dots from a label to its value, the ledger's leader */
  | { kind: 'leader'; x: number; y: number; width: number }
  | { kind: 'logo'; x: number; y: number };

export interface CardInput {
  run: RunState & { look: Look };
  glossary?: readonly PairId[];
}

const text = (
  name: string,
  value: string,
  x: number,
  y: number,
  scale: 1 | 2 | 3,
  tone: CardTone,
  align: 'left' | 'right' | 'centre' = 'left',
): Extract<CardPart, { kind: 'text' }> => {
  // The font has a hyphen, not the dashes the screen's numbers use (23–9)
  const shown = value.replace(/[–—]/g, '-').toUpperCase();
  const { width, height } = bitmapTextLayout(shown, scale);
  const left =
    align === 'right' ? x - width : align === 'centre' ? x - width / 2 : x;
  return {
    kind: 'text',
    name,
    text: shown,
    x: Math.round(left),
    y,
    scale,
    tone,
    width,
    height,
  };
};

/** Where everything goes, top to bottom, in units */
const PANEL = { x: 10, y: 10, width: 380, height: 190 } as const;
const LEFT = { x: 26, y: 28 } as const;
const RIGHT = { x: 124, y: 28, end: 236 } as const;
const GLOSSARY = { x: 256, end: 374 } as const;
const ROW = 13;

/** The card for a run: everything on it, in the order it is drawn */
export const resultCard = ({ run, glossary }: CardInput): CardPart[] => {
  const model = resultModel(run, glossary);
  const name = LOOKS[run.role][run.look].name;
  const verdict = inTurn(
    RUN_VERDICTS[model.finished ? 'shipped' : 'offline'],
    run.attempts,
  );
  const faceCentre = LEFT.x + FACE / 2;
  const ledgerTop = RIGHT.y + 70;
  // The number to beat, the largest thing on the card
  const score = text(
    'score',
    formatScore(model.score),
    RIGHT.x,
    RIGHT.y + 36,
    3,
    'heading',
  );

  const ledger = model.rows.flatMap(([label, value], i) => {
    const y = ledgerTop + i * ROW;
    const left = text(`row ${label}`, label, RIGHT.x, y, 1, 'muted');
    const right = text(
      `value ${label}`,
      value,
      RIGHT.end,
      y,
      1,
      'heading',
      'right',
    );
    const from = left.x + left.width + 2;
    return [
      left,
      { kind: 'leader' as const, x: from, y: y + 7, width: right.x - 2 - from },
      right,
    ];
  });

  const pools = model.pools.map((pool, i) => [
    text(
      `pool ${pool.role}`,
      ROLE_LABELS[pool.role],
      GLOSSARY.x,
      ledgerTop + (i + 1) * ROW,
      1,
      'muted',
    ),
    text(
      `pool ${pool.role} count`,
      `${pool.collected}/${pool.total}`,
      GLOSSARY.end,
      ledgerTop + (i + 1) * ROW,
      1,
      'heading',
      'right',
    ),
  ]);

  return [
    { kind: 'room' },
    { kind: 'panel', ...PANEL },
    { kind: 'face', x: LEFT.x, y: LEFT.y, size: FACE },
    text('name', name, faceCentre, LEFT.y + FACE + 8, 2, 'heading', 'centre'),
    text(
      'role',
      ROLE_LABELS[run.role],
      faceCentre,
      LEFT.y + FACE + 28,
      1,
      'muted',
      'centre',
    ),
    text(
      'verdict',
      verdict,
      RIGHT.x,
      RIGHT.y,
      2,
      model.finished ? 'gold' : 'red',
    ),
    text(
      'result',
      model.finished ? 'Stakeholder beaten' : 'Taken offline',
      RIGHT.x,
      RIGHT.y + 22,
      1,
      'steel',
    ),
    score,
    text(
      'mode',
      `${MODE_LABELS[model.mode]} x${MODES[model.mode].rules.score}`,
      score.x + score.width + 4,
      score.y + score.height - 13,
      1,
      'muted',
    ),
    ...ledger,
    text('glossary', 'Glossary', GLOSSARY.x, ledgerTop, 1, 'heading'),
    text(
      'glossary count',
      `${model.glossary.collected}/${model.glossary.total}`,
      GLOSSARY.end,
      ledgerTop,
      1,
      'heading',
      'right',
    ),
    ...pools.flat(),
    text(
      'address',
      'sebald.me/lab/pushback',
      LEFT.x,
      PANEL.y + PANEL.height - 18,
      1,
      'muted',
    ),
    {
      kind: 'logo',
      x: Math.round(PANEL.x + PANEL.width - 12 - LOGO_BOX.width),
      y: Math.round(PANEL.y + PANEL.height - 10 - LOGO_BOX.height),
    },
  ];
};

/** A part's box in units, for the bounds check and the overlay */
export const partBox = (
  part: CardPart,
): { x: number; y: number; width: number; height: number } | null => {
  switch (part.kind) {
    case 'room':
      return null;
    case 'panel':
      return part;
    case 'face':
      return { x: part.x, y: part.y, width: part.size, height: part.size };
    case 'text':
      return part;
    case 'leader':
      return { x: part.x, y: part.y, width: part.width, height: 1 };
    case 'logo':
      return { x: part.x, y: part.y, ...LOGO_BOX };
  }
};
