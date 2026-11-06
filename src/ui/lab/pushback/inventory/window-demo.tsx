'use client';

import {
  Legend,
  Line,
  MAX_CROP,
  Picker,
  PickerItem,
  Text,
  useClock,
  Window,
} from '@sebald/blip-ui';
import { CLOSERS, MENU_PROMPTS, PAIRS } from '@sebald/pushback/lib/lines';
import { LAYOUT, STAGE, typedChars } from '@sebald/pushback/lib/stage';
import { Pixels } from '@sebald/pushback/ui/stage';
import { useState } from 'react';

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
  // Hard mode's mic drop in a short window: ten options, more than the
  // cropped stage has room for
  const many = PAIRS.slice(1, 11);
  // The hand with a closer on offer: the gold line drops the mic
  const hand = PAIRS.slice(0, 4);
  const closer = CLOSERS[0]!;
  const maxHeight = `calc(var(--px) * ${STAGE.height - LAYOUT.panel.x - MAX_CROP - LAYOUT.hud})`;
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
        <Window style={{ width: `calc(var(--px) * ${LAYOUT.panel.width})` }}>
          <Line variant="secondary">{typed}</Line>
          <Legend keys={[['Enter', 'continue']]} touch="Tap to continue" />
        </Window>
        <Window
          style={{
            width: `calc(var(--px) * ${LAYOUT.panel.width})`,
            minHeight: `calc(var(--px) * ${LAYOUT.panel.height})`,
          }}
        >
          <Line variant="secondary">{LINE}</Line>
          <Text className="my-[calc(var(--px)*4)]">Pick your counter.</Text>
          <Picker label="Counters" className="gap-0">
            {options.map(pair => (
              <PickerItem
                key={pair.id}
                id={pair.id}
                onSelect={() => setPicked(pair.counter)}
              >
                {pair.counter}
              </PickerItem>
            ))}
          </Picker>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </Window>
        <Window
          style={{
            width: `calc(var(--px) * ${LAYOUT.panel.width})`,
            minHeight: `calc(var(--px) * ${LAYOUT.panel.height})`,
          }}
        >
          <Text className="my-[calc(var(--px)*4)]">{MENU_PROMPTS.micDrop}</Text>
          <Picker label="Your phrases" className="gap-0">
            {hand.map(pair => (
              <PickerItem
                key={pair.id}
                id={pair.id}
                onSelect={() => setPicked(pair.phrase)}
              >
                {pair.phrase}
              </PickerItem>
            ))}
            <PickerItem
              id={closer.id}
              variant="accent"
              onSelect={() => setPicked(`${closer.phrase} (mic drop)`)}
            >
              {closer.phrase}
            </PickerItem>
          </Picker>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </Window>
        <Window
          style={{
            width: `calc(var(--px) * ${LAYOUT.panel.width})`,
            minHeight: `calc(var(--px) * ${LAYOUT.panel.height})`,
            maxHeight,
          }}
        >
          <Line variant="secondary">{LINE}</Line>
          <Text className="my-[calc(var(--px)*4)]">
            Pick your counter. (Ten options in a short window: the list scrolls
            on its rail.)
          </Text>
          <Picker label="Counters, many" className="gap-0">
            {many.map(pair => (
              <PickerItem
                key={pair.id}
                id={pair.id}
                onSelect={() => setPicked(pair.counter)}
              >
                {pair.counter}
              </PickerItem>
            ))}
          </Picker>
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </Window>
      </Pixels>
    </div>
  );
};
