'use client';

import { SpeechBubble, useClock } from '@sebald/blip-ui';
import { GHOST_ANIM_MS, ghostEnter } from '@sebald/pushback/lib/buddy';
import { Ghost } from '@sebald/pushback/ui/ghost';
import { Pixels } from '@sebald/pushback/ui/stage';
import { useState } from 'react';

import { DemoForm, field, Floor, ScaleSelect, Select } from './controls';

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
      <DemoForm>
        <Select
          label="Whisper step"
          value={step}
          options={[
            [0, '0, hovering'],
            [1, '1, hovering'],
            [2, '2, pointing'],
          ]}
          onChange={setStep}
        />
        <ScaleSelect
          value={scale}
          scales={[1, 2, 3, 4, 6]}
          onChange={setScale}
        />
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
      </DemoForm>
      <Pixels scale={scale}>
        <Floor>
          <Ghost step={step} enter={enter} />
        </Floor>
      </Pixels>
      <Pixels
        scale={scale}
        className="flex w-fit flex-col gap-[calc(var(--px)*10)] bg-(--pb-fill) p-[calc(var(--px)*10)]"
      >
        <SpeechBubble className="w-fit">
          I&apos;m not haunting you. I&apos;m onboarding you.
        </SpeechBubble>
        <SpeechBubble className="max-w-[calc(var(--px)*160)]">
          Read it again. Slowly. I have time. I have nothing but time.
        </SpeechBubble>
      </Pixels>
    </div>
  );
};
