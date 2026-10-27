'use client';

import { useMemo, useState } from 'react';

import { LOOKS, type Look } from '@/lib/lab/pushback/characters';
import {
  ROLE_BLURBS,
  ROLE_LABELS,
  ROLES,
  type Role,
} from '@/lib/lab/pushback/lines';
import { cn } from '@/lib/styles.utils';

import { Stage } from './stage';
import { useKeys } from './use-keys';

interface SelectScreenProps {
  /** Existing runs, to say which roles are in progress or finished */
  runs: Partial<Record<Role, { finished: boolean; look: Look }>>;
  onConfirm: (role: Role, look: Look) => void;
  onBack: () => void;
}

/**
 * Three roles side by side, one sprite each (a placeholder box until the
 * sheets land). Left/right picks the role, up/down or a tap on the sprite
 * flips the look, Enter or a second tap confirms.
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
      <Stage.Center className="justify-between py-6">
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
                    'grid h-24 w-16 place-items-center rounded-lg transition-all duration-150 md:h-32 md:w-20',
                    'outline-none focus-visible:ui-focus',
                    active
                      ? 'bg-mist-100/90 text-mist-900'
                      : 'bg-mist-800 text-mist-500',
                  )}
                  onClick={() => {
                    if (active) flip(r);
                    else setRoleIndex(i);
                  }}
                >
                  {/* Placeholder for the idle sprite */}
                  <span className="text-[0.8em]">
                    {LOOKS[r][looks[r]].name}
                  </span>
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
