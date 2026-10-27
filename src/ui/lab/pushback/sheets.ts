/**
 * The sheets cut by `.claude/skills/pixel-sprite/scripts/sheet.mjs`, and
 * the sprites built from them in the browser: a base sheet drawn into a
 * canvas with its prop pasted into every cell (see
 * `src/lib/lab/pushback/sprites.ts`). Built once per swap and cached.
 */
import type { StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';

import bossMeta from '@/assets/lab/pushback/sheets/boss.json';
import boss from '@/assets/lab/pushback/sheets/boss.png';
import inesMeta from '@/assets/lab/pushback/sheets/designer-ines.json';
import ines from '@/assets/lab/pushback/sheets/designer-ines.png';
import theoMeta from '@/assets/lab/pushback/sheets/designer-theo.json';
import theo from '@/assets/lab/pushback/sheets/designer-theo.png';
import lenaMeta from '@/assets/lab/pushback/sheets/dev-lena.json';
import lena from '@/assets/lab/pushback/sheets/dev-lena.png';
import samMeta from '@/assets/lab/pushback/sheets/dev-sam.json';
import sam from '@/assets/lab/pushback/sheets/dev-sam.png';
import ghostMeta from '@/assets/lab/pushback/sheets/ghost.json';
import ghost from '@/assets/lab/pushback/sheets/ghost.png';
import micdropMeta from '@/assets/lab/pushback/sheets/micdrop.json';
import micdrop from '@/assets/lab/pushback/sheets/micdrop.png';
import joMeta from '@/assets/lab/pushback/sheets/pm-jo.json';
import jo from '@/assets/lab/pushback/sheets/pm-jo.png';
import pietMeta from '@/assets/lab/pushback/sheets/pm-piet.json';
import piet from '@/assets/lab/pushback/sheets/pm-piet.png';
import propsMeta from '@/assets/lab/pushback/sheets/props.json';
import props from '@/assets/lab/pushback/sheets/props.png';
import {
  PROPS,
  type SheetId,
  type SheetMeta,
  type Swap,
  handAnchor,
  swapKey,
} from '@/lib/lab/pushback/sprites';

/** Sheets used as they are, no swap: the key is the sheet */
export type PlainKey = 'ghost' | 'micdrop';

export interface Sheet {
  image: StaticImageData;
  meta: SheetMeta;
}

export const SHEETS: Record<SheetId | PlainKey | 'props', Sheet> = {
  'pm-jo': { image: jo, meta: joMeta },
  'pm-piet': { image: piet, meta: pietMeta },
  'dev-sam': { image: sam, meta: samMeta },
  'dev-lena': { image: lena, meta: lenaMeta },
  'designer-ines': { image: ines, meta: inesMeta },
  'designer-theo': { image: theo, meta: theoMeta },
  boss: { image: boss, meta: bossMeta },
  ghost: { image: ghost, meta: ghostMeta },
  micdrop: { image: micdrop, meta: micdropMeta },
  props: { image: props, meta: propsMeta },
};

/** A built sprite: the cells in a row, ready for `drawImage` */
export interface Sprite {
  canvas: HTMLCanvasElement;
  meta: SheetMeta;
}

/** The ghost sheet as a sprite, by this key */
export const GHOST_KEY = 'ghost';
/** The mic-drop burst sheet, by this key */
export const BURST_KEY = 'micdrop';

// Loading
// ---------------

const images = new Map<string, Promise<HTMLImageElement>>();

const loadImage = (src: string): Promise<HTMLImageElement> => {
  let pending = images.get(src);
  if (!pending) {
    pending = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load ${src}`));
      image.src = src;
    });
    images.set(src, pending);
  }
  return pending;
};

const sprites = new Map<string, Sprite>();
const building = new Map<string, Promise<Sprite>>();

/** Draw the sheet into a canvas of its size */
const toCanvas = (image: HTMLImageElement, meta: SheetMeta) => {
  const canvas = document.createElement('canvas');
  canvas.width = meta.cell.width * meta.count;
  canvas.height = meta.cell.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No 2d context');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);
  return { canvas, ctx };
};

/** Build the sprite of a swap: the base, then the prop in every cell */
const build = async (swap: Swap): Promise<Sprite> => {
  const sheet = SHEETS[swap.base];
  const [image, propImage] = await Promise.all([
    loadImage(sheet.image.src),
    swap.prop ? loadImage(SHEETS.props.image.src) : null,
  ]);
  const { canvas, ctx } = toCanvas(image, sheet.meta);
  if (swap.prop && propImage) {
    const index = PROPS.indexOf(swap.prop);
    const { width, height } = SHEETS.props.meta.cell;
    sheet.meta.cells.forEach((cell, i) => {
      const hand = handAnchor(cell.box);
      ctx.drawImage(
        propImage,
        index * width,
        0,
        width,
        height,
        i * sheet.meta.cell.width + hand.x - Math.round(width / 2),
        hand.y - Math.round(height / 2),
        width,
        height,
      );
    });
  }
  return { canvas, meta: sheet.meta };
};

/** A sheet as it is: the ghost, the burst */
const buildPlain = async (id: PlainKey): Promise<Sprite> => {
  const sheet = SHEETS[id];
  const image = await loadImage(sheet.image.src);
  return { canvas: toCanvas(image, sheet.meta).canvas, meta: sheet.meta };
};

/** The sprite of a key, once built; `undefined` until then */
export const getSprite = (key: string): Sprite | undefined => sprites.get(key);

/** Start building a swap's sprite (or a plain sheet's); resolves when drawn */
export const loadSprite = (
  key: string,
  swap: Swap | PlainKey,
): Promise<Sprite> => {
  const done = sprites.get(key);
  if (done) return Promise.resolve(done);
  let pending = building.get(key);
  if (!pending) {
    pending = (typeof swap === 'string' ? buildPlain(swap) : build(swap)).then(
      sprite => {
        sprites.set(key, sprite);
        building.delete(key);
        return sprite;
      },
    );
    building.set(key, pending);
  }
  return pending;
};

/** What a frame needs: sprites by key */
export type Sprites = Record<string, Sprite | undefined>;

/**
 * The sprites of some swaps (and the ghost), built in the background;
 * returns what is ready and rerenders as more lands.
 */
export const useSprites = (swaps: Record<string, Swap | PlainKey>): Sprites => {
  const [, setReady] = useState(0);
  useEffect(() => {
    // Cheap on every render: only a missing sprite starts a build, and
    // only a finished build rerenders
    let live = true;
    for (const [key, swap] of Object.entries(swaps)) {
      if (sprites.has(key)) continue;
      loadSprite(key, swap)
        .then(() => live && setReady(n => n + 1))
        .catch(() => {});
    }
    return () => {
      live = false;
    };
  }, [swaps]);
  const ready: Sprites = {};
  for (const key of Object.keys(swaps)) ready[key] = sprites.get(key);
  return ready;
};

/** The key a swap's sprite is cached under */
export const keyFor = (swap: Swap): string => swapKey(swap);
