'use client';

import { useMemo, useState } from 'react';

import { LOOKS, type Look } from '@/lib/lab/pushback/characters';
import {
  ROLE_BLURBS,
  ROLE_LABELS,
  ROLES,
  type Role,
} from '@/lib/lab/pushback/lines';
import { PLAYER_SHEETS, type SheetId } from '@/lib/lab/pushback/sprites';
import { LAYOUT } from '@/lib/lab/pushback/stage';
import { cn, cva } from '@/lib/styles.utils';

import { Character } from './character';
import { CHROME } from './draw';
import { SCENE_ASSETS } from './scenes';
import { SHEETS } from './sheets';
import { Stage } from './stage';
import { useClock } from './use-clock';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

/** The portrait is the sheet's head square at twice its pixels */
const PORTRAIT_SCALE = 2;

/** Where things sit on the stage, in stage pixels */
const PLACE = {
  /** The grid of faces: left edge, top, the gap between tiles */
  grid: { x: 18, y: 24, gap: 4 },
  /** The frame around a tile, and the ink line outside it */
  frame: 2,
  /** The chosen one standing, cell left edge */
  figure: { x: 214 },
} as const;

const px = (n: number) => `calc(var(--px) * ${n})`;

const styles = {
  tile: cva({
    base: [
      'relative block cursor-pointer bg-[#131829] outline-none',
      'transition-[filter] duration-150 focus-visible:ui-focus',
    ],
    variants: {
      active: {
        true: 'brightness-100',
        false: 'brightness-[0.65] hover:brightness-90',
      },
    },
  }),
  role: cva({
    base: 'absolute text-center text-[0.75em] font-semibold',
    variants: {
      active: { true: 'text-[#f3eedc]', false: 'text-[#5c6488]' },
    },
  }),
};

/**
 * A look's face: the head square `features.mjs` found in the idle cell,
 * as a CSS sprite at twice the stage's pixels, hard edges.
 */
