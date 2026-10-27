'use client';

import { useMemo } from 'react';

import { characterById } from '@/lib/lab/pushback/characters';
import { type DuelState, createDuel, reduce } from '@/lib/lab/pushback/duel';
import {
  type RunState,
  attemptFor,
  duelSetupFor,
} from '@/lib/lab/pushback/run';

import { Menu, Stage } from './stage';
import { useKeys } from './use-keys';

interface DuelPlaceholderProps {
  run: RunState;
  index: number;
  silence: boolean;
  onEnd: (duel: DuelState) => void;
  onBack: () => void;
}

/**
 * Plays a whole duel through the real reducer with a fixed strategy, so
 * the roster, the glossary and the save see real results.
 */
const autoplay = (
  run: RunState,
  index: number,
  silence: boolean,
  win: boolean,
) => {
  let s = createDuel(duelSetupFor(run, index, { seed: Date.now(), silence }));
  s = reduce(s, { type: 'begin' });
  for (let guard = 0; guard < 200 && s.phase !== 'end'; guard++) {
    if (s.phase === 'defend') {
      const answer = s.exchange!.answer;
      s = reduce(s, {
        type: 'counter',
        phrase: win ? answer : (s.menu.find(id => id !== answer) ?? answer),
      });
    } else if (s.phase === 'attack') {
      s = reduce(s, {
        type: 'throw',
        phrase: s.hand[0]!,
        micDrop: s.micDropAvailable,
      });
    } else {
      s = reduce(s, { type: 'continue' });
    }
  }
  return s;
};

/**
 * Grey-box stand-in for the duel until package 3: shows who you are up
 * against and lets you pick the outcome.
 */
export const DuelPlaceholder = ({
  run,
  index,
  silence,
  onEnd,
  onBack,
}: DuelPlaceholderProps) => {
  const slot = run.run.slots[index]!;
  const character = characterById(slot.character);
  const attempt = attemptFor(run, index);

  useKeys(useMemo(() => ({ Escape: onBack }), [onBack]));

  return (
    <Stage label={`Pushback, duel against ${character.name}`}>
      <Stage.Center className="justify-between py-6">
        <div className="grid gap-2">
          <Stage.Muted className="text-[0.7rem] tracking-wider uppercase">
            Grey box placeholder: the duel arrives in package 3
          </Stage.Muted>
          <Stage.Title>{character.name}</Stage.Title>
          <Stage.Muted>
            {slot.slot.tier === 'boss' ? 'Boss' : `Tier ${slot.slot.tier}`} ·{' '}
            {attempt === 'first' ? 'first attempt' : attempt}
          </Stage.Muted>
        </div>
        <Stage.Box>
          <p className="mb-2 text-center">{character.intro}</p>
          <Menu
            label="Outcome"
            items={[
              {
                id: 'win',
                label: 'Win the duel',
                onSelect: () => onEnd(autoplay(run, index, silence, true)),
              },
              {
                id: 'lose',
                label: 'Lose the duel',
                onSelect: () => onEnd(autoplay(run, index, silence, false)),
              },
              { id: 'back', label: 'Back to the roster', onSelect: onBack },
            ]}
          />
        </Stage.Box>
      </Stage.Center>
    </Stage>
  );
};
