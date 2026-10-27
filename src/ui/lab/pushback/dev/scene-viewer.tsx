'use client';

import NextImage from 'next/image';
import { useState } from 'react';

import {
  CHARACTERS,
  type SceneId,
  STANDS,
  SCENE_OF,
} from '@/lib/lab/pushback/characters';
import { LAYOUT, STAGE } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { SCENE_ASSETS, loopFor } from '../scenes';

const SCENES: SceneId[] = ['floor', 'meeting', 'studio', 'office'];

/** The band the composition rule keeps clear, in native pixels */
const CLEAR_BAND = { x0: 60, x1: 170, x2: 310, x3: 420, y0: 60, y1: 225 };

const px = (n: number, scale: number) => `${n * scale}px`;

/**
 * Scene viewer: each scene's loop or poster at 1x to 4x, with the stand
 * cells and the clear band drawn over it as outlines.
 */
export const SceneViewer = () => {
  const [scene, setScene] = useState<SceneId>('floor');
  const [scale, setScale] = useState(2);
  const [still, setStill] = useState(false);
  const [guides, setGuides] = useState(true);

  const assets = SCENE_ASSETS[scene];
  const image = still ? assets.poster : loopFor(assets, scale);
  const stands = STANDS[scene];
  const width = STAGE.width * scale;
  const height = STAGE.height * scale;
  const usedBy = (Object.keys(SCENE_OF) as (keyof typeof SCENE_OF)[])
    .filter(role => SCENE_OF[role] === scene)
    .join(', ');

  const outline = (
    x: number,
    y: number,
    w: number,
    h: number,
    colour: string,
    label: string,
  ) => (
    <div
      key={label}
      className={cn(
        'absolute border font-mono text-[10px] leading-none',
        colour,
      )}
      style={{
        left: px(x, scale),
        top: px(y, scale),
        width: px(w, scale),
        height: px(h, scale),
      }}
    >
      <span className="absolute -top-3 left-0 bg-mist-950/80 px-0.5">
        {label}
      </span>
    </div>
  );

  return (
    <section className="grid gap-3 font-mono text-sm">
      <h2 className="text-mist-200">Scene viewer</h2>
      <form
        className="flex flex-wrap items-center gap-3 text-mist-300"
        onSubmit={e => e.preventDefault()}
      >
        <label className="flex items-center gap-1">
          Scene
          <select
            value={scene}
            onChange={e => setScene(e.target.value as SceneId)}
            className="rounded bg-mist-900 px-1 py-0.5 text-mist-100"
          >
            {SCENES.map(id => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Scale
          <select
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
            className="rounded bg-mist-900 px-1 py-0.5 text-mist-100"
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={still}
            onChange={e => setStill(e.target.checked)}
          />
          Poster
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={guides}
            onChange={e => setGuides(e.target.checked)}
          />
          Guides
        </label>
        <span className="text-mist-500">
          {usedBy} ·{' '}
          {still ? 'poster.png' : scale <= 1 ? 'scene-1x.webp' : 'scene.webp'}
        </span>
      </form>

      <div
        className="relative overflow-x-auto"
        style={{ width, height, marginInline: `calc(50% - ${width / 2}px)` }}
      >
        <NextImage
          src={image}
          alt=""
          width={STAGE.width}
          height={STAGE.height}
          unoptimized
          className={cn(
            'absolute inset-0 h-full w-full',
            scale <= 1 && '[image-rendering:pixelated]',
          )}
          style={{ width, height }}
        />
        {guides ? (
          <>
            {outline(
              CLEAR_BAND.x0,
              CLEAR_BAND.y0,
              CLEAR_BAND.x1 - CLEAR_BAND.x0,
              CLEAR_BAND.y1 - CLEAR_BAND.y0,
              'border-dashed border-sky-300/70 text-sky-200',
              'clear band, left',
            )}
            {outline(
              CLEAR_BAND.x2,
              CLEAR_BAND.y0,
              CLEAR_BAND.x3 - CLEAR_BAND.x2,
              CLEAR_BAND.y1 - CLEAR_BAND.y0,
              'border-dashed border-sky-300/70 text-sky-200',
              'clear band, right',
            )}
            {outline(
              stands.left,
              LAYOUT.feet - LAYOUT.cell.height,
              LAYOUT.cell.width,
              LAYOUT.cell.height,
              'border-amber-300 text-amber-200',
              `player ${stands.left}`,
            )}
            {outline(
              stands.right,
              LAYOUT.feet - LAYOUT.cell.height,
              LAYOUT.cell.width,
              LAYOUT.cell.height,
              'border-amber-300 text-amber-200',
              `opponent ${stands.right}`,
            )}
            {outline(
              0,
              0,
              STAGE.width,
              LAYOUT.top,
              'border-mist-300/50 text-mist-300',
              'bars',
            )}
            {outline(
              0,
              LAYOUT.feet,
              STAGE.width,
              STAGE.height - LAYOUT.feet,
              'border-mist-300/50 text-mist-300',
              'dialogue box',
            )}
          </>
        ) : null}
      </div>
      <p className="text-mist-500">
        Opponents in this scene:{' '}
        {CHARACTERS.filter(c => SCENE_OF[c.role] === scene)
          .map(c => c.name)
          .join(', ')}
        . The cells are 72 by 112 with the feet on y {LAYOUT.feet}; the figures
        must not overlap furniture.
      </p>
    </section>
  );
};
