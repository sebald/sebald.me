'use client';

import { useMemo, useState } from 'react';

import { bossIndex, characterById } from '@/lib/lab/pushback/characters';
import {
  PAIRS,
  type PairId,
  ROLE_LABELS,
  ROLES,
  closersOf,
  pairById,
  poolOf,
  poolPairs,
} from '@/lib/lab/pushback/lines';
import {
  type RunState,
  bossUnlocked,
  canPlay,
  nextSlot,
} from '@/lib/lab/pushback/run';
import { cn } from '@/lib/styles.utils';

import { Picker, type PickerItem } from './picker';
import { SCENE_ASSETS } from './scenes';
import { Stage, px } from './stage';
import { Heading, Muted } from './text';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

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

/** The title row: the heading, an explainer, the tab switch */
const Title = ({
  heading,
  blurb,
  tab,
  onTab,
}: {
  heading: string;
  blurb: string;
  tab: 'roster' | 'glossary';
  onTab: () => void;
}) => (
  <div
    className="absolute inset-x-0 flex items-start justify-between gap-4"
    style={{ left: px(6), right: px(6), top: px(5) }}
  >
    <div className="min-w-0">
      <Heading>{heading}</Heading>
      <Muted className="text-[0.8em]">{blurb}</Muted>
    </div>
    <button
      type="button"
      className={cn(
        'shrink-0 cursor-pointer text-[0.85em] outline-none focus-visible:ui-focus',
        'text-(--pb-muted) underline decoration-dotted underline-offset-4 hover:text-white',
      )}
      onClick={onTab}
    >
      {tab === 'roster' ? 'Glossary' : 'Roster'}
    </button>
  </div>
);

/**
 * The run as a roster: the colleagues in order with ticks and stars in
 * the quiet window, the out-of-office cast beside them, and the
 * glossary (every pair the player has collected, by pool) on Tab.
 */
