'use client';

import { useMemo, useState } from 'react';

import { LOOKS, type Look } from '../lib/characters';
import { ROLE_LABELS, ROLES, type Role } from '../lib/lines';
import { PLAYER_SHEETS } from '../lib/sprites';
import { LAYOUT } from '../lib/stage';
import { effect } from './audio/engine';
import { Button } from './button';
import { Character } from './character';
import { Controls } from './controls';
import { PALETTE } from './palette';
import { Portrait } from './portrait';
import { SCENE_ASSETS } from './scenes';
import { SHEETS } from './sheets';
import { Stage, TALL_BAR, px } from './stage';
import { Stamp, stampSize } from './stamp';
import { cn, cva } from './styles.utils';
import { Heading, ScreenTitle } from './text';
import { useClock } from './use-clock';
import { useKeys } from './use-keys';
import { useScale } from './use-scale';
import { CornerLegend } from './window';

/**
 * The portrait is the sheet's head square at twice its pixels; held
 * upright, at three times, with the room the standing figure leaves
 */
const PORTRAIT_SCALE = { wide: 2, tall: 3 } as const;

/** The stamp sits this far above the tile's bottom edge, over the chin */
const STAMP_BOTTOM = 6;

/**
 * Where things sit on the stage, in stage pixels: the grid and the
 * column of the chosen one, 12 apart, centred across the stage and
 * between the title and the legend
 */
const PLACE = {
  /**
   * The grid of faces: left edge, top, and the gaps between tiles, wider
   * between the roles than between a role's two looks so each column
   * reads as a pair
   */
  grid: { x: 10, y: 40, gap: { column: 10, row: 4 } },
  /** The frame around a tile, and the ink line outside it */
  frame: 2,
  /** The chosen one's column (name and line), left edge and width */
  column: { x: 198, width: 112 },
  /** The figure's feet, this far below the grid's top */
  feet: 104,
} as const;

/**
 * Held upright: no standing figure, the faces larger instead, the grid
 * centred across the stage and the name and line under it, the whole
 * group centred in the rows between the title and the legend over the
 * bar (`tallTop`)
 */
const TALL_PLACE = {
  ...PLACE,
  grid: { ...PLACE.grid, x: 36, y: 0 },
  column: { x: 24, width: 272 },
  /** The name and line, this far below the grid's top */
  caption: 186,
  /** The group's height: the line's two rows of text and the button */
  height: 290,
  /** The title's rows, and the legend's over the bar */
  above: 44,
  below: 18,
} as const;

/** Where the tall group starts: centred in what the title and bar leave */
const tallTop = (rows: number, scale: number) =>
  Math.max(
    TALL_PLACE.above,
    Math.round(
      TALL_PLACE.above +
        (rows -
          TALL_BAR / scale -
          TALL_PLACE.below -
          TALL_PLACE.above -
          TALL_PLACE.height) /
          2,
    ),
  );

const styles = {
  tile: cva({
    base: 'group relative block cursor-pointer bg-(--pb-fill) outline-none focus-visible:pb-focus',
  }),
  /** The face, dimmed unless chosen; the stamp over it stays lit */
  face: cva({
    base: 'block transition-[filter] duration-150',
    variants: {
      active: {
        true: 'brightness-100',
        false: 'brightness-[0.65] group-hover:brightness-90',
      },
    },
  }),
  role: cva({
    base: 'absolute text-center text-[0.75em] font-semibold',
    variants: {
      active: { true: 'text-(--pb-heading)', false: 'text-(--pb-dim)' },
    },
  }),
};

interface SelectScreenProps {
  /** The roles the Stakeholder signed off, with the look that did it */
  shipped: Partial<Record<Role, Look>>;
  onConfirm: (role: Role, look: Look) => void;
  onBack: () => void;
}

/**
 * The six faces in a grid, a column per role and a row per look, the
 * way a fighting game shows its roster; the chosen one stands beside
 * the grid, breathing, with a line about them under their name. The
 * look that shipped a role wears a SHIPPED stamp across its face.
 * Left and right move across the roles, up and down between the looks,
 * Enter (or a second tap on the face) plays.
 */
