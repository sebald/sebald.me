'use client';

import { useMemo, useState } from 'react';

import { LOOKS, MODES, MODE_LABELS } from '@/lib/lab/pushback/characters';
import {
  type PairId,
  ROLE_LABELS,
  RUN_VERDICTS,
  inTurn,
} from '@/lib/lab/pushback/lines';
import {
  type SavedRun,
  formatScore,
  resultCardText,
  resultModel,
} from '@/lib/lab/pushback/save';
import { PLAYER_SHEETS } from '@/lib/lab/pushback/sprites';
import { LAYOUT } from '@/lib/lab/pushback/stage';

import { effect } from './audio/engine';
import { Controls } from './controls';
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
  /** Pick a role for the next run; once the Stakeholder is beaten */
  onNewRun?: () => void;
  /** Fix the scale (the inventory) */
  scale?: number;
}

/** The portrait at three times its pixels, a frame around it */
const PORTRAIT_SCALE = 3;

/**
 * The end of a run as an RPG status screen, one window filling the
 * stage: the face, the name and the role on the left, the result, the
 * score with the mode's factor and the run's numbers with dot leaders
 * on the right, and below, apart, the glossary by pool,
 * a meter of the pool's twenty pairs each, so the gaps show. The
 * verdict heads the numbers in the duel end's letters. Copy puts the
 * text card on the clipboard.
 */
export const ResultScreen = ({
  run,
  glossary,
  onBack,
  onNewRun,
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
  const verdict = inTurn(
    RUN_VERDICTS[model.finished ? 'shipped' : 'offline'],
    run.attempts,
  );

  return (
    <Stage label="Pushback, result" scale={scale}>
      <Window
        className="absolute"
        style={{
          left: px(panel.x),
          top: px(panel.x),
          width: px(panel.width),
          // Held upright, down to the bar of controls
          bottom: `calc(var(--pb-bar) + ${px(panel.x)})`,
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
        <div className="flex gap-[calc(var(--px)*10)] px-[calc(var(--px)*2)] pt-[calc(var(--px)*2)] tall:flex-col tall:gap-[calc(var(--px)*6)]">
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
            <div className="grid gap-[calc(var(--px)*1)]">
              <Heading
                className={
                  model.finished
                    ? 'text-[1.15em] tracking-[0.1em] text-(--pb-gold) uppercase'
                    : 'text-[1.15em] tracking-[0.1em] text-(--pb-stamp) uppercase'
                }
              >
                {verdict}
              </Heading>
              <Muted>
                {model.finished
                  ? 'Stakeholder beaten'
                  : 'Stakeholder took it offline'}
              </Muted>
            </div>
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

        <div className="mt-[calc(var(--px)*12)] px-[calc(var(--px)*2)]">
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
                {/* Held upright, under the row: four columns do not fit */}
                <dd className="m-0 text-right tall:col-span-full tall:-mt-[calc(var(--px)*2)]">
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
            className="w-[14em] tall:w-full"
            items={[
              {
                id: 'copy',
                label: copied ? 'Copied' : 'Copy result',
                onSelect: copy,
              },
              ...(onNewRun
                ? [{ id: 'new', label: 'New run', onSelect: onNewRun }]
                : []),
              {
                id: 'back',
                label: 'Back to the roster',
                back: true,
                onSelect: onBack,
              },
            ]}
          />
        </div>
      </Window>
      <Controls
        escape={{
          kind: 'back',
          onPress: () => {
            effect('cancel');
            onBack();
          },
        }}
      />
    </Stage>
  );
};
