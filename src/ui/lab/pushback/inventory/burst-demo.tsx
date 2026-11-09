'use client';

import { BURST_CELLS, Burst } from '@sebald/pushback/ui/burst';
import { Pixels } from '@sebald/pushback/ui/stage';
import { useState } from 'react';

import { Field, Floor, ScaleSelect, field } from './controls';

/** The three cells of the burst, and the pulse */
export const BurstDemo = () => {
  const [pulse, setPulse] = useState(true);
  const [scale, setScale] = useState(3);
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <ScaleSelect value={scale} scales={[1, 2, 3, 4]} onChange={setScale} />
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