export const SelectScreen = ({
  shipped,
  onConfirm,
  onBack,
}: SelectScreenProps) => {
  // One cursor over the grid: a column per role, a row per look
  const [cursor, setCursor] = useState({ column: 0, row: 0 });
  const role = ROLES[cursor.column]!;
  const look: Look = cursor.row === 0 ? 'a' : 'b';
  const sheet = PLAYER_SHEETS[role][look];
  // The frame around the chosen face blinks, four times a second
  const clock = useClock();
  const lit = Math.floor(clock / 250) % 2 === 0;

  const move = (dc: number, dr: number) => {
    effect('cursor');
    setCursor(({ column, row }) => ({
      column: (column + dc + ROLES.length) % ROLES.length,
      row: (row + dr + 2) % 2,
    }));
  };

  useKeys(
    useMemo(() => {
      const play = () => {
        effect('confirm');
        onConfirm(role, look);
      };
      return {
        ArrowLeft: () => move(-1, 0),
        a: () => move(-1, 0),
        ArrowRight: () => move(1, 0),
        d: () => move(1, 0),
        ArrowUp: () => move(0, -1),
        w: () => move(0, -1),
        ArrowDown: () => move(0, 1),
        s: () => move(0, 1),
        Enter: play,
        ' ': play,
        Escape: () => {
          effect('cancel');
          onBack();
        },
      };
    }, [role, look, onConfirm, onBack]),
  );

  const { tall, rows, scale } = useScale();
  const place = tall
    ? {
        ...TALL_PLACE,
        grid: { ...TALL_PLACE.grid, y: tallTop(rows, scale) },
      }
    : PLACE;
  const portraitScale = PORTRAIT_SCALE[tall ? 'tall' : 'wide'];
  const head = SHEETS[sheet].meta.features?.head.width ?? 24;
  const tile = head * portraitScale + place.frame * 2;
  const step = {
    x: tile + place.grid.gap.column,
    y: tile + place.grid.gap.row,
  };

  return (
    <Stage label="Pushback, pick a role">
      {/* The corner office, dimmed, behind the roster */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center brightness-[0.3] [image-rendering:pixelated]"
        style={{ backgroundImage: `url(${SCENE_ASSETS.office.poster.src})` }}
      />

      <ScreenTitle>Pick a role</ScreenTitle>

      {/* The grid: a column per role, a row per look */}
      <div>
        {ROLES.map((r, column) => (
          <span key={r}>
            <span
              className={styles.role({ active: r === role })}
              style={{
                left: px(place.grid.x + column * step.x),
                width: px(tile),
                top: px(place.grid.y + 2 * step.y + 2),
              }}
            >
              {ROLE_LABELS[r]}
            </span>
            {(['a', 'b'] as const).map((l, row) => {
              const active = column === cursor.column && row === cursor.row;
              const stamped = shipped[r] === l;
              const frame = active
                ? lit
                  ? PALETTE.goldLight
                  : PALETTE.gold
                : PALETTE.frameDim;
              return (
                <button
                  key={l}
                  type="button"
                  aria-pressed={active}
                  aria-label={[
                    ROLE_LABELS[r],
                    LOOKS[r][l].name,
                    stamped && 'shipped',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  className={cn(styles.tile(), 'absolute')}
                  style={{
                    left: px(place.grid.x + column * step.x + place.frame),
                    top: px(place.grid.y + row * step.y + place.frame),
                    boxShadow: `0 0 0 ${px(place.frame)} ${frame}, 0 0 0 ${px(place.frame + 1)} ${PALETTE.ink}`,
                  }}
                  onClick={() => {
                    // The picker's sounds: a confirm to play, the cursor to move
                    effect(active ? 'confirm' : 'cursor');
                    if (active) onConfirm(r, l);
                    else setCursor({ column, row });
                  }}
                >
                  <span className={styles.face({ active })}>
                    <Portrait
                      sheet={PLAYER_SHEETS[r][l]}
                      scale={portraitScale}
                    />
                  </span>
                  {/* The look that shipped the role: the stamp across
                      the lower face */}
                  {stamped && (
                    <Stamp
                      word="SHIPPED"
                      className="absolute"
                      style={{
                        left: px(
                          (tile -
                            place.frame * 2 -
                            stampSize('SHIPPED').width) /
                            2,
                        ),
                        bottom: px(STAMP_BOTTOM),
                      }}
                    />
                  )}
                </button>
              );
            })}
          </span>
        ))}
      </div>

      {/* The chosen one, standing; held upright the faces are enough */}
      {!tall && (
        <Character
          key={sheet}
          sheet={sheet}
          x={place.column.x + (place.column.width - LAYOUT.cell.width) / 2}
          feet={place.grid.y + place.feet}
        />
      )}
      <div
        className="absolute text-center"
        style={{
          left: px(place.column.x),
          width: px(place.column.width),
          top: px(place.grid.y + (tall ? TALL_PLACE.caption : 2 * step.y + 2)),
        }}
      >
        <Heading level={3} className="text-[0.85em]">
          {LOOKS[role][look].name}
          <span className="font-normal text-(--pb-muted)">
            {' · '}
            {ROLE_LABELS[role]}
          </span>
        </Heading>
        <p className="m-0 mt-[calc(var(--px)*2)] text-[0.75em] leading-snug text-balance text-(--pb-text)">
          {LOOKS[role][look].quip}
        </p>
        {/* Held upright a tap only chooses a face: this plays it, where a
            second tap on the face would not be found */}
        {tall && (
          <Button
            className="mx-auto mt-[calc(var(--px)*8)] block w-fit"
            onClick={() => {
              effect('confirm');
              onConfirm(role, look);
            }}
          >
            Start
          </Button>
        )}
      </div>

      <CornerLegend
        keys={[
          ['←→', 'role'],
          ['↑↓', 'look'],
          ['Enter', 'play'],
          ['M', 'sound'],
        ]}
        touch={tall ? 'Tap a face to choose' : 'Tap the face again to play'}
      />
      <Controls
        escape={{
          kind: 'back',
          onPress: () => {
            effect('cancel');
            onBack();
          },
        }}
      />
    </Stage>
  );
};
