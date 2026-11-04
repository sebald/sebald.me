'use client';

import {
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useMemo,
} from 'react';

import { bossIndex, characterById } from '../lib/characters';
import { ROLE_LABELS } from '../lib/lines';
import { type RunState, bossUnlocked, canPlay, nextSlot } from '../lib/run';
import { effect } from './audio/engine';
import { Controls } from './controls';
import { PALETTE } from './palette';
import { Picker, type PickerItem } from './picker';
import { Portrait } from './portrait';
import { SCENE_ASSETS } from './scenes';
import { Stage, px } from './stage';
import { Stamp, stampSize } from './stamp';
import { cn } from './styles.utils';
import { ScreenTitle } from './text';
import { useKeys } from './use-keys';
import { CornerLegend, Window } from './window';

/** The run window is centred between here, under the title and its line, and the legend */
const LIST_TOP = 40;

interface RosterScreenProps {
  run: RunState;
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

/** The stamp over a beaten face sits this far above the headshot's bottom edge */
const STAMP_BOTTOM = 1;

/** DONE in red over a beaten face, FLAWLESS in gold, centred on it */
const BeatenStamp = ({ flawless }: { flawless: boolean }) => {
  const word = flawless ? 'FLAWLESS' : 'DONE';
  const face = 24 - FACE_INSET * 2;
  return (
    <Stamp
      word={word}
      tone={flawless ? 'gold' : 'red'}
      className="absolute"
      style={{
        left: px((face - stampSize(word).width) / 2),
        bottom: px(STAMP_BOTTOM),
      }}
    />
  );
};

/** The icon column, round the headshot */
const ICON_WIDTH = 30;

/**
 * One line of the run: an icon (the colleague's face, stamped once
 * beaten), the name and what is on the right
 */
const Row = ({
  markLabel,
  icon,
  aside,
  children,
}: PropsWithChildren<{
  /** What the stamp on the icon says, for a screen reader */
  markLabel?: string;
  icon?: ReactNode;
  aside?: string;
}>) => (
  <span className="flex items-center gap-[calc(var(--px)*3)]">
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
 * one window as large as the list. Only this run: the glossary, which
 * outlives the runs, is on the title's menu.
 */
export const RosterScreen = ({
  run,
  onPlay,
  onResult,
  onBack,
}: RosterScreenProps) => {
  const next = nextSlot(run);

  const back = useCallback(() => {
    effect('cancel');
    onBack();
  }, [onBack]);
  useKeys(useMemo(() => ({ Escape: back }), [back]));

  const items: PickerItem[] = run.run.slots.map((slot, index) => {
    const character = characterById(slot.character);
    const beaten = run.beaten[index];
    const locked = index === bossIndex(run.run) && !bossUnlocked(run);
    return {
      id: String(index),
      disabled: !canPlay(run, index),
      // In order: the one waiting names who is up first
      note: locked
        ? 'Beat the three colleagues first. The Stakeholder only sees you after.'
        : !canPlay(run, index) && next >= 0
          ? `One at a time: beat ${characterById(run.run.slots[next]!.character).name} first.`
          : undefined,
      onSelect: () => onPlay(index),
      label: (
        <Row
          markLabel={
            beaten
              ? beaten.flawless
                ? 'beaten flawless'
                : 'beaten'
              : undefined
          }
          icon={
            // Locked, the Stakeholder is a faded face in its frame;
            // beaten, the face is stamped, gold when flawless
            <span className="relative block" style={{ boxShadow: FRAME }}>
              <span
                className={cn('block', locked && 'brightness-50 grayscale')}
              >
                <Portrait
                  sheet={character.sheet}
                  scale={1}
                  inset={FACE_INSET}
                />
              </span>
              {beaten && <BeatenStamp flawless={beaten.flawless} />}
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
        style={{
          top: px(LIST_TOP),
          bottom: `calc(var(--pb-bar) + ${px(14)})`,
        }}
      >
        <Window className="max-h-full w-[calc(var(--px)*180)] text-[1.15em] tall:w-[calc(var(--px)*296)] tall:text-[1em]">
          <Picker
            label="Opponents in run order"
            initial={next >= 0 ? String(next) : 'result'}
            items={items}
            className="gap-0"
          />
        </Window>
      </div>

      <CornerLegend
        keys={[
          ['↑↓', 'choose'],
          ['Enter', 'play'],
          ['Esc', 'back'],
          ['M', 'sound'],
        ]}
        touch="Tap a colleague to play"
      />
      <Controls escape={{ kind: 'back', onPress: back }} />
    </Stage>
  );
};
