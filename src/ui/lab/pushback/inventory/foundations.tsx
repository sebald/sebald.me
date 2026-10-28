'use client';

import { useState } from 'react';

import { PAIRS } from '@/lib/lab/pushback/lines';

import { Dialogue } from '../dialogue';
import { PALETTE, type PaletteKey, pbVar } from '../palette';
import { Picker } from '../picker';
import { Pixels } from '../stage';
import { Heading, Loud, Muted } from '../text';
import { Legend } from '../window';
import { Field, field } from './controls';

/** The palette by what it is for */
const GROUPS: { title: string; keys: PaletteKey[] }[] = [
  { title: 'Ground and ink', keys: ['bg', 'ink'] },
  {
    title: 'The quiet window',
    keys: ['frame', 'frameDim', 'frameInner', 'fill', 'fillTop'],
  },
  { title: 'The player', keys: ['gold', 'goldLight', 'goldShade'] },
  { title: 'The opponent', keys: ['ember', 'emberLight', 'emberShade'] },
  { title: 'Empty', keys: ['empty', 'emptyDots', 'steel'] },
  {
    title: 'The letters',
    keys: ['text', 'textBright', 'heading', 'muted', 'dim'],
  },
  {
    title: 'The ghost',
    keys: ['ghost', 'ghostLight', 'ghostRim', 'ghostInk', 'ghostHole'],
  },
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
        <Muted>
          Muted: a prompt over the options, a hint, the reply shown.
        </Muted>
        <Muted className="text-[0.8em] opacity-70">
          Muted, smaller and fainter: the fiction line.
        </Muted>
        <p className="m-0">
          <Loud>Loud: the closer on offer, blinking to half.</Loud>
        </p>
        <p className="m-0 [--blink-low:0]">
          <Loud className="font-bold tracking-[0.15em] uppercase">
            Loud, a full blink: press Enter to play
          </Loud>
        </p>
        <Dialogue speaker="opponent">{PAIRS[0]!.phrase}</Dialogue>
        <Dialogue speaker="player">{PAIRS[0]!.counter}</Dialogue>
        <Dialogue speaker="player" muted>
          A line that is over, muted, with its mark.
        </Dialogue>
        <p className="m-0 text-right text-[0.75em] text-(--pb-dim)">
          <Legend
            keys={[
              ['↑↓', 'choose'],
              ['Enter', 'confirm'],
            ]}
            touch="Tap a line"
          />
        </p>
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
              label: 'A disabled item, skipped by the keys',
              disabled: true,
              onSelect: () => {},
            },
          ]}
        />
      </Pixels>
    </div>
  );
};
