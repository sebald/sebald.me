'use client';

import { useMemo, useState } from 'react';

import {
  MODE_LABELS,
  type Mode,
  nextMode,
  stepMode,
} from '@/lib/lab/pushback/characters';
import { ROLE_LABELS, type Role } from '@/lib/lab/pushback/lines';
import { cn } from '@/lib/styles.utils';

import { Confirm } from './confirm';
import { Picker, type PickerItem } from './picker';
import { Heading } from './text';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

/** What each mode changes, under the list while the cursor is on the mode */
const MODE_NOTES: Record<Mode, string> = {
  easy: 'A ghost helps you and nothing rushes you. The place to start.',
  normal: 'No ghost. From the second colleague on, a bar times every answer.',
  hard: 'Less time and longer menus to pick from. The score counts double.',
};

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

/** Left or right of the mode: a pixel triangle, dim at the end it cannot go past */
const Step = ({ left, more }: { left: boolean; more: boolean }) => (
  <span
    aria-hidden
    className={cn(
      'inline-block h-[calc(var(--px)*5)] w-[calc(var(--px)*3)] bg-current',
      left
        ? '[clip-path:polygon(100%_0,0_50%,100%_100%)]'
        : '[clip-path:polygon(0_0,100%_50%,0_100%)]',
      more ? 'opacity-100' : 'opacity-25',
    )}
  />
);

interface OptionsProps {
  mode: Mode;
  onMode: (mode: Mode) => void;
  save: SaveSummary;
  /** Delete everything but the mode; only offered with something to delete */
  onErase: () => void;
  onClose: () => void;
}

/**
 * The settings, away from the title menu: the mode and erasing the
 * save, off while there is nothing to erase. Under the list, a line says
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

  const items: PickerItem[] = [
    {
      id: 'mode',
      label: (
        <span className="flex items-center gap-[1ch]">
          Mode
          <span className="ml-auto flex items-center gap-[calc(var(--px)*2)]">
            <Step left more={mode !== 'easy'} />
            <span className="w-[6ch] text-center">{MODE_LABELS[mode]}</span>
            <Step left={false} more={mode !== 'hard'} />
          </span>
        </span>
      ),
      note: MODE_NOTES[mode],
      // Enter or a tap goes round; left and right stop at the ends
      onSelect: () => switchTo(nextMode(mode)),
      onStep: step => switchTo(stepMode(mode, step)),
    },
    {
      id: 'erase',
      label: 'Erase save',
      divider: true,
      disabled: !progress,
      note: progress
        ? 'Deletes all progress and starts the game fresh. The mode stays.'
        : 'Nothing saved yet: no run, no shipped roles, no collected lines.',
      onSelect: () => setAsking('erase'),
    },
    {
      id: 'back',
      label: 'Back',
      divider: true,
      note: 'Back to the title.',
      onSelect: onClose,
    },
  ];

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-(--pb-bg)/60">
      <Window
        className="w-[19em]"
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
