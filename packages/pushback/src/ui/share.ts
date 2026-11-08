/**
 * The result card as a picture, drawn in the player's browser on a
 * canvas from the layout in `lib/result-card.ts` and the art the game
 * already has: nothing from the host, no server, no font file. The
 * package's share API (`@sebald/pushback/share`).
 */
import { type BitmapColours, drawBitmapText } from '@sebald/blip-ui';

import logo from '../assets/sheets/logo.png';
import {
  CARD,
  type CardInput,
  type CardPart,
  type CardTone,
  partBox,
  resultCard,
} from '../lib/result-card';
import { PLAYER_SHEETS } from '../lib/sprites';
import { roomBox } from '../lib/stage';
import { PALETTE } from './palette';
import { SCENE_ASSETS } from './scenes';
import { SHEETS } from './sheets';

export {
  CARD,
  type CardInput,
  type CardPart,
  resultCard,
} from '../lib/result-card';

/** The card's size in canvas pixels */
export const CARD_SIZE = {
  width: CARD.width * CARD.unit,
  height: CARD.height * CARD.unit,
} as const;

const TONES: Record<CardTone, BitmapColours> = {
  gold: {
    ink: PALETTE.ink,
    light: PALETTE.goldLight,
    main: PALETTE.gold,
    shade: PALETTE.goldShade,
  },
  red: {
    ink: PALETTE.ink,
    light: PALETTE.stampLight,
    main: PALETTE.stamp,
    shade: PALETTE.stampShade,
  },
  steel: {
    ink: PALETTE.ink,
    light: PALETTE.steelLight,
    main: PALETTE.steel,
    shade: PALETTE.dim,
  },
  heading: {
    ink: PALETTE.ink,
    light: PALETTE.spark,
    main: PALETTE.heading,
    shade: PALETTE.text,
  },
  muted: {
    ink: PALETTE.ink,
    light: PALETTE.text,
    main: PALETTE.muted,
    shade: PALETTE.dim,
  },
};

/** The pictures the card draws from */
export interface CardImages {
  room: CanvasImageSource;
  sheet: CanvasImageSource;
  logo: CanvasImageSource;
}

const load = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });

/** The office, the player's sheet and the logo, loaded */
export const loadCardImages = async ({
  run,
}: CardInput): Promise<CardImages> => {
  const [room, sheet, mark] = await Promise.all([
    load(SCENE_ASSETS.office.poster.src),
    load(SHEETS[PLAYER_SHEETS[run.role][run.look]].image.src),
    load(logo.src),
  ]);
  return { room, sheet, logo: mark };
};

/** The office's room inside its padded render, in the poster's pixels */
const roomCrop = (room: CanvasImageSource) => {
  const box = roomBox('office');
  const k = (room as HTMLImageElement).width / 480;
  return {
    x: box.x * k,
    y: box.y * k,
    width: box.width * k,
    height: box.height * k,
  };
};

const drawRoom = (ctx: CanvasRenderingContext2D, room: CanvasImageSource) => {
  const { width, height } = CARD_SIZE;
  const crop = roomCrop(room);
  // Cover the card, centred, smooth: the room is a backdrop, not art on the grid
  const k = Math.max(width / crop.width, height / crop.height);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    room,
    crop.x + (crop.width - width / k) / 2,
    crop.y + (crop.height - height / k) / 2,
    width / k,
    height / k,
    0,
    0,
    width,
    height,
  );
  // Dimmed under a vignette, so the card reads over it
  const shade = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    width * 0.75,
  );
  shade.addColorStop(0, 'rgba(11, 14, 21, 0.62)');
  shade.addColorStop(1, 'rgba(11, 14, 21, 0.8)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = false;
};

/** A box in units, as canvas pixels */
const at = (n: number) => n * CARD.unit;

