'use client';

import { MODE_LABELS, type Mode } from '@/lib/lab/pushback/characters';

import { Menu, Stage } from './stage';

interface TitleScreenProps {
  mode: Mode;
  onMode: (mode: Mode) => void;
  onStart: () => void;
}

const MODE_BLURBS: Record<Mode, string> = {
  normal:
    'The ghost of your predecessor whispers along. Slowly. No stars with a ghost.',
  hard: 'No ghost, less time, longer menus, colleagues who tire slowly. Stars for flawless duels.',
};

export const TitleScreen = ({ mode, onMode, onStart }: TitleScreenProps) => (
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
        items={[
          { id: 'start', label: 'Start', onSelect: onStart },
          {
            id: 'mode',
            label: `Mode: ${MODE_LABELS[mode]}`,
            onSelect: () => onMode(mode === 'normal' ? 'hard' : 'normal'),
          },
        ]}
      />
      <Stage.Muted className="text-[0.85em] text-balance">
        {MODE_BLURBS[mode]}
      </Stage.Muted>
    </Stage.Center>
  </Stage>
);
