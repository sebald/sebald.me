'use client';

import { useState } from 'react';

import { GHOST_ANIM_MS, ghostEnter } from '@/lib/lab/pushback/buddy';

import { Bubble } from '../bubble';
import { Ghost } from '../ghost';
import { Pixels } from '../stage';
import { useClock } from '../use-clock';
import { Field, Floor, field } from './controls';

/** The ghost hovering, pointing, and going through its black hole */
export const GhostDemo = () => {
  const [step, setStep] = useState(0);
  const [scale, setScale] = useState(3);
  const [anim, setAnim] = useState<{ at: number; leaving: boolean } | null>(
    null,
  );
  const clock = useClock();
  let enter = 1;
  if (anim) {
    const progress = ghostEnter(clock - anim.at);
    enter = anim.leaving ? 1 - progress : progress;
  }
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label="Whisper step">
          <select
            className={field.input}
            value={step}
            onChange={e => setStep(Number(e.target.value))}
          >
            <option value={0}>0, hovering</option>
            <option value={1}>1, hovering</option>
            <option value={2}>2, pointing</option>
          </select>
        </Field>
        <Field label="Scale">
          <select
            className={field.input}
            value={scale}
            onChange={e => setScale(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 6].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          className={field.input}
          onClick={() => setAnim({ at: clock, leaving: false })}
        >
          Appear ({GHOST_ANIM_MS} ms)
        </button>
        <button
          type="button"
          className={field.input}
          onClick={() => setAnim({ at: clock, leaving: true })}
        >
          Leave
        </button>
      </form>
      <Pixels scale={scale}>
        <Floor>
          <Ghost step={step} enter={enter} />
        </Floor>
      </Pixels>
      <Pixels
        scale={scale}
        className="flex w-fit flex-col gap-[calc(var(--px)*10)] bg-(--pb-fill) p-[calc(var(--px)*10)]"
      >
        <Bubble className="w-fit">
          I&apos;m not haunting you. I&apos;m onboarding you.
        </Bubble>
        <Bubble className="max-w-[calc(var(--px)*160)]">
          Read it again. Slowly. I have time. I have nothing but time.
        </Bubble>
      </Pixels>
    </div>
  );
};
