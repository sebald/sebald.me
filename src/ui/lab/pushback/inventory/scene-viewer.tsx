'use client';

import {
  CHARACTERS,
  LOOKS,
  type SceneId,
  STANDS,
  SCENE_OF,
} from '@sebald/pushback/lib/characters';
import { ROLES } from '@sebald/pushback/lib/lines';
import { PLAYER_SHEETS, type SheetId } from '@sebald/pushback/lib/sprites';
import { LAYOUT, SCENE, STAGE, viewFor } from '@sebald/pushback/lib/stage';
import { Character } from '@sebald/pushback/ui/character';
import { SCENE_ASSETS, loopFor } from '@sebald/pushback/ui/scenes';
import { Pixels } from '@sebald/pushback/ui/stage';
import NextImage from 'next/image';
import { useState } from 'react';

import { cn } from '@/lib/styles.utils';

import {
  DemoForm,
  Field,
  SCENES,
  ScaleSelect,
  Select,
  field,
} from './controls';

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
 * Scene viewer: each scene's loop or poster at 1x to 4x, through the
 * band's window as the game shows it (or the whole render), with the
 * stand cells and the window drawn over it as outlines, and two idle
 * figures on the stands, so the furniture can be judged against the
 * people (a desk is a desk only if it reaches their hips).
 */
export const SceneViewer = () => {
  const [scene, setSceneOnly] = useState<SceneId>('floor');
  const [scale, setScale] = useState(2);
  const [still, setStill] = useState(false);
  const [guides, setGuides] = useState(true);
  const [figures, setFigures] = useState(true);
  // The band's window of the render, as the game shows it, or the whole
  const [windowed, setWindowed] = useState(true);
  // The room scaled about the stands' feet, the figures as they are: to
  // find the factor at which the furniture fits the people
  const [room, setRoom] = useState(1);
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
  const shown = windowed
    ? { width: STAGE.width * scale, height: LAYOUT.band * scale }
    : { width, height };
  const offset = windowed ? { x: -view.x, y: -view.y } : { x: 0, y: 0 };
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
    <div className="grid gap-3 font-mono text-sm">
      <DemoForm>
        <Select
          label="Scene"
          value={scene}
          options={SCENES}
          onChange={setScene}
        />
        <ScaleSelect value={scale} scales={[1, 2, 3, 4]} onChange={setScale} />
        <Field label="Poster">
          <input
            type="checkbox"
            checked={still}
            onChange={e => setStill(e.target.checked)}
          />
        </Field>
        <Field label="Window">
          <input
            type="checkbox"
            checked={windowed}
            onChange={e => setWindowed(e.target.checked)}
          />
        </Field>
        <Field label="Guides">
          <input
            type="checkbox"
            checked={guides}
            onChange={e => setGuides(e.target.checked)}
          />
        </Field>
        <Field label="Figures">
          <input
            type="checkbox"
            checked={figures}
            onChange={e => setFigures(e.target.checked)}
          />
        </Field>
        <Field label={`Room ×${room.toFixed(2)}`}>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={room}
            onChange={e => setRoom(Number(e.target.value))}
          />
          <button
            type="button"
            className={field.input}
            onClick={() => setRoom(1)}
          >
            1
          </button>
        </Field>
        <Select
          label="Left"
          value={who.player}
          options={FIGURES.map(f => f.label)}
          onChange={player => setWho({ ...who, player })}
        />
        <Select
          label="Right"
          value={who.opponent}
          options={FIGURES.map(f => f.label)}
          onChange={opponent => setWho({ ...who, opponent })}
        />
        <span className="text-mist-500">
          {usedBy} · {still ? 'poster.png' : 'scene-1x.webp'}
        </span>
      </DemoForm>

      <Pixels scale={scale}>
        <div
          className="relative overflow-hidden"
          style={{
            width: shown.width,
            height: shown.height,
            marginInline: `calc(50% - ${shown.width / 2}px)`,
          }}
        >
          <div
            className="absolute"
            style={{
              left: px(offset.x, scale),
              top: px(offset.y, scale),
              width,
              height,
            }}
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
              style={{
                width,
                height,
                transform: `scale(${room})`,
                transformOrigin: `50% ${px(SCENE.feet, scale)}`,
              }}
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
        head and a half. Scale the room until that holds and note the factor
        {room !== 1 ? ` (now ×${room.toFixed(2)})` : ''}; the render is then
        regenerated or resampled to it.
      </p>
    </div>
  );
};
