'use client';

import NextImage from 'next/image';
import { useEffect, useState } from 'react';

import logo from '@/assets/lab/pushback/sheets/logo.png';
import { ATTRACT_AFTER_MS } from '@/lib/lab/pushback/attract';
import { MODE_LABELS, type Mode } from '@/lib/lab/pushback/characters';

import { Picker, type PickerItem } from './picker';
import { Stage } from './stage';
import { useKeys } from './use-keys';

interface TitleScreenProps {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onStart: () => void;
  /** Drop the save; the item only shows when there is something to drop */
  onReset?: () => void;
  /** Nobody has touched anything for a while: play the demo */
  onAttract?: () => void;
}

/** The usual line, because the cast is nine office archetypes and nobody in particular */
const FICTION =
  'All characters are fictional. Any resemblance to actual persons or teams is coincidental.';

const MODE_BLURBS: Record<Mode, string> = {
  normal:
    'The ghost of your predecessor whispers along. Slowly. No stars with a ghost.',
  hard: 'No ghost, less time, longer menus, colleagues who tire slowly. Stars for flawless duels.',
};

/** How long the reset stays armed, waiting for the second press */
const ARMED_MS = 4000;

/** The logo's native size: the render cut on its pixel grid and keyed */
const LOGO = { width: 214, height: 103 } as const;

export const TitleScreen = ({
  mode,
  onMode,
  onStart,
  onReset,
  onAttract,
}: TitleScreenProps) => {
  // Attract mode: a key or a tap resets the clock, silence starts the demo
  useEffect(() => {
    if (!onAttract) return;
    let timer = setTimeout(onAttract, ATTRACT_AFTER_MS);
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(onAttract, ATTRACT_AFTER_MS);
    };
    window.addEventListener('keydown', reset);
    window.addEventListener('pointerdown', reset);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('pointerdown', reset);
    };
  }, [onAttract]);
  // Reset asks for a second press: the first arms it, the second does it,
  // Escape or a few seconds of nothing disarm it
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), ARMED_MS);
    return () => clearTimeout(timer);
  }, [armed]);
  useKeys({ Escape: () => setArmed(false) }, armed);

  const items: PickerItem[] = [
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
        <div className="grid justify-items-center gap-3">
          {/* The logo at the stage's own pixels: two bubbles colliding */}
          <h2 className="m-0">
            <NextImage
              src={logo}
              alt="Pushback"
              width={LOGO.width}
              height={LOGO.height}
              unoptimized
              priority
              draggable={false}
              className="block [image-rendering:pixelated]"
              style={{
                width: `calc(var(--px) * ${LOGO.width})`,
                height: `calc(var(--px) * ${LOGO.height})`,
              }}
            />
          </h2>
          <Stage.Muted className="text-balance">
            Counter the phrase. Push the scale to your side. Full momentum lets
            you drop the mic.
          </Stage.Muted>
        </div>
        <Picker
          label="Title menu"
          className="w-full max-w-[18em]"
          items={items}
        />
        <div className="grid gap-2">
          <Stage.Muted className="text-[0.85em] text-balance">
            {armed
              ? 'This forgets every run and every collected phrase.'
              : MODE_BLURBS[mode]}
          </Stage.Muted>
          <Stage.Muted className="text-[0.7em] text-balance opacity-70">
            {FICTION}
          </Stage.Muted>
        </div>
      </Stage.Center>
    </Stage>
  );
};
