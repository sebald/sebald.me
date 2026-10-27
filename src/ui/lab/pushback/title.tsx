'use client';

import { Menu, Stage } from './stage';

interface TitleScreenProps {
  silence: boolean;
  onSilence: (on: boolean) => void;
  onStart: () => void;
}

export const TitleScreen = ({
  silence,
  onSilence,
  onStart,
}: TitleScreenProps) => (
  <Stage label="Pushback, title">
    <Stage.Center className="justify-between py-8">
      <div className="grid gap-3">
        <Stage.Title>Pushback</Stage.Title>
        <Stage.Muted className="text-balance">
          Counter the phrase. Fill your buy-in. Full momentum lets you drop the
          mic.
        </Stage.Muted>
      </div>
      <Menu
        label="Title menu"
        className="w-full max-w-xs"
        items={[
          { id: 'start', label: 'Start', onSelect: onStart },
          {
            id: 'silence',
            label: `Silence bar: ${silence ? 'on' : 'off'}`,
            onSelect: () => onSilence(!silence),
          },
        ]}
      />
      <Stage.Muted className="text-[0.7rem]">
        Arrows or W/S to move, Enter to confirm, Escape to go back.
      </Stage.Muted>
    </Stage.Center>
  </Stage>
);
