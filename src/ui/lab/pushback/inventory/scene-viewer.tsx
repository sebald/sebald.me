'use client';

import NextImage from 'next/image';
import { useState } from 'react';

import {
  CHARACTERS,
  LOOKS,
  type SceneId,
  STANDS,
  SCENE_OF,
} from '@/lib/lab/pushback/characters';
import { ROLES } from '@/lib/lab/pushback/lines';
import { PLAYER_SHEETS, type SheetId } from '@/lib/lab/pushback/sprites';
import { LAYOUT, SCENE, STAGE, viewFor } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { Character } from '../character';
import { SCENE_ASSETS, loopFor } from '../scenes';
import { Pixels } from '../stage';

const SCENES: SceneId[] = ['floor', 'meeting', 'studio', 'office'];

/** The band the composition rule keeps clear, in native pixels */
const CLEAR_BAND = { x0: 60, x1: 170, x2: 310, x3: 420, y0: 60, y1: 225 };

const px = (n: number, scale: number) => `${n * scale}px`;

/** Everyone who can stand in a scene: the six looks and the cast */
const FIGURES: { label: string; sheet: SheetId }[] = [
  ...ROLES.flatMap(role =>
    (['a', 'b'] as const).map(look => ({
      label: LOOKS[role][look].name,
      sheet: PLAYER_SHEETS[role][look],
    })),
  ),
  ...CHARACTERS.map(c => ({ label: c.name, sheet: c.sheet })),
];

/** The figures a scene shows by default: the role's first look, its first colleague */
const defaultFigures = (scene: SceneId) => {
  const role = (Object.keys(SCENE_OF) as (keyof typeof SCENE_OF)[]).find(
    r => SCENE_OF[r] === scene,
  );
  const playerRole = role && role !== 'boss' ? role : 'pm';
  const player = LOOKS[playerRole].a.name;
  // A colleague of the scene's role who is not the player's twin
  const opponent =
    CHARACTERS.find(
      c => c.role === role && c.sheet !== PLAYER_SHEETS[playerRole].a,
    )?.name ?? FIGURES[0]!.label;
  return { player, opponent };
};

/**
 * Scene viewer: each scene's loop or poster at 1x to 4x, with the stand
 * cells and the clear band drawn over it as outlines, and two idle
 * figures on the stands, so the furniture can be judged against the
 * people (a desk is a desk only if it reaches their hips).
 */
export const SceneViewer = () => {
  const [scene, setSceneOnly] = useState<SceneId>('floor');
  const [scale, setScale] = useState(2);
  const [still, setStill] = useState(false);
  const [guides, setGuides] = useState(true);
  const [figures, setFigures] = useState(true);
  const [who, setWho] = useState(defaultFigures('floor'));
  const setScene = (next: SceneId) => {
    setSceneOnly(next);
    setWho(defaultFigures(next));
  };
  const sheetOf = (label: string) =>
    (FIGURES.find(f => f.label === label) ?? FIGURES[0]!).sheet;

  const assets = SCENE_ASSETS[scene];
  const image = still ? assets.poster : loopFor(assets, true);
  const stands = STANDS[scene];
  const view = viewFor(stands);
  const width = SCENE.width * scale;
  const height = SCENE.height * scale;
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
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={figures}
            onChange={e => setFigures(e.target.checked)}
          />
          Figures
        </label>
        <label className="flex items-center gap-1">
          Left
          <select
            value={who.player}
            onChange={e => setWho({ ...who, player: e.target.value })}
            className="rounded bg-mist-900 px-1 py-0.5 text-mist-100"
          >
            {FIGURES.map(f => (
              <option key={f.label} value={f.label}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          Right
          <select
            value={who.opponent}
            onChange={e => setWho({ ...who, opponent: e.target.value })}
            className="rounded bg-mist-900 px-1 py-0.5 text-mist-100"
          >
            {FIGURES.map(f => (
              <option key={f.label} value={f.label}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-mist-500">
          {usedBy} · {still ? 'poster.png' : 'scene-1x.webp'}
        </span>
      </form>

      <Pixels scale={scale}>
        <div
          className="relative overflow-x-auto"
          style={{ width, height, marginInline: `calc(50% - ${width / 2}px)` }}
        >
          <NextImage
            src={image}
            alt=""
            width={SCENE.width}
            height={SCENE.height}
            unoptimized
            className={cn(
              'absolute inset-0 h-full w-full',
              '[image-rendering:pixelated]',
            )}
            style={{ width, height }}
          />
          {figures && (
            <>
              <Character
                key={`l-${who.player}`}
                sheet={sheetOf(who.player)}
                x={stands.left}
                feet={SCENE.feet}
              />
              <Character
                key={`r-${who.opponent}`}
                sheet={sheetOf(who.opponent)}
                x={stands.right}
                feet={SCENE.feet}
                mirrored
                side="opponent"
              />
            </>
          )}
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
                SCENE.feet - LAYOUT.cell.height,
                LAYOUT.cell.width,
                LAYOUT.cell.height,
                'border-amber-300 text-amber-200',
                `player ${stands.left}`,
              )}
              {outline(
                stands.right,
                SCENE.feet - LAYOUT.cell.height,
                LAYOUT.cell.width,
                LAYOUT.cell.height,
                'border-amber-300 text-amber-200',
                `opponent ${stands.right}`,
              )}
              {outline(
                view.x,
                view.y,
                STAGE.width,
                LAYOUT.band,
                'border-mist-300/70 text-mist-300',
                `the band, from ${view.x}, ${view.y}`,
              )}
            </>
          ) : null}
        </div>
      </Pixels>
      <p className="text-mist-500">
        Opponents in this scene:{' '}
        {CHARACTERS.filter(c => SCENE_OF[c.role] === scene)
          .map(c => c.name)
          .join(', ')}
        . The cells are {LAYOUT.cell.width} by {LAYOUT.cell.height} with the
        feet on y {SCENE.feet}; the figures must not overlap furniture, and the
        band is what the stage shows of the render. The figures are the
        yardstick for the room: a desk reaches a hip, a chair a knee, a door a
        head and a half.
      </p>
    </section>
  );
};