export const RosterScreen = ({
  run,
  glossary,
  onPlay,
  onResult,
  onBack,
}: RosterScreenProps) => {
  const [tab, setTab] = useState<'roster' | 'glossary'>('roster');
  const collected = useMemo(() => new Set(glossary), [glossary]);
  const next = nextSlot(run);
  const toggle = () => setTab(t => (t === 'roster' ? 'glossary' : 'roster'));

  useKeys(
    useMemo(
      () => ({
        Tab: toggle,
        Escape: () => (tab === 'glossary' ? setTab('roster') : onBack()),
      }),
      [tab, onBack],
    ),
  );

  const items: PickerItem[] = run.run.slots.map((slot, index) => {
    const character = characterById(slot.character);
    const beaten = run.beaten[index];
    const playable = canPlay(run, index);
    return {
      id: String(index),
      disabled: !playable,
      onSelect: () => onPlay(index),
      label: (
        <span className="flex items-center gap-[calc(var(--px)*3)]">
          <span className="w-[1.2em] text-center text-(--pb-gold)" aria-hidden>
            {beaten ? (beaten.flawless ? '★' : '✓') : ''}
          </span>
          <span className="sr-only">
            {beaten ? (beaten.flawless ? 'beaten flawless, ' : 'beaten, ') : ''}
          </span>
          <span className="flex-1">{character.name}</span>
          <span className="text-[0.8em] text-(--pb-muted)">
            {index === bossIndex(run.run) && !bossUnlocked(run)
              ? 'locked'
              : tierLabel(slot.slot.tier)}
          </span>
        </span>
      ),
    };
  });
  if (run.finished) {
    items.push({ id: 'result', label: 'Result card', onSelect: onResult });
  }

  const role = ROLE_LABELS[run.role];
  const glossaryCount = `${poolPairs(glossary).length}/${PAIRS.length}`;

  return (
    <Stage label="Pushback, roster">
      {/* The corner office, dimmed, behind the windows */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center brightness-[0.3] [image-rendering:pixelated]"
        style={{ backgroundImage: `url(${SCENE_ASSETS.office.poster.src})` }}
      />

      {tab === 'roster' ? (
        <>
          <Title
            heading={`Your run as ${role}`}
            blurb="Beat your colleagues in order. The Stakeholder waits at the end."
            tab={tab}
            onTab={toggle}
          />
          <Window
            className="absolute"
            style={{ left: px(3), right: px(96), top: px(34), bottom: px(3) }}
            legend={
              <Legend
                keys={[
                  ['↑↓', 'choose'],
                  ['Enter', 'play'],
                  ['Tab', `glossary ${glossaryCount}`],
                  ['Esc', 'back'],
                ]}
                touch={`Tap a colleague to play · glossary ${glossaryCount}`}
              />
            }
          >
            <Picker
              label="Opponents in run order"
              initial={next >= 0 ? String(next) : 'result'}
              items={items}
              active={tab === 'roster'}
              className="gap-0"
            />
          </Window>
          <Window
            className="absolute text-[0.8em]"
            style={{ right: px(3), width: px(90), top: px(34), bottom: px(3) }}
          >
            <Muted className="mb-[calc(var(--px)*2)]">Out of office</Muted>
            <ul className="m-0 grid list-none gap-[var(--px)] p-0">
              {run.run.outOfOffice.map(id => (
                <li key={id}>{characterById(id).name}</li>
              ))}
            </ul>
          </Window>
        </>
      ) : (
        <>
          <Title
            heading={`Glossary ${glossaryCount}`}
            blurb="Every pair you have met, across your runs: the ones in play you know from the start, the rest are collected on defence."
            tab={tab}
            onTab={toggle}
          />
          <div
            className="absolute grid grid-cols-3 gap-[calc(var(--px)*3)]"
            style={{ left: px(3), right: px(3), top: px(34), bottom: px(3) }}
            aria-label="Glossary"
          >
            {ROLES.map((pool, i) => (
              <Window
                key={pool}
                className="min-h-0 text-[0.75em]"
                legend={
                  i === ROLES.length - 1 ? (
                    <Legend
                      keys={[
                        ['Tab', 'roster'],
                        ['Esc', 'back'],
                      ]}
                      touch="Tap Roster to go back"
                    />
                  ) : undefined
                }
              >
                <Heading level={3} className="mb-[calc(var(--px)*2)]">
                  {ROLE_LABELS[pool]}
                </Heading>
                <ol className="m-0 grid min-h-0 [scrollbar-width:none] list-none content-start gap-[calc(var(--px)*2)] overflow-y-auto p-0 leading-snug [&::-webkit-scrollbar]:hidden">
                  {poolOf(pool).map(pair => (
                    <li key={pair.id} className="min-w-0">
                      {collected.has(pair.id) ? (
                        <>
                          <div className="truncate text-(--pb-text-bright)">
                            {pairById(pair.id).phrase}
                          </div>
                          <div className="truncate text-(--pb-muted)">
                            {pairById(pair.id).counter}
                          </div>
                        </>
                      ) : (
                        <div
                          className="h-[2.4em] border-b border-dashed border-(--pb-frame-dim)"
                          aria-label="not yet collected"
                        />
                      )}
                    </li>
                  ))}
                  {/* The role's three closers, under a rule */}
                  {closersOf(pool).map((pair, j) => (
                    <li
                      key={pair.id}
                      className={cn(
                        'min-w-0',
                        j === 0 &&
                          'mt-[var(--px)] border-t border-(--pb-frame-dim) pt-[calc(var(--px)*2)]',
                      )}
                    >
                      {collected.has(pair.id) ? (
                        <>
                          <div className="truncate text-(--pb-gold)">
                            {pair.phrase}
                          </div>
                          <div className="truncate text-(--pb-muted)">
                            {pair.counter}
                          </div>
                        </>
                      ) : (
                        <div
                          className="h-[2.4em] border-b border-dashed border-(--pb-frame-dim)"
                          aria-label="closer not yet collected"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </Window>
            ))}
          </div>
        </>
      )}
    </Stage>
  );
};
