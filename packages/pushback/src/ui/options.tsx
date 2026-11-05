'use client';

import { useMemo, useState } from 'react';

import { MODE_LABELS, type Mode, nextMode, stepMode } from '../lib/characters';
import { ROLE_LABELS, type Role } from '../lib/lines';
import { canPlay, effect, setSettings } from './audio/engine';
import { Confirm } from './confirm';
import { Picker, type PickerItem } from './picker';
import { Setting } from './setting';
import { Heading } from './text';
import { useKeys } from './use-keys';
import { useSoundSettings } from './use-sound';
import { Legend, Window } from './window';

/** What each mode changes, under the list while the cursor is on the mode */
const MODE_NOTES: Record<Mode, string> = {
  easy: 'A ghost helps you and nothing rushes you. The place to start.',
  normal: 'No ghost. From the second colleague on, a bar times every answer.',
  hard: 'Less time and longer menus to pick from. The score counts double.',
};

/** The mute key, said once, and why the sound switches are off */
const SOUND_NOTES = {
  music: undefined,
  effects: 'M mutes everything, anywhere.',
  none: 'This browser cannot play sound here.',
} as const;

/** What is in the save, for what Erase save says it deletes */
export interface SaveSummary {
  /** The role of the run in play, unfinished */
  running?: Role;
  shipped: number;
  /** Pairs in the glossary */
  lines: number;
}

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** What erasing the save throws away, in words: `your run as Dev, 2 shipped roles` */
const losses = ({ running, shipped, lines }: SaveSummary) =>
  [
    running && `your run as ${ROLE_LABELS[running]}`,
    shipped > 0 && plural(shipped, 'shipped role'),
    lines > 0 && plural(lines, 'collected line'),
  ].filter(Boolean) as string[];

const list = (parts: string[]) =>
  parts.length < 2
    ? (parts[0] ?? '')
    : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;

interface OptionsProps {
  mode: Mode;
  onMode: (mode: Mode) => void;
  save: SaveSummary;
  /** Delete everything but the mode; only offered with something to delete */
  onErase: () => void;
  onClose: () => void;
}

/**
 * The settings, away from the title menu: the mode, the music and the
 * effects (off by default, and off where the browser cannot play), and
 * erasing the save, off while there is nothing to erase. Under the list, a line says
 * what the item the cursor is on does (the mode: what it changes). What
 * throws something away asks first and says what goes.
 */
export const Options = ({
  mode,
  onMode,
  save,
  onErase,
  onClose,
}: OptionsProps) => {
  const [asking, setAsking] = useState<'erase' | Mode | null>(null);
  const cancel = () => setAsking(null);
  const progress = save.running !== undefined || losses(save).length > 0;

  useKeys(
    useMemo(() => ({ Escape: onClose }), [onClose]),
    asking === null,
  );

  // A mode switch with something at stake asks first
  const switchTo = (target: Mode) => {
    if (target === mode) return;
    if (progress) setAsking(target);
    else onMode(target);
  };

  // The sound switches: Enter, a tap, left or right flips one (a choice
  // goes round, it has no ends); turning effects on says so with the
  // confirm sound
  const sound = useSoundSettings();
  const playable = canPlay();
  const flip = (key: 'music' | 'effects', on: boolean) => {
    if (sound[key] === on) return;
    setSettings({ ...sound, [key]: on });
    if (key === 'effects' && on) effect('confirm');
  };
  const switchItem = (key: 'music' | 'effects', label: string): PickerItem => ({
    id: key,
    label: (
      <span className="flex items-center gap-[1ch]">
        {label}
        <Setting>{sound[key] ? 'On' : 'Off'}</Setting>
      </span>
    ),
    disabled: !playable,
    note: playable ? SOUND_NOTES[key] : SOUND_NOTES.none,
    onSelect: () => flip(key, !sound[key]),
    onStep: () => flip(key, !sound[key]),
  });

  const items: PickerItem[] = [
    {
      id: 'mode',
      label: (
        <span className="flex items-center gap-[1ch]">
          Mode
          <Setting>{MODE_LABELS[mode]}</Setting>
        </span>
      ),
      note: MODE_NOTES[mode],
      // Enter or a tap goes round, and so do left and right: a choice has
      // no ends (a range would, like a volume)
      onSelect: () => switchTo(nextMode(mode)),
      onStep: step => switchTo(stepMode(mode, step)),
    },
    switchItem('music', 'Music'),
    switchItem('effects', 'Effects'),
    {
      id: 'erase',
      label: 'Erase save',
      apart: true,
      disabled: !progress,
      note: progress
        ? 'Deletes all progress and starts the game fresh. The mode stays.'
        : 'Nothing saved yet: no run, no shipped roles, no collected lines.',
      onSelect: () => setAsking('erase'),
    },
    {
      id: 'back',
      label: 'Back',
      back: true,
      apart: true,
      onSelect: onClose,
    },
  ];

  return (
    <div className="absolute inset-x-0 top-0 bottom-(--pb-bar) flex items-center justify-center bg-(--pb-bg)/60">
      <Window
        className="w-[19em] tall:w-[90%]"
        legend={
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
              ['Esc', 'back'],
            ]}
            touch="Tap a line"
          />
        }
      >
        <Heading>Options</Heading>
        <Picker
          label="Options"
          className="mt-[calc(var(--px)*3)]"
          items={items}
          active={asking === null}
        />
      </Window>

      {asking === 'erase' && (
        <Confirm
          title="Erase the save?"
          confirm="Erase save"
          onCancel={cancel}
          onConfirm={() => {
            setAsking(null);
            onErase();
          }}
        >
          This deletes {list(losses(save))}, for good. The mode stays.
        </Confirm>
      )}
      {asking !== null && asking !== 'erase' && (
        <Confirm
          title={`Switch to ${MODE_LABELS[asking].toLowerCase()}?`}
          confirm={`Switch to ${MODE_LABELS[asking].toLowerCase()}`}
          onCancel={cancel}
          onConfirm={() => {
            setAsking(null);
            onMode(asking);
          }}
        >
          A run is played in one mode, so switching starts over:{' '}
          {list(losses(save))} go.
        </Confirm>
      )}
    </div>
  );
};
