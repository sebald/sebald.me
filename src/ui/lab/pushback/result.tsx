'use client';

import { useMemo, useState } from 'react';

import { LOOKS, MODES, MODE_LABELS } from '@/lib/lab/pushback/characters';
import { type PairId, ROLE_LABELS } from '@/lib/lab/pushback/lines';
import {
  type SavedRun,
  formatScore,
  resultCardText,
  resultModel,
} from '@/lib/lab/pushback/save';
import { PLAYER_SHEETS } from '@/lib/lab/pushback/sprites';
import { LAYOUT, STAGE } from '@/lib/lab/pushback/stage';

import { Ledger, Meter } from './ledger';
import { Picker } from './picker';
import { Portrait } from './portrait';
import { Stage, px } from './stage';
import { Heading, Muted } from './text';
import { useKeys } from './use-keys';
import { Legend, Window } from './window';

interface ResultScreenProps {
  run: SavedRun;
  /** The save's glossary, across runs */
  glossary: readonly PairId[];
  onBack: () => void;
  /** Fix the scale (the inventory) */
  scale?: number;
}

/** The portrait at three times its pixels, a frame around it */
const PORTRAIT_SCALE = 3;

/**
 * The end of a run as an RPG status screen, one window filling the
 * stage: the face, the name and the role on the left, the result, the
 * score with the mode's factor and the run's numbers with dot leaders
 * on the right, and under a rule the glossary by pool,
 * a meter of the pool's sixteen pairs each, so the gaps show. Copy puts
 * the text card on the clipboard.
 */
export const ResultScreen = ({
  run,
  glossary,
  onBack,
  scale,
}: ResultScreenProps) => {
  const text = useMemo(() => resultCardText(run, glossary), [run, glossary]);
  const model = useMemo(() => resultModel(run, glossary), [run, glossary]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  useKeys(useMemo(() => ({ Escape: onBack }), [onBack]));

  const { panel } = LAYOUT;
  const name = LOOKS[run.role][run.look].name;

  return (
    <Stage label="Pushback, result" scale={scale}>
      <Window
        className="absolute"
        style={{
          left: px(panel.x),
          top: px(panel.x),
          width: px(panel.width),
          height: px(STAGE.height - panel.x * 2),
        }}
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
        <div className="flex gap-[calc(var(--px)*10)] px-[calc(var(--px)*2)] pt-[calc(var(--px)*2)]">
          <div className="grid shrink-0 content-start justify-items-center gap-[calc(var(--px)*3)]">
            <span
              className="block bg-(--pb-frame-inner)"
              style={{
                boxShadow: `0 0 0 ${px(2)} var(--pb-frame), 0 0 0 ${px(3)} var(--pb-ink)`,
              }}
            >
              <Portrait
                sheet={PLAYER_SHEETS[run.role][run.look]}
                scale={PORTRAIT_SCALE}
              />
            </span>
            <div className="mt-[calc(var(--px)*2)] grid justify-items-center">
              <Heading>{name}</Heading>
              <Muted>{ROLE_LABELS[run.role]}</Muted>
            </div>
          </div>
          <div className="grid min-w-0 flex-1 content-start gap-[calc(var(--px)*5)]">
            <Heading className="text-[1.15em] tracking-[0.1em] text-(--pb-gold) uppercase">
              {model.finished ? 'Stakeholder beaten' : 'Taken offline'}
            </Heading>
            <div className="flex items-baseline gap-[1ch]">
              <span className="text-[1.8em] leading-none font-bold text-(--pb-heading) tabular-nums">
                {formatScore(model.score)}
              </span>
              <span className="text-(--pb-muted)">
                {MODE_LABELS[model.mode]} ×{MODES[model.mode].rules.score}
              </span>
            </div>
            <Ledger rows={model.rows} />
          </div>
        </div>

        <div
          aria-hidden
          className="mx-[calc(var(--px)*2)] my-[calc(var(--px)*7)] h-(--px) bg-(--pb-frame-dim)"
        />

        <div className="px-[calc(var(--px)*2)]">
          <dl className="m-0 grid grid-cols-[auto_auto_1fr_auto] items-center gap-x-[calc(var(--px)*5)] gap-y-[calc(var(--px)*2)]">
            <div className="contents">
              <dt className="col-span-2 mb-[calc(var(--px)*1)] font-semibold text-(--pb-heading)">
                Glossary
              </dt>
              <dd className="col-span-2 m-0 mb-[calc(var(--px)*1)] font-semibold text-(--pb-heading) tabular-nums">
                {model.glossary.collected}/{model.glossary.total}
              </dd>
            </div>
            {model.pools.map(pool => (
              <div key={pool.role} className="contents">
                <dt className="min-w-[8ch]">{ROLE_LABELS[pool.role]}</dt>
                <dd className="m-0 flex">
                  <Meter value={pool.collected} total={pool.total} />
                </dd>
                <dd className="m-0 text-(--pb-heading) tabular-nums">
                  {pool.collected}/{pool.total}
                </dd>
                <dd className="m-0 text-right">
                  <Muted className="text-[0.85em]">
                    {pool.missed === 0
                      ? 'none missed'
                      : `${pool.missed} missed`}
                  </Muted>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-auto flex justify-end px-[calc(var(--px)*2)] pt-[calc(var(--px)*4)]">
          <Picker
            label="Result"
            className="w-[14em]"
            items={[
              {
                id: 'copy',
                label: copied ? 'Copied' : 'Copy result',
                onSelect: copy,
              },
              { id: 'back', label: 'Back to the roster', onSelect: onBack },
            ]}
          />
        </div>
      </Window>
    </Stage>
  );
};
