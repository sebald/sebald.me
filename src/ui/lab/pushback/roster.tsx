'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  useMemo,
  useState,
} from 'react';

import glossaryIcon from '@/assets/lab/pushback/sheets/glossary.png';
import { bossIndex, characterById } from '@/lib/lab/pushback/characters';
import {
  PAIRS,
  type PairId,
  ROLE_LABELS,
  poolPairs,
} from '@/lib/lab/pushback/lines';
import {
  type RunState,
  bossUnlocked,
  canPlay,
  nextSlot,
} from '@/lib/lab/pushback/run';
import { cn } from '@/lib/styles.utils';

import { Glossary } from './glossary';
import { PALETTE } from './palette';
import { Picker, type PickerItem } from './picker';
import { Portrait } from './portrait';
import { SCENE_ASSETS } from './scenes';
import { Stage, px } from './stage';
import { ScreenTitle } from './text';
import { useKeys } from './use-keys';
import { CornerLegend, Window } from './window';

/** The run window is centred between here, under the title and its line, and the legend */
const LIST_TOP = 40;

interface RosterScreenProps {
  run: RunState;
  /** The save's glossary, across runs */
  glossary: readonly PairId[];
  onPlay: (index: number) => void;
  onResult: () => void;
  onBack: () => void;
}

const tierLabel = (tier: 1 | 2 | 3 | 'boss') =>
  tier === 'boss' ? 'Boss' : `Tier ${tier}`;

/** The thin frame round a headshot: a dim line, then ink */
const FRAME = `0 0 0 var(--px) ${PALETTE.frameDim}, 0 0 0 calc(var(--px) * 2) ${PALETTE.ink}`;

/** The headshot is the head square less this on every side: 16 by 16 */
const FACE_INSET = 4;

/** The icon column: wide enough for a headshot and the glossary's printout */
const ICON_WIDTH = 30;

/**
 * One line of the run: the tick or star, an icon (the colleague's face,
 * the glossary's printout), the name and what is on the right
 */
const Row = ({
  mark,
  markLabel,
  icon,
  aside,
  children,
}: PropsWithChildren<{
  mark?: string;
  markLabel?: string;
  icon?: ReactNode;
  aside?: string;
}>) => (
  <span className="flex items-center gap-[calc(var(--px)*3)]">
    <span className="w-[1.2em] text-center text-(--pb-gold)" aria-hidden>
      {mark}
    </span>
    {markLabel && <span className="sr-only">{markLabel}, </span>}
    <span
      className="flex shrink-0 justify-center"
      style={{ width: px(ICON_WIDTH) }}
    >
      {icon}
    </span>
    <span className="flex-1">{children}</span>
    {aside && <span className="text-[0.8em] text-(--pb-muted)">{aside}</span>}
  </span>
);

/**
 * The run as a roster: the colleagues in order with ticks and stars in
 * one window as large as the list, the glossary as its last line, and
 * the glossary itself (every pair the player has collected, by pool)
 * as a dialog over it, on that line or on Tab.
 */
export const RosterScreen = ({
  run,
  glossary,
  onPlay,
  onResult,
  onBack,
}: RosterScreenProps) => {
  const [open, setOpen] = useState(false);
  const next = nextSlot(run);

  useKeys(
    useMemo(() => ({ Tab: () => setOpen(true), Escape: onBack }), [onBack]),
    !open,
  );

  const items: PickerItem[] = run.run.slots.map((slot, index) => {
    const character = characterById(slot.character);
    const beaten = run.beaten[index];
    const locked = index === bossIndex(run.run) && !bossUnlocked(run);
    return {
      id: String(index),
      disabled: !canPlay(run, index),
      note: locked
        ? 'Beat the three colleagues first. The Stakeholder only sees you after.'
        : undefined,
      onSelect: () => onPlay(index),
      label: (
        <Row
          mark={beaten ? (beaten.flawless ? '★' : '✓') : undefined}
          markLabel={
            beaten
              ? beaten.flawless
                ? 'beaten flawless'
                : 'beaten'
              : undefined
          }
          icon={
            // Locked, the Stakeholder is a silhouette in its frame
            <span className="block" style={{ boxShadow: FRAME }}>
              <span className={cn('block', locked && 'brightness-0')}>
                <Portrait
                  sheet={character.sheet}
                  scale={1}
                  inset={FACE_INSET}
                />
              </span>
            </span>
          }
          aside={locked ? 'locked' : tierLabel(slot.slot.tier)}
        >
          {character.name}
        </Row>
      ),
    };
  });
  if (run.finished) {
    items.push({
      id: 'result',
      label: <Row>Result card</Row>,
      onSelect: onResult,
    });
  }
  items.push({
    id: 'glossary',
    divider: true,
    onSelect: () => setOpen(true),
    label: (
      <Row
        icon={
          <span
            aria-hidden
            className="block bg-cover [image-rendering:pixelated]"
            style={{
              width: px(glossaryIcon.width),
              height: px(glossaryIcon.height),
              backgroundImage: `url(${glossaryIcon.src})`,
            }}
          />
        }
        aside={`${poolPairs(glossary).length}/${PAIRS.length}`}
      >
        Glossary
      </Row>
    ),
  });

  return (
    <Stage label="Pushback, roster">
      {/* The corner office, dimmed, behind the window */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center brightness-[0.3] [image-rendering:pixelated]"
        style={{ backgroundImage: `url(${SCENE_ASSETS.office.poster.src})` }}
      />

      <ScreenTitle blurb="Beat your colleagues in order. The Stakeholder waits at the end.">
        Your run as {ROLE_LABELS[run.role]}
      </ScreenTitle>

      {/* The run, centred, the window as large as the list */}
      <div
        className="absolute inset-x-0 flex items-center justify-center"
        style={{ top: px(LIST_TOP), bottom: px(14) }}
      >
        <Window className="max-h-full text-[1.15em]" style={{ width: px(180) }}>
          <Picker
            label="Opponents in run order"
            initial={next >= 0 ? String(next) : 'result'}
            items={items}
            active={!open}
            className="gap-0"
          />
        </Window>
      </div>

      <CornerLegend
        keys={[
          ['↑↓', 'choose'],
          ['Enter', 'play'],
          ['Tab', 'glossary'],
          ['Esc', 'back'],
        ]}
        touch="Tap a colleague to play"
      />

      {open && (
        <Glossary
          glossary={glossary}
          role={run.role}
          onClose={() => setOpen(false)}
        />
      )}
    </Stage>
  );
};
