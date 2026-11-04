'use client';

import {
  Button,
  type ButtonLook,
  LOOKS,
  TONES,
} from '@sebald/pushback/ui/button';
import { Pixels } from '@sebald/pushback/ui/stage';
import { useState } from 'react';

import { Field, field } from './controls';

/** What the buttons say, one word a tone, after the sheets */
const WORDS = ['Start', 'Pause', 'Menu', 'Retry', 'Back', 'Options'];

/** Both looks in every tone, and one disabled, at a scale to choose */
export const ButtonDemo = () => {
  const [scale, setScale] = useState(3);
  const tones = Object.keys(TONES) as (keyof typeof TONES)[];
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
        <span className="text-mist-400">Press one to see it go down.</span>
      </form>
      <Pixels
        scale={scale}
        className="grid gap-6 overflow-x-auto rounded-md bg-(--pb-bg) p-6 text-(--pb-text)"
      >
        {(Object.keys(LOOKS) as ButtonLook[]).map(look => (
          <div key={look} className="grid gap-2">
            <span className="text-[0.75em] text-(--pb-dim)">{look}</span>
            <div className="flex flex-wrap items-center gap-3">
              {tones.map((tone, i) => (
                <Button key={tone} look={look} tone={tone}>
                  {WORDS[i]}
                </Button>
              ))}
              <Button look={look} disabled>
                Locked
              </Button>
            </div>
          </div>
        ))}
      </Pixels>
    </div>
  );
};
