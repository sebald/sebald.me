'use client';

import { Menu, Stage } from './stage';

interface TitleScreenProps {
  silence: boolean;
  onSilence: (on: boolean) => void;
  buddy: boolean;
  onBuddy: (on: boolean) => void;
  onStart: () => void;
}

export const TitleScreen = ({
  silence,
  onSilence,
  buddy,
  onBuddy,
  onStart,
}: TitleScreenProps) => (
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
            id: 'silence',
            label: `Silence bar: ${silence ? 'on' : 'off'}`,
            onSelect: () => onSilence(!silence),
          },
          {
            id: 'buddy',
            label: `Onboarding buddy: ${buddy ? 'on' : 'off'}`,
            onSelect: () => onBuddy(!buddy),
          },
        ]}
      />
      <Stage.Muted className="text-[0.85em] text-balance">
        {buddy
          ? 'The ghost of your predecessor whispers the reply. Slowly. No stars with a buddy.'
          : 'Arrows or W/S to move, Enter to confirm, Escape to go back.'}
      </Stage.Muted>
    </Stage.Center>
  </Stage>
);
