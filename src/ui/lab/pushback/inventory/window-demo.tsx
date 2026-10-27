'use client';

import { useState } from 'react';

import { PAIRS } from '@/lib/lab/pushback/lines';
import { LAYOUT, typedChars } from '@/lib/lab/pushback/stage';

import { Dialogue, Hint } from '../dialogue';
import { Picker } from '../picker';
import { Pixels } from '../stage';
import { useClock } from '../use-clock';
import { Legend, Window } from '../window';
import { Field, field } from './controls';

const LINE = PAIRS[0]!.phrase;

/** The duel's window as it looks while the player picks a counter */
export const WindowDemo = () => {
  const [picked, setPicked] = useState<string | null>(null);
  const [scale, setScale] = useState(3);
  const clock = useClock();
  // The line types over and over, four seconds a round
  const typed = LINE.slice(0, typedChars(clock % 4000, LINE));
  const options = PAIRS.slice(1, 5);
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
        <span className="text-mist-400">
          {picked ? `Picked: ${picked}` : 'Pick a line with the keys or a tap.'}
        </span>
      </form>
      <Pixels scale={scale} className="grid gap-[calc(var(--px)*6)]">
        <Window
          style={{ width: `calc(var(--px) * ${LAYOUT.panel.width})` }}
          legend={
            <Legend keys={[['Enter', 'continue']]} touch="Tap to continue" />
          }
        >
          <Dialogue speaker="opponent">{typed}</Dialogue>
        </Window>
        <Window
          style={{
            width: `calc(var(--px) * ${LAYOUT.panel.width})`,
            minHeight: `calc(var(--px) * ${LAYOUT.panel.height})`,
          }}
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
          <Dialogue speaker="opponent" muted>
            {LINE}
          </Dialogue>
          <Hint className="mt-[calc(var(--px)*4)]">Pick your counter.</Hint>
          <Picker
            label="Counters"
            className="gap-0"
            items={options.map(pair => ({
              id: pair.id,
              label: pair.counter,
              onSelect: () => setPicked(pair.counter),
            }))}
          />
        </Window>
      </Pixels>
    </div>
  );
};
