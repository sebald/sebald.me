'use client';

import { useMemo, useState } from 'react';

import { LOOKS, type Look } from '@/lib/lab/pushback/characters';
import {
  ROLE_BLURBS,
  ROLE_LABELS,
  ROLES,
  type Role,
} from '@/lib/lab/pushback/lines';
import { PLAYER_SHEETS } from '@/lib/lab/pushback/sprites';
import { LAYOUT } from '@/lib/lab/pushback/stage';
import { cn } from '@/lib/styles.utils';

import { SHEETS } from './sheets';
import { Stage } from './stage';
import { useKeys } from './use-keys';

/** The empty rows above the tallest idle figure, cropped off the cell */
const CROP_TOP = 26;

/**
 * A look's idle cell as a CSS sprite in stage pixels (`--px`): the sheet
 * as background, its first cell shown, with hard edges.
 */
const IdleSprite = ({ role, look }: { role: Role; look: Look }) => {
  const sheet = SHEETS[PLAYER_SHEETS[role][look]];
  const { width, height } = LAYOUT.cell;
  return (
    <span
      aria-hidden
      className="block [image-rendering:pixelated]"
      style={{
        width: `calc(var(--px) * ${width})`,
        height: `calc(var(--px) * ${height - CROP_TOP})`,
        backgroundImage: `url(${sheet.image.src})`,
        backgroundSize: `calc(var(--px) * ${width * sheet.meta.count}) calc(var(--px) * ${height})`,
        backgroundPosition: `0 calc(var(--px) * -${CROP_TOP})`,
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
 * Three roles side by side, one idle sprite each. Left/right picks the
 * role, up/down or a tap on the sprite flips the look, Enter or a second
 * tap confirms.
 */
export const SelectScreen = ({
  runs,
  onConfirm,
  onBack,
}: SelectScreenProps) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [looks, setLooks] = useState<Record<Role, Look>>({
    pm: runs.pm?.look ?? 'a',
    dev: runs.dev?.look ?? 'a',
    designer: runs.designer?.look ?? 'a',
  });
  const role = ROLES[roleIndex]!;
  const look = looks[role];

  const flip = (target: Role) =>
    setLooks(previous => ({
      ...previous,
      [target]: previous[target] === 'a' ? 'b' : 'a',
    }));

  useKeys(
    useMemo(
      () => ({
        ArrowLeft: () => setRoleIndex(i => (i + 2) % 3),
        a: () => setRoleIndex(i => (i + 2) % 3),
        ArrowRight: () => setRoleIndex(i => (i + 1) % 3),
        d: () => setRoleIndex(i => (i + 1) % 3),
        ArrowUp: () => flip(role),
        ArrowDown: () => flip(role),
        w: () => flip(role),
        s: () => flip(role),
        Enter: () => onConfirm(role, look),
        ' ': () => onConfirm(role, look),
        Escape: onBack,
      }),
      [role, look, onConfirm, onBack],
    ),
  );

  return (
    <Stage label="Pushback, pick a role">
      {/* The box is absolute at the bottom: the roles sit above it */}
      <Stage.Center className="justify-between py-6 pb-[calc(var(--px)*48)]">
        <Stage.Muted>Pick a role. Up or down flips the look.</Stage.Muted>
        <div
          className="grid w-full grid-cols-3 gap-2 md:gap-4"
          aria-label="Role"
        >
          {ROLES.map((r, i) => {
            const active = i === roleIndex;
            const run = runs[r];
            return (
              <div key={r} className="grid justify-items-center gap-2">
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`${ROLE_LABELS[r]}, ${LOOKS[r][looks[r]].name}`}
                  className={cn(
                    'grid place-items-center rounded-lg p-[calc(var(--px)*2)] transition-all duration-150',
                    'outline-none focus-visible:ui-focus',
                    active
                      ? 'bg-mist-800 ring-1 ring-mist-300'
                      : 'bg-mist-900/60 opacity-60 hover:opacity-80',
                  )}
                  onClick={() => {
                    if (active) flip(r);
                    else setRoleIndex(i);
                  }}
                >
                  <IdleSprite role={r} look={looks[r]} />
                </button>
                <div className="text-center">
                  <div
                    className={cn(
                      'font-semibold',
                      active ? 'text-mist-50' : 'text-mist-500',
                    )}
                  >
                    {ROLE_LABELS[r]}
                  </div>
                  <div className="text-[0.85em] text-mist-400">
                    {(['a', 'b'] as const).map((l, j) => (
                      <span key={l}>
                        {j > 0 && ' / '}
                        <span
                          className={cn(
                            looks[r] === l && active && 'text-mist-100',
                          )}
                        >
                          {LOOKS[r][l].name}
                        </span>
                      </span>
                    ))}
                  </div>
                  {run && (
                    <div className="text-[0.8em] text-mist-500">
                      {run.finished ? 'finished' : 'in progress'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Stage.Box className="text-center">
          <p className="text-balance">{ROLE_BLURBS[role]}</p>
          <button
            type="button"
            className="mt-2 cursor-pointer rounded-lg bg-mist-100 px-4 py-1 text-mist-900 outline-none focus-visible:ui-focus"
            onClick={() => onConfirm(role, look)}
          >
            Play as {LOOKS[role][look].name}
            {runs[role] && !runs[role].finished ? ' (continue)' : ''}
          </button>
        </Stage.Box>
      </Stage.Center>
    </Stage>
  );
};
