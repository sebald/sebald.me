'use client';

import { useState } from 'react';

import { BURST_CELLS, Burst } from '../burst';
import { Pixels } from '../stage';
import { Field, Floor, field } from './controls';

/** The three cells of the burst, and the pulse */
export const BurstDemo = () => {
  const [pulse, setPulse] = useState(true);
  const [scale, setScale] = useState(3);
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label="Scale">
          <select
            className={field.input}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pulse">
          <input
            type="checkbox"
            checked={pulse}
            onChange={e => setPulse(e.target.checked)}
          />
        </Field>
      </form>
      <Pixels scale={scale}>
        <Floor className="flex items-end gap-[calc(var(--px)*4)]">
          <Burst pulse={pulse} />
          <Burst cell={BURST_CELLS.big} />
          <Burst cell={BURST_CELLS.popped} />
        </Floor>
      </Pixels>
    </div>
  );
};