const drawPart = (
  ctx: CanvasRenderingContext2D,
  part: CardPart,
  images: CardImages,
  sheetHead: { x: number; y: number },
) => {
  const u = CARD.unit;
  switch (part.kind) {
    case 'room':
      drawRoom(ctx, images.room);
      return;
    case 'panel': {
      // The window: an ink line and the frame as borders, then the fill,
      // which lets the dimmed room through faintly, and a lit row under the top
      const { x, y, width, height } = part;
      const border = (inset: number, colour: string) => {
        const left = at(x) - inset * u;
        const top = at(y) - inset * u;
        const w = at(width) + 2 * inset * u;
        const h = at(height) + 2 * inset * u;
        ctx.fillStyle = colour;
        ctx.fillRect(left, top, w, u);
        ctx.fillRect(left, top + h - u, w, u);
        ctx.fillRect(left, top, u, h);
        ctx.fillRect(left + w - u, top, u, h);
      };
      border(1, PALETTE.ink);
      border(0, PALETTE.frame);
      ctx.globalAlpha = 0.86;
      ctx.fillStyle = PALETTE.fill;
      ctx.fillRect(at(x) + u, at(y) + u, at(width) - 2 * u, at(height) - 2 * u);
      ctx.globalAlpha = 1;
      ctx.fillStyle = PALETTE.fillTop;
      ctx.fillRect(at(x) + u, at(y) + u, at(width) - 2 * u, u);
      return;
    }
    case 'face': {
      // Framed as on the result screen: the frame's inner colour behind,
      // two units of frame and one of ink round it
      const { x, y, size } = part;
      ctx.fillStyle = PALETTE.ink;
      ctx.fillRect(
        at(x) - 3 * u,
        at(y) - 3 * u,
        at(size) + 6 * u,
        at(size) + 6 * u,
      );
      ctx.fillStyle = PALETTE.frame;
      ctx.fillRect(
        at(x) - 2 * u,
        at(y) - 2 * u,
        at(size) + 4 * u,
        at(size) + 4 * u,
      );
      ctx.fillStyle = PALETTE.frameInner;
      ctx.fillRect(at(x), at(y), at(size), at(size));
      ctx.drawImage(
        images.sheet,
        sheetHead.x,
        sheetHead.y,
        24,
        24,
        at(x),
        at(y),
        at(size),
        at(size),
      );
      return;
    }
    case 'text':
      drawBitmapText(ctx, part.text, {
        x: at(part.x),
        y: at(part.y),
        scale: part.scale,
        unit: u,
        colours: TONES[part.tone],
      });
      return;
    case 'leader':
      // A dot every other unit, as the ledger's dotted leader
      ctx.fillStyle = PALETTE.dim;
      for (let x = part.x; x < part.x + part.width; x += 2)
        ctx.fillRect(at(x), at(part.y), u, u);
      return;
    case 'logo':
      // At its own pixels, one canvas pixel each
      ctx.drawImage(images.logo, at(part.x), at(part.y));
      return;
  }
};

/** Every part's box outlined and named, to see where things go */
const drawOverlay = (ctx: CanvasRenderingContext2D, parts: CardPart[]) => {
  ctx.lineWidth = 1;
  ctx.font = '12px monospace';
  for (const part of parts) {
    const box = partBox(part);
    if (!box) continue;
    ctx.strokeStyle = part.kind === 'text' ? '#ff4fd8' : '#4fe3ff';
    ctx.strokeRect(
      at(box.x) + 0.5,
      at(box.y) + 0.5,
      at(box.width) - 1,
      at(box.height) - 1,
    );
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fillText(
      part.kind === 'text' ? part.name : part.kind,
      at(box.x) + 2,
      at(box.y) - 2,
    );
  }
};

export interface DrawOptions {
  /** Outline every part with its name, for the inventory */
  overlay?: boolean;
}

/** Draw the card for a run on a 1200 by 630 canvas */
export const drawResultCard = (
  ctx: CanvasRenderingContext2D,
  input: CardInput,
  images: CardImages,
  { overlay = false }: DrawOptions = {},
) => {
  const parts = resultCard(input);
  const meta = SHEETS[PLAYER_SHEETS[input.run.role][input.run.look]].meta;
  const head = meta.features?.head ?? { x: 24, y: 32 };
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CARD_SIZE.width, CARD_SIZE.height);
  for (const part of parts) drawPart(ctx, part, images, head);
  if (overlay) drawOverlay(ctx, parts);
};

/** The card for a run as a PNG */
export const resultImage = async (input: CardInput): Promise<Blob> => {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_SIZE.width;
  canvas.height = CARD_SIZE.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2D canvas');
  drawResultCard(ctx, input, await loadCardImages(input));
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('No PNG'))),
      'image/png',
    ),
  );
};

/** The picture's file name, for the share sheet and the download */
const fileName = ({ run }: CardInput) => `pushback-${run.role}.png`;

/**
 * Whether the device has a share sheet that takes a picture (most phones,
 * some desktops): then `shareResult` hands it over instead of downloading
 */
export const canShareImage = (): boolean => {
  if (typeof navigator === 'undefined' || !navigator.canShare) return false;
  try {
    return navigator.canShare({
      files: [new File([''], 'pushback.png', { type: 'image/png' })],
    });
  } catch {
    return false;
  }
};

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  // After the click has started the download
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/**
 * Share the card: the picture and `text` (the text card) through the
 * share sheet where there is one, otherwise the picture downloaded.
 * `shared` or `saved`; `cancelled` when the sheet was closed without
 * sharing, which is not an error.
 */
export const shareResult = async (
  input: CardInput,
  text?: string,
): Promise<'shared' | 'saved' | 'cancelled'> => {
  const blob = await resultImage(input);
  const file = new File([blob], fileName(input), { type: 'image/png' });
  if (canShareImage() && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError')
        return 'cancelled';
      throw error;
    }
  }
  download(blob, fileName(input));
  return 'saved';
};
