'use client';

import { useMemo, useState } from 'react';

import { BOSS_SLOT_INDEX, characterById } from '@/lib/lab/pushback/characters';
import {
  PAIRS,
  ROLE_LABELS,
  ROLES,
  pairById,
  poolOf,
} from '@/lib/lab/pushback/lines';
import {
  type RunState,
  bossUnlocked,
  canPlay,
  nextSlot,
} from '@/lib/lab/pushback/run';
import { PROPS, type PropId } from '@/lib/lab/pushback/sprites';
import { cn } from '@/lib/styles.utils';

import { Picker, type PickerItem } from './picker';
import { SCENE_ASSETS } from './scenes';
import { SHEETS } from './sheets';
import { Stage } from './stage';
import { useKeys } from './use-keys';

interface RosterScreenProps {
  run: RunState;
  onPlay: (index: number) => void;
  onResult: () => void;
  onBack: () => void;
}

const tierLabel = (tier: 1 | 2 | 3 | 'boss') =>
  tier === 'boss' ? 'Boss' : `Tier ${tier}`;

/**
 * A colleague's prop from the item sheet, as a CSS sprite at a third of
 * the stage's pixels (the sheet's own pixels at 3x): the props are not
 * on the figures any more, so the roster shows what each one carries.
 */
const PropIcon = ({ prop }: { prop: PropId }) => {
  const sheet = SHEETS.props;
  const { width, height } = sheet.meta.cell;
  const px = (n: number) => `calc(var(--px) * ${n / 3})`;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 [image-rendering:pixelated]"
      style={{
        width: px(width),
        height: px(height),
        backgroundImage: `url(${sheet.image.src})`,
        backgroundSize: `${px(width * sheet.meta.count)} ${px(height)}`,
        backgroundPosition: `${px(-PROPS.indexOf(prop) * width)} 0`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};

/**
 * The seven slots in run order with ticks and stars, the out-of-office
 * cast, and the glossary as a second tab.
 */
export const RosterScreen = ({
  run,
  onPlay,
  onResult,
  onBack,
}: RosterScreenProps) => {
  const [tab, setTab] = useState<'roster' | 'glossary'>('roster');
  const collected = useMemo(() => new Set(run.collected), [run.collected]);
  const next = nextSlot(run);

  useKeys(
    useMemo(
      () => ({
        Tab: () => setTab(t => (t === 'roster' ? 'glossary' : 'roster')),
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
        <span className="flex items-center gap-2">
          <span className="w-4 text-center" aria-hidden>
            {beaten ? (beaten.flawless ? '★' : '✓') : ''}
          </span>
          <span className="sr-only">
            {beaten ? (beaten.flawless ? 'beaten flawless, ' : 'beaten, ') : ''}
          </span>
          <span className="flex-1">{character.name}</span>
          {character.swap.prop && <PropIcon prop={character.swap.prop} />}
          <span className="text-[0.85em] opacity-70">
            {index === BOSS_SLOT_INDEX && !bossUnlocked(run)
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

  return (
    <Stage label="Pushback, roster">
      {/* The corner office, dimmed, behind the list */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center brightness-[0.3] [image-rendering:pixelated]"
        style={{ backgroundImage: `url(${SCENE_ASSETS.office.poster.src})` }}
      />
      <Stage.Corner>
        <button
          type="button"
          className={cn(
            'cursor-pointer rounded-lg px-2 py-1 outline-none focus-visible:ui-focus',
            tab === 'glossary'
              ? 'bg-[#f2c14e] text-[#0b0d16]'
              : 'text-[#8a92b8] hover:text-white',
          )}
          aria-pressed={tab === 'glossary'}
          onClick={() => setTab(t => (t === 'roster' ? 'glossary' : 'roster'))}
        >
          Glossary {run.collected.length}/{PAIRS.length}
        </button>
      </Stage.Corner>

      {tab === 'roster' ? (
        <div className="absolute inset-0 grid grid-cols-[1fr_auto] gap-4 p-4 pt-10 md:p-6 md:pt-10">
          <Picker
            label="Opponents in run order"
            initial={next >= 0 ? String(next) : 'result'}
            items={items}
            active={tab === 'roster'}
            className="content-start gap-[0.3em]"
          />
          <div className="text-[0.85em] text-mist-500">
            <div className="mb-1 text-mist-400">Out of office</div>
            <ul>
              {run.run.outOfOffice.map(id => (
                <li key={id}>{characterById(id).name}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div
          className="absolute inset-0 grid grid-cols-3 gap-3 p-4 pt-10 md:p-6 md:pt-10"
          aria-label="Glossary"
        >
          {ROLES.map(role => (
            <div key={role} className="min-w-0">
              <div className="mb-1 font-semibold text-mist-300">
                {ROLE_LABELS[role]}
              </div>
              <ol className="grid list-none content-start gap-1.5 text-[0.8em] leading-snug">
                {poolOf(role).map(pair => (
                  <li key={pair.id} className="min-w-0">
                    {collected.has(pair.id) ? (
                      <>
                        <div className="truncate text-mist-100">
                          {pairById(pair.id).phrase}
                        </div>
                        <div className="truncate text-mist-400">
                          {pairById(pair.id).counter}
                        </div>
                      </>
                    ) : (
                      <div
                        className="h-[2.2em] border-b border-dashed border-mist-700"
                        aria-label="not yet collected"
                      />
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </Stage>
  );
};
