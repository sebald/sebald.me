'use client';

import { useState } from 'react';

import { PAIRS } from '@/lib/lab/pushback/lines';
import { LAYOUT } from '@/lib/lab/pushback/stage';

import { Dialogue } from '../dialogue';
import { Picker } from '../picker';
import { SilenceTimer, type TimerLook } from '../silence-timer';
import { Pixels } from '../stage';
import { Muted } from '../text';
import { useClock } from '../use-clock';
import { Legend, Window } from '../window';
import { Field, field } from './controls';

/** A normal-mode menu of five runs about thirteen seconds */
const LIMIT = 13_000;

/** A beat with the fuse burnt out before it lights again */
const REST = 1_500;

/**
 * The silence bar on the duel's window: it burns on a loop, or holds at
 * the point the slider picks, so each phase can be looked at (gold while
 * a counter counts as fast, the flash at the half, ember, red)
 */
export const TimerDemo = () => {
  const [scale, setScale] = useState(3);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(LIMIT * 0.3);
  const [still, setStill] = useState(false);
  const [look, setLook] = useState<TimerLook>('tab');
  const clock = useClock(playing);
  const elapsed = playing ? Math.min(LIMIT, clock % (LIMIT + REST)) : held;
  const left = Math.max(0, (LIMIT - elapsed) / 1000);
  const phase =
    elapsed >= LIMIT
      ? 'out: the fallback line answers'
      : elapsed < LIMIT / 2
        ? 'fast: a counter now builds momentum'
        : elapsed < LIMIT * 0.75
          ? 'ember: no longer fast'
          : 'red: the last quarter';
  const pair = PAIRS[3]!;
  const options = PAIRS.slice(3, 8);
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label="Scale">
          <select
            className={field.input}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          >
            {[2, 3, 4].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          className={field.input}
          onClick={() => {
            if (playing) setHeld(elapsed);
            setPlaying(!playing);
          }}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <Field label="Time">
          <input
            type="range"
            min={0}
            max={LIMIT}
            step={50}
            value={elapsed}
            onChange={e => {
              setPlaying(false);
              setHeld(Number(e.target.value));
            }}
          />
        </Field>
        <Field label="Look">
          <select
            className={field.input}
            value={look}
            onChange={e => setLook(e.target.value as TimerLook)}
          >
            <option value="fuse">Fuse (sparks)</option>
            <option value="fade">Fade (dithered ends)</option>
            <option value="chunks">Progress bar (chunks)</option>
            <option value="clock">Meeting clock (tab)</option>
            <option value="tab">Fade in a tab on top</option>
          </select>
        </Field>
        <Field label="Reduced motion">
          <input
            type="checkbox"
            checked={still}
            onChange={e => setStill(e.target.checked)}
          />
        </Field>
        <span className="text-mist-400 tabular-nums">
          {left.toFixed(1)} s left · {phase}
        </span>
      </form>
      <Pixels scale={scale} className="pt-[calc(var(--px)*16)]">
        <div
          className="relative flex flex-col"
          style={{ width: `calc(var(--px) * ${LAYOUT.panel.width})` }}
        >
          {elapsed < LIMIT && (
            <SilenceTimer
              elapsed={elapsed}
              limit={LIMIT}
              still={still}
              look={look}
            />
          )}
          <Window
            legend={
              <Legend
                keys={[
                  ['↑↓', 'choose'],
                  ['Enter', 'confirm'],
                ]}
                touch="Tap a line"
              />
            }
          >
            <Dialogue speaker="opponent">{pair.phrase}</Dialogue>
            <Muted className="my-[calc(var(--px)*4)]">Pick your counter.</Muted>
            <Picker
              label="Counters"
              className="gap-0"
              items={options.map(p => ({
                id: p.id,
                label: p.counter,
                onSelect: () => {},
              }))}
            />
          </Window>
        </div>
      </Pixels>
    </div>
  );
};