const Portrait = ({ sheet }: { sheet: SheetId }) => {
  const { image, meta } = SHEETS[sheet];
  const head = meta.features?.head ?? {
    x: 24,
    y: 32,
    width: 24,
    height: 24,
  };
  const s = PORTRAIT_SCALE;
  return (
    <span
      aria-hidden
      className="block [image-rendering:pixelated]"
      style={{
        width: px(head.width * s),
        height: px(head.height * s),
        backgroundImage: `url(${image.src})`,
        backgroundSize: `${px(meta.cell.width * meta.count * s)} ${px(meta.cell.height * s)}`,
        backgroundPosition: `${px(-head.x * s)} ${px(-head.y * s)}`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};

interface SelectScreenProps {
  /** Existing runs, to say which roles are in progress or finished */
  runs: Partial<Record<Role, { finished: boolean; look: Look }>>;
  onConfirm: (role: Role, look: Look) => void;
  onBack: () => void;
}

/**
 * The six faces in a grid, a column per role and a row per look, the
 * way a fighting game shows its roster; the chosen one stands beside
 * the grid, breathing, and the role's blurb sits in the window below.
 * Left and right move across the roles, up and down between the looks,
 * Enter (or a second tap on the face) plays.
 */
export const SelectScreen = ({
  runs,
  onConfirm,
  onBack,
}: SelectScreenProps) => {
  // One cursor over the grid: a column per role, a row per look. It
  // starts on the first role, on the look its run has if there is one.
  const [cursor, setCursor] = useState({
    column: 0,
    row: runs[ROLES[0]!]?.look === 'b' ? 1 : 0,
  });
  const role = ROLES[cursor.column]!;
  const look: Look = cursor.row === 0 ? 'a' : 'b';
  const sheet = PLAYER_SHEETS[role][look];
  const run = runs[role];
  // The frame around the chosen face blinks, four times a second
  const clock = useClock();
  const lit = Math.floor(clock / 250) % 2 === 0;

  const move = (dc: number, dr: number) =>
    setCursor(({ column, row }) => ({
      column: (column + dc + ROLES.length) % ROLES.length,
      row: (row + dr + 2) % 2,
    }));

  useKeys(
    useMemo(
      () => ({
        ArrowLeft: () => move(-1, 0),
        a: () => move(-1, 0),
        ArrowRight: () => move(1, 0),
        d: () => move(1, 0),
        ArrowUp: () => move(0, -1),
        w: () => move(0, -1),
        ArrowDown: () => move(0, 1),
        s: () => move(0, 1),
        Enter: () => onConfirm(role, look),
        ' ': () => onConfirm(role, look),
        Escape: onBack,
      }),
      [role, look, onConfirm, onBack],
    ),
  );

  const head = SHEETS[sheet].meta.features?.head.width ?? 24;
  const tile = head * PORTRAIT_SCALE + PLACE.frame * 2;
  const step = tile + PLACE.grid.gap;

  return (
    <Stage label="Pushback, pick a role">
      {/* The corner office, dimmed, behind the roster */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center brightness-[0.3] [image-rendering:pixelated]"
        style={{ backgroundImage: `url(${SCENE_ASSETS.office.poster.src})` }}
      />

      <p
        className="absolute inset-x-0 text-center text-[0.85em] text-[#8a92b8]"
        style={{ top: px(8) }}
      >
        Pick a role.
      </p>

      {/* The grid: a column per role, a row per look */}
      <div>
        {ROLES.map((r, column) => (
          <span key={r}>
            <span
              className={styles.role({ active: r === role })}
              style={{
                left: px(PLACE.grid.x + column * step),
                width: px(tile),
                top: px(PLACE.grid.y + 2 * step + 2),
              }}
            >
              {ROLE_LABELS[r]}
            </span>
            {(['a', 'b'] as const).map((l, row) => {
              const active = column === cursor.column && row === cursor.row;
              const frame = active
                ? lit
                  ? CHROME.goldLight
                  : CHROME.gold
                : CHROME.frameDim;
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${ROLE_LABELS[r]}, ${LOOKS[r][l].name}`}
                  className={cn(styles.tile({ active }), 'absolute')}
                  style={{
                    left: px(PLACE.grid.x + column * step + PLACE.frame),
                    top: px(PLACE.grid.y + row * step + PLACE.frame),
                    boxShadow: `0 0 0 ${px(PLACE.frame)} ${frame}, 0 0 0 ${px(PLACE.frame + 1)} ${CHROME.ink}`,
                  }}
                  onClick={() => {
                    if (active) onConfirm(r, l);
                    else setCursor({ column, row });
                  }}
                >
                  <Portrait sheet={PLAYER_SHEETS[r][l]} />
                </button>
              );
            })}
          </span>
        ))}
      </div>

      {/* The chosen one, standing */}
      <Character key={sheet} sheet={sheet} x={PLACE.figure.x} />
      <div
        className="absolute text-center"
        style={{
          left: px(PLACE.figure.x - 20),
          width: px(LAYOUT.cell.width + 40),
          top: px(PLACE.grid.y + 2 * step + 2),
        }}
      >
        <div className="text-[0.85em] font-semibold text-[#f3eedc]">
          {LOOKS[role][look].name}
        </div>
        {run && (
          <div className="text-[0.7em] text-[#8a92b8]">
            {run.finished ? 'finished' : 'in progress'}
          </div>
        )}
      </div>

      <Window
        className="absolute inset-x-3 bottom-3"
        legend={
          <Legend
            keys={[
              ['←→', 'role'],
              ['↑↓', 'look'],
              ['Enter', run && !run.finished ? 'continue' : 'play'],
            ]}
            touch={`Tap the face again to ${run && !run.finished ? 'continue' : 'play'}`}
          />
        }
      >
        <p className="text-balance">{ROLE_BLURBS[role]}</p>
      </Window>
    </Stage>
  );
};
