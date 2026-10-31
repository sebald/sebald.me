/**
 * The sheets cut by `.claude/skills/pixel-sprite/scripts/sheet.mjs`, and
 * the sprites built from them in the browser: each sheet drawn into a
 * canvas once and cached (see `src/lib/lab/pushback/sprites.ts` for which
 * sheet a character uses).
 */
import type { StaticImageData } from 'next/image';
import { useEffect, useState } from 'react';

import bossMeta from '@/assets/lab/pushback/sheets/boss.json';
import boss from '@/assets/lab/pushback/sheets/boss.png';
import inesMeta from '@/assets/lab/pushback/sheets/designer-ines.json';
import ines from '@/assets/lab/pushback/sheets/designer-ines.png';
import kimMeta from '@/assets/lab/pushback/sheets/designer-kim.json';
import kim from '@/assets/lab/pushback/sheets/designer-kim.png';
import theoMeta from '@/assets/lab/pushback/sheets/designer-theo.json';
import theo from '@/assets/lab/pushback/sheets/designer-theo.png';
import boMeta from '@/assets/lab/pushback/sheets/dev-bo.json';
import bo from '@/assets/lab/pushback/sheets/dev-bo.png';
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
import nadiaMeta from '@/assets/lab/pushback/sheets/pm-nadia.json';
import nadia from '@/assets/lab/pushback/sheets/pm-nadia.png';
import pietMeta from '@/assets/lab/pushback/sheets/pm-piet.json';
import piet from '@/assets/lab/pushback/sheets/pm-piet.png';
import type { SheetId, SheetMeta } from '@/lib/lab/pushback/sprites';

/** The sheets that are not a character's */
export type PlainKey = 'ghost' | 'micdrop';

/** Every sheet, by the key its sprite is cached under */
export type SheetKey = SheetId | PlainKey;

export interface Sheet {
  image: StaticImageData;
  meta: SheetMeta;
}

export const SHEETS: Record<SheetKey, Sheet> = {
  'pm-jo': { image: jo, meta: joMeta },
  'pm-piet': { image: piet, meta: pietMeta },
  'pm-nadia': { image: nadia, meta: nadiaMeta },
  'dev-sam': { image: sam, meta: samMeta },
  'dev-lena': { image: lena, meta: lenaMeta },
  'dev-bo': { image: bo, meta: boMeta },
  'designer-ines': { image: ines, meta: inesMeta },
  'designer-theo': { image: theo, meta: theoMeta },
  'designer-kim': { image: kim, meta: kimMeta },
  boss: { image: boss, meta: bossMeta },
  ghost: { image: ghost, meta: ghostMeta },
  micdrop: { image: micdrop, meta: micdropMeta },
};

/** A built sprite: the cells in a row, ready for `drawImage` */
export interface Sprite {
  canvas: HTMLCanvasElement;
  meta: SheetMeta;
}

/** The ghost sheet as a sprite, by this key */
export const GHOST_KEY: PlainKey = 'ghost';
/** The mic-drop burst sheet, by this key */
export const BURST_KEY: PlainKey = 'micdrop';

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

/** Build a sheet's sprite */
const build = async (id: SheetKey): Promise<Sprite> => {
  const sheet = SHEETS[id];
  const image = await loadImage(sheet.image.src);
  return { canvas: toCanvas(image, sheet.meta).canvas, meta: sheet.meta };
};

/** The sprite of a sheet, once built; `undefined` until then */
export const getSprite = (key: SheetKey): Sprite | undefined =>
  sprites.get(key);

/** Start building a sheet's sprite; resolves when drawn */
export const loadSprite = (key: SheetKey): Promise<Sprite> => {
  const done = sprites.get(key);
  if (done) return Promise.resolve(done);
  let pending = building.get(key);
  if (!pending) {
    pending = build(key).then(sprite => {
      sprites.set(key, sprite);
      building.delete(key);
      return sprite;
    });
    building.set(key, pending);
  }
  return pending;
};

/** What a piece needs: sprites by sheet */
export type Sprites = Partial<Record<SheetKey, Sprite>>;

/**
 * The sprites of some sheets, built in the background; returns what is
 * ready and rerenders as more lands.
 */
export const useSprites = (keys: readonly SheetKey[]): Sprites => {
  const [, setReady] = useState(0);
  useEffect(() => {
    // Cheap on every render: only a missing sprite starts a build, and
    // only a finished build rerenders
    let live = true;
    for (const key of keys) {
      if (sprites.has(key)) continue;
      loadSprite(key)
        .then(() => live && setReady(n => n + 1))
        .catch(() => {});
    }
    return () => {
      live = false;
    };
  }, [keys]);
  const ready: Sprites = {};
  for (const key of keys) ready[key] = sprites.get(key);
  return ready;
};
