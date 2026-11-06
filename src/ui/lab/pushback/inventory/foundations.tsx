'use client';

import { Heading, Legend, Text } from '@sebald/blip-ui';
import { PAIRS } from '@sebald/pushback/lib/lines';
import { Dialogue } from '@sebald/pushback/ui/dialogue';
import { PALETTE, type PaletteKey, pbVar } from '@sebald/pushback/ui/palette';
import { Picker } from '@sebald/pushback/ui/picker';
import { Pixels } from '@sebald/pushback/ui/stage';
import { Stamp } from '@sebald/pushback/ui/stamp';
import { useState } from 'react';

import { Field, field } from './controls';

/** The palette by what it is for */
const GROUPS: { title: string; keys: PaletteKey[] }[] = [
  { title: 'Ground and ink', keys: ['bg', 'ink'] },
  {
    title: 'The quiet window',
    keys: ['frame', 'frameDim', 'frameInner', 'fill', 'fillTop', 'fillShade'],
  },
  { title: 'The player', keys: ['gold', 'goldLight', 'goldShade'] },
  { title: 'The opponent', keys: ['ember', 'emberLight', 'emberShade'] },
  { title: 'The clash', keys: ['spark'] },
  { title: 'The stamp', keys: ['stamp'] },
  { title: 'Empty', keys: ['empty', 'emptyDots', 'steel', 'steelLight'] },
  {
    title: 'The letters',
    keys: ['text', 'textBright', 'heading', 'muted', 'dim'],
  },
  {
    title: 'The ghost',
    keys: ['ghost', 'ghostLight', 'ghostRim', 'ghostHole'],
  },
  { title: 'The speech bubble', keys: ['paper', 'paperShade'] },
  { title: 'The placeholder room', keys: ['wall', 'floor'] },
];

/**
 * Every colour of the chrome and the letters, with its name, its hex and
 * the CSS variable the DOM reads it through.
 */
export const PaletteDemo = () => (
  <div className="grid gap-6">
    {GROUPS.map(group => (
      <div key={group.title} className="grid gap-2">
        <p className="m-0 text-sm text-mist-400">{group.title}</p>
        <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
          {group.keys.map(key => (
            <li
              key={key}
              className="grid w-36 gap-1 rounded-lg bg-mist-950 p-2 font-mono text-xs leading-5"
            >
              <span
                className="block h-12 rounded-md ring-1 ring-mist-800"
                style={{ background: PALETTE[key] }}
              />
              <span className="text-mist-100">{key}</span>
              <span className="text-mist-400">{PALETTE[key]}</span>
              <span className="truncate text-mist-500">{pbVar(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

/** The letters by role, at the stage's scale, on the window's fill */
export const TextDemo = () => {
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
            {[2, 3, 4].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </Field>
      </form>
      <Pixels
        scale={scale}
        className="grid w-fit gap-[calc(var(--px)*4)] bg-(--pb-fill) p-[calc(var(--px)*6)] leading-[1.35] text-(--pb-text)"
      >
        <Heading>Heading: your run as PM</Heading>
        <Heading level={3} className="text-[0.85em]">
          Heading, level 3, smaller: a pool&apos;s name, the chosen one
        </Heading>
        <p className="m-0">
          Body text, the window&apos;s own colour: a blurb in the window.
        </p>
        <p className="m-0 text-(--pb-text-bright)">
          A line to pick, a shade brighter, white under the cursor.
        </p>
        <Text>Muted: a prompt over the options, a hint, the reply shown.</Text>
        <Text className="text-[0.8em] opacity-70">
          Muted, smaller and fainter: the fiction line.
        </Text>
        <p className="m-0">
          <Text variant="call">
            Loud: the closer on offer, blinking to half.
          </Text>
        </p>
        <p className="m-0 [--blink-low:0]">
          <Text
            variant="call"
            className="font-bold tracking-[0.15em] uppercase"
          >
            Loud, a full blink: press Enter to play
          </Text>
        </p>
        <Dialogue speaker="opponent">{PAIRS[0]!.phrase}</Dialogue>
        <Dialogue speaker="player">{PAIRS[0]!.counter}</Dialogue>
        <Dialogue speaker="player" muted>
          A line that is over, muted, with its mark.
        </Dialogue>
        <Legend
          className="text-right"
          keys={[
            ['↑↓', 'choose'],
            ['Enter', 'confirm'],
          ]}
          touch="Tap a line"
        />
      </Pixels>
    </div>
  );
};

/** The picker's items: plain, the loud one, dimmed by the ghost, disabled */
export const PickerDemo = () => {
  const [picked, setPicked] = useState<string | null>(null);
  const [dim, setDim] = useState(false);
  const pairs = PAIRS.slice(0, 3);
  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label="Ghost dims the wrong ones">
          <input
            type="checkbox"
            checked={dim}
            onChange={e => setDim(e.target.checked)}
          />
        </Field>
        <span className="text-mist-400">
          {picked
            ? `Picked: ${picked}`
            : 'Move with the keys or hover, confirm with Enter or a tap.'}
        </span>
      </form>
      <Pixels
        scale={3}
        className="w-fit bg-(--pb-fill) p-[calc(var(--px)*6)] leading-[1.35] text-(--pb-text)"
      >
        <Picker
          label="Picker demo"
          className="gap-0"
          items={[
            ...pairs.map((pair, i) => ({
              id: pair.id,
              label: pair.counter,
              dim: dim && i !== 1 ? 0.25 : undefined,
              onSelect: () => setPicked(pair.counter),
            })),
            {
              id: 'loud',
              label: 'The loud one: a closer on offer',
              accent: true,
              onSelect: () => setPicked('the closer'),
            },
            {
              id: 'off',
              label: 'A disabled item',
              note: 'Off, and this box says why: the cursor stops on it, Enter does nothing.',
              disabled: true,
              onSelect: () => {},
            },
          ]}
        />
      </Pixels>
    </div>
  );
};

/** The stamp's three words, on the fill and over a face's colours */
export const StampDemo = () => (
  <Pixels
    scale={4}
    className="flex w-fit flex-wrap items-center gap-[calc(var(--px)*8)] bg-(--pb-fill) p-[calc(var(--px)*6)]"
  >
    <Stamp word="SHIPPED" />
    <Stamp word="DONE" />
    <Stamp word="FLAWLESS" tone="gold" />
    {/* Over a skin tone, the way it sits on a face */}
    <span className="bg-[#c58a62] p-[calc(var(--px)*3)]">
      <Stamp word="DONE" />
    </span>
  </Pixels>
);
