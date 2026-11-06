'use client';

import { useClock } from '@sebald/blip-ui';
import { PAIRS } from '@sebald/pushback/lib/lines';
import { LAYOUT } from '@sebald/pushback/lib/stage';
import { Dialogue } from '@sebald/pushback/ui/dialogue';
import { Picker } from '@sebald/pushback/ui/picker';
import { SILENCE_CLOCK, SilenceTimer } from '@sebald/pushback/ui/silence-timer';
import { Pixels, px } from '@sebald/pushback/ui/stage';
import { Legend, Window } from '@sebald/pushback/ui/window';
import { useState } from 'react';

import { Field, field } from './controls';

/** A normal-mode menu of five runs about thirteen seconds */
const LIMIT = 13_000;

/** A beat with the time run out before it starts again */
const REST = 1_500;

/**
 * The silence bar in the duel's window, the stopwatch in its corner: it
 * runs on a loop, or holds at the point the slider picks, so each phase
 * can be looked at (light blue while a counter counts as fast, blinking
 * from the half on, ember, red)
 */
export const TimerDemo = () => {
  const [scale, setScale] = useState(3);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(LIMIT * 0.3);
  const [still, setStill] = useState(false);
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
      <Pixels scale={scale}>
        <Window
          style={{ width: `calc(var(--px) * ${LAYOUT.panel.width})` }}
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
          {elapsed < LIMIT && (
            <SilenceTimer
              key={playing ? Math.floor(clock / (LIMIT + REST)) : 'held'}
              elapsed={elapsed}
              limit={LIMIT}
              still={still}
              className="absolute"
              style={{ top: px(2), right: 'calc(var(--px) * 3 + 4px)' }}
            />
          )}
          <Dialogue
            speaker="opponent"
            style={{ paddingRight: px(SILENCE_CLOCK.width + 4) }}
          >
            {pair.phrase}
          </Dialogue>
          <Picker
            label="Counters"
            className="mt-[calc(var(--px)*2)] gap-0 [&_button]:py-[0.1em]"
            items={options.map(p => ({
              id: p.id,
              label: p.counter,
              onSelect: () => {},
            }))}
          />
        </Window>
      </Pixels>
    </div>
  );
};
