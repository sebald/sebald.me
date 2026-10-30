'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  type Pair,
  type PairId,
  ROLE_LABELS,
  ROLES,
  type Role,
  closersOf,
  poolOf,
} from '@/lib/lab/pushback/lines';
import { cva } from '@/lib/styles.utils';

import { Dialogue } from './dialogue';
import { ScrollRail, overflows, useScroll } from './picker';
import { px } from './stage';
import { Heading, Muted } from './text';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

/** How far one press of up or down scrolls: a share of what shows */
const SCROLL_STEP = 0.3;

const styles = {
  tab: cva({
    base: [
      'cursor-pointer px-[calc(var(--px)*2)] pb-[var(--px)] outline-none focus-visible:ui-focus',
      'border-b-[length:var(--px)]',
    ],
    variants: {
      active: {
        true: 'border-(--pb-gold) text-(--pb-gold)',
        false:
          'border-transparent text-(--pb-muted) hover:text-(--pb-text-bright)',
      },
    },
  }),
};

/**
 * One pair as the duel shows it: the phrase with the opponent's ember
 * mark, the counter under it with the player's gold one, or a blank
 * until it is collected. A closer's phrase is in gold.
 */
const Entry = ({
  pair,
  known,
  closer = false,
}: {
  pair: Pair;
  known: boolean;
  closer?: boolean;
}) =>
  known ? (
    <li className="grid gap-[var(--px)]">
      <Dialogue
        speaker="opponent"
        className={closer ? 'text-(--pb-gold)' : 'text-(--pb-text-bright)'}
      >
        {pair.phrase}
      </Dialogue>
      <Dialogue speaker="player" muted>
        {pair.counter}
      </Dialogue>
    </li>
  ) : (
    <li
      className="pl-[calc(0.55em+var(--px)*3)] text-(--pb-dim)"
      aria-label="not yet collected"
    >
      ? ? ?
    </li>
  );

interface GlossaryProps {
  /** The save's glossary, across runs */
  glossary: readonly PairId[];
  /** The tab it opens on: the run's role */
  role: Role;
  onClose: () => void;
}

/**
 * The glossary as a dialog over the roster: a tab per pool, each pair
 * the player has met at the size the duel shows it, the role's closers
 * at the end under a rule and a Mic drops heading. Left and right
 * switch the pool, up and down scroll, Tab or Escape close it.
 */
export const Glossary = ({ glossary, role, onClose }: GlossaryProps) => {
  const collected = useMemo(() => new Set(glossary), [glossary]);
  const [pool, setPool] = useState(role);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scroll = useScroll(listRef, pool);

  const step = (by: number) =>
    setPool(
      current =>
        ROLES[(ROLES.indexOf(current) + by + ROLES.length) % ROLES.length]!,
    );
  const scrollBy = (by: number) => {
    const list = listRef.current;
    list?.scrollBy({ top: by * list.clientHeight });
  };

  useKeys(
    useMemo(
      () => ({
        ArrowLeft: () => step(-1),
        a: () => step(-1),
        ArrowRight: () => step(1),
        d: () => step(1),
        ArrowUp: () => scrollBy(-SCROLL_STEP),
        w: () => scrollBy(-SCROLL_STEP),
        ArrowDown: () => scrollBy(SCROLL_STEP),
        s: () => scrollBy(SCROLL_STEP),
        Tab: onClose,
        Escape: onClose,
      }),
      [onClose],
    ),
  );

  // A new pool starts at its top; the dialog takes focus when it opens
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [pool]);
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const count = (r: Role) =>
    `${poolOf(r).filter(pair => collected.has(pair.id)).length}/${poolOf(r).length}`;

  return (
    <div className="absolute inset-0 bg-(--pb-ink)/75">
      {/* A tap outside the window closes it */}
      <button
        type="button"
        aria-label="Close the glossary"
        tabIndex={-1}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <dialog
        ref={dialogRef}
        open
        aria-modal
        aria-label="Glossary"
        tabIndex={-1}
        className="absolute m-0 h-auto max-h-none w-auto max-w-none border-0 bg-transparent p-0 text-inherit outline-none"
        style={{ left: px(12), right: px(12), top: px(10), bottom: px(10) }}
      >
        <Window
          className="h-full"
          legend={
            <Legend
              keys={[
                ['←→', 'pool'],
                ['↑↓', 'scroll'],
                ['Esc', 'close'],
              ]}
              touch="Tap outside to close"
            />
          }
        >
          <div
            role="tablist"
            aria-label="Pools"
            className="mb-[calc(var(--px)*2)] flex justify-center gap-[calc(var(--px)*4)]"
          >
            {ROLES.map(r => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === pool}
                className={styles.tab({ active: r === pool })}
                onClick={() => setPool(r)}
              >
                {ROLE_LABELS[r]}{' '}
                <span className="text-[0.8em] opacity-70">{count(r)}</span>
              </button>
            ))}
          </div>
          <Muted className="mb-[calc(var(--px)*8)] text-center text-[0.8em]">
            Gather every line thrown at you, and the comeback that beats it.
          </Muted>
          <div className="flex min-h-0 flex-1">
            <div
              ref={listRef}
              role="tabpanel"
              aria-label={ROLE_LABELS[pool]}
              className="min-h-0 flex-1 [scrollbar-width:none] overflow-y-auto [&::-webkit-scrollbar]:hidden"
            >
              <ol className="m-0 grid list-none gap-[calc(var(--px)*6)] p-0">
                {poolOf(pool).map(pair => (
                  <Entry
                    key={pair.id}
                    pair={pair}
                    known={collected.has(pair.id)}
                  />
                ))}
              </ol>
              {/* The pool's three closers, under a rule and their own
                  heading, in gold */}
              <section
                aria-labelledby="glossary-mic-drops"
                className="mt-[calc(var(--px)*6)] border-t border-(--pb-frame-dim) pt-[calc(var(--px)*6)]"
              >
                <Heading
                  level={3}
                  className="mb-[calc(var(--px)*4)] text-[0.8em] tracking-[0.1em] text-(--pb-gold) uppercase"
                >
                  <span id="glossary-mic-drops">Mic drops</span>
                </Heading>
                <ol className="m-0 grid list-none gap-[calc(var(--px)*6)] p-0">
                  {closersOf(pool).map(pair => (
                    <Entry
                      key={pair.id}
                      pair={pair}
                      known={collected.has(pair.id)}
                      closer
                    />
                  ))}
                </ol>
              </section>
            </div>
            {overflows(scroll) && <ScrollRail scroll={scroll} />}
          </div>
        </Window>
      </dialog>
    </div>
  );
};
