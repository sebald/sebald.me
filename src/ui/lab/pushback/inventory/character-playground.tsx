'use client';

import { useState } from 'react';

import { CHARACTERS, LOOKS } from '@/lib/lab/pushback/characters';
import { ROLES } from '@/lib/lab/pushback/lines';
import { PLAYER_SHEETS, type SheetId } from '@/lib/lab/pushback/sprites';
import { type Pose } from '@/lib/lab/pushback/stage';

import { Character } from '../character';
import { Pixels } from '../stage';
import { Field, Floor, field } from './controls';

const POSES: Pose[] = ['idle', 'talk', 'taunt', 'flinch', 'win', 'lose'];

interface Entry {
  /** The name, which is unique; two entries can share a sheet */
  label: string;
  sheet: SheetId;
}

/** The six looks, the nine colleagues and the boss */
export const CAST: Entry[] = [
  ...ROLES.flatMap(role =>
    (['a', 'b'] as const).map(look => {
      return {
        label: LOOKS[role][look].name,
        sheet: PLAYER_SHEETS[role][look],
      };
    }),
  ),
  ...CHARACTERS.map(c => ({ label: c.name, sheet: c.sheet })),
];

/**
 * One character at a time: who, the pose, mirrored, the scale, talking
 * or not; idle by default, so the breathing shows.
 */
export const CharacterPlayground = () => {
  const [who, setWho] = useState(CAST[0]!.label);
  const [pose, setPose] = useState<Pose>('idle');
  const [mirrored, setMirrored] = useState(false);
  const [typing, setTyping] = useState(true);
  const [micDrop, setMicDrop] = useState(false);
  const [still, setStill] = useState(false);
  const [scale, setScale] = useState(3);
  const entry = CAST.find(e => e.label === who) ?? CAST[0]!;

  return (
    <div className="grid gap-4">
      <form className={field.form} onSubmit={e => e.preventDefault()}>
        <Field label="Who">
          <select
            className={field.input}
            value={who}
            onChange={e => setWho(e.target.value)}
          >
            {CAST.map(e => (
              <option key={e.label} value={e.label}>
                {e.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pose">
          <select
            className={field.input}
            value={pose}
            onChange={e => setPose(e.target.value as Pose)}
          >
            {POSES.map(p => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
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
        <Field label="Mirrored">
          <input
            type="checkbox"
            checked={mirrored}
            onChange={e => setMirrored(e.target.checked)}
          />
        </Field>
        <Field label="Typing (talk)">
          <input
            type="checkbox"
            checked={typing}
            onChange={e => setTyping(e.target.checked)}
          />
        </Field>
        <Field label="Mic drop (taunt)">
          <input
            type="checkbox"
            checked={micDrop}
            onChange={e => setMicDrop(e.target.checked)}
          />
        </Field>
        <Field label="Still">
          <input
            type="checkbox"
            checked={still}
            onChange={e => setStill(e.target.checked)}
          />
        </Field>
      </form>
      <Pixels scale={scale}>
        <Floor>
          <Character
            key={`${entry.sheet}|${pose}`}
            sheet={entry.sheet}
            pose={pose}
            mirrored={mirrored}
            typing={typing}
            micDrop={micDrop}
            still={still}
          />
        </Floor>
      </Pixels>
    </div>
  );
};

/** Everyone, idle, at 2x, with their names */
export const Cast = () => (
  <Pixels scale={2}>
    <Floor className="flex flex-wrap gap-x-2 gap-y-4">
      {CAST.map(e => (
        <figure key={e.label} className="grid justify-items-center gap-1">
          <Character sheet={e.sheet} />
          <figcaption className="text-[0.75em] text-[#8a92b8]">
            {e.label}
          </figcaption>
        </figure>
      ))}
    </Floor>
  </Pixels>
);
