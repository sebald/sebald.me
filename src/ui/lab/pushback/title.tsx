'use client';

import { useEffect, useState } from 'react';

import { MODE_LABELS, type Mode } from '@/lib/lab/pushback/characters';

import { Menu, type MenuItem, Stage } from './stage';
import { useKeys } from './use-keys';

interface TitleScreenProps {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onStart: () => void;
  /** Drop the save; the item only shows when there is something to drop */
  onReset?: () => void;
}

const MODE_BLURBS: Record<Mode, string> = {
  normal:
    'The ghost of your predecessor whispers along. Slowly. No stars with a ghost.',
  hard: 'No ghost, less time, longer menus, colleagues who tire slowly. Stars for flawless duels.',
};

/** How long the reset stays armed, waiting for the second press */
const ARMED_MS = 4000;

export const TitleScreen = ({
  mode,
  onMode,
  onStart,
  onReset,
}: TitleScreenProps) => {
  // Reset asks for a second press: the first arms it, the second does it,
  // Escape or a few seconds of nothing disarm it
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), ARMED_MS);
    return () => clearTimeout(timer);
  }, [armed]);
  useKeys({ Escape: () => setArmed(false) }, armed);

  const items: MenuItem[] = [
    { id: 'start', label: 'Start', onSelect: onStart },
    {
      id: 'mode',
      label: `Mode: ${MODE_LABELS[mode]}`,
      onSelect: () => onMode(mode === 'normal' ? 'hard' : 'normal'),
    },
  ];
  if (onReset)
    items.push({
      id: 'reset',
      label: armed ? 'Reset? Press again' : 'Reset',
      onSelect: () => {
        if (armed) {
          setArmed(false);
          onReset();
        } else setArmed(true);
      },
    });

  return (
    <Stage label="Pushback, title">
      <Stage.Center className="justify-between py-8">
        <div className="grid gap-3">
          <Stage.Title>Pushback</Stage.Title>
          <Stage.Muted className="text-balance">
            Counter the phrase. Push the scale to your side. Full momentum lets
            you drop the mic.
          </Stage.Muted>
        </div>
        <Menu
          label="Title menu"
          className="w-full max-w-[18em]"
          items={items}
        />
        <Stage.Muted className="text-[0.85em] text-balance">
          {armed
            ? 'This forgets every run and every collected phrase.'
            : MODE_BLURBS[mode]}
        </Stage.Muted>
      </Stage.Center>
    </Stage>
  );
};
