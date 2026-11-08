'use client';

import { compile } from '@sebald/pushback/lib/audio/notes';
import { auditionMusic, setMomentum } from '@sebald/pushback/ui/audio/engine';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/styles.utils';

import { field } from './controls';
import { type Candidate, ROOMS } from './tune-candidates';

const PICKS_KEY = 'pushback-tune-picks';

/** What a candidate takes of the chip, as the hardware counts it */
const channels = ({ piece }: Candidate) => {
  const { channels: c } = compile(piece);
  return `FM ${c.fm + (c.dac ? 1 : 0)}/6 · PSG ${c.psg}/3 · noise ${c.noise}/1`;
};

const readPicks = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(PICKS_KEY) ?? '{}');
  } catch {
    return {};
  }
};

/**
 * The rooms' duel loops to pick from: each room's loop as it ships and
 * two variations, played one at a time with the momentum layers, the
 * suggested one marked with why. A pick is kept in this browser only, to
 * say which one goes into the game.
 */
export const TunePicker = () => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [momentum, setLayer] = useState(0);
  // The picks from earlier visits (the inventory renders in the browser only)
  const [picks, setPicks] = useState<Record<string, string>>(readPicks);

  // Stop when the section goes
  useEffect(() => () => auditionMusic(null), []);

  const play = (candidate: Candidate) => {
    const stop = playing === candidate.id;
    setPlaying(stop ? null : candidate.id);
    auditionMusic(stop ? null : candidate.piece);
  };

  const pick = (room: string, id: string) => {
    const next = { ...picks, [room]: id };
    setPicks(next);
    try {
      localStorage.setItem(PICKS_KEY, JSON.stringify(next));
    } catch {
      // Private mode: the pick lasts until the page is left
    }
  };

  return (
    <div className="grid gap-6">
      <div className={field.form}>
        <span className="flex items-center gap-2 text-mist-300">
          Momentum
          {[0, 1, 2].map(n => (
            <button
              key={n}
              type="button"
              aria-pressed={momentum === n}
              className={cn(field.input, momentum === n && 'ring-mist-300')}
              onClick={() => {
                setLayer(n);
                setMomentum(n);
              }}
            >
              {n}
            </button>
          ))}
        </span>
        <span className="text-mist-400">
          0 the groove · 1 the tune comes in · 2 the arpeggio on top
        </span>
      </div>
      {ROOMS.map(({ room, candidates, suggested, why }) => (
        <section key={room} className="grid gap-3">
          <h3 className="m-0 font-mono text-sm text-mist-100">{room}</h3>
          <ul className="m-0 grid list-none gap-2 p-0">
            {candidates.map(candidate => {
              const on = playing === candidate.id;
              const chosen = picks[room] === candidate.id;
              return (
                <li
                  key={candidate.id}
                  className={cn(
                    'grid gap-2 rounded-xl bg-mist-950 p-4 font-mono text-sm ring-1 ring-transparent',
                    chosen && 'ring-mist-300',
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      aria-pressed={on}
                      className={cn(field.input, on && 'ring-mist-300')}
                      onClick={() => play(candidate)}
                    >
                      {on ? '■' : '▶'} {candidate.label}
                    </button>
                    {candidate.id === suggested && (
                      <span className="rounded-md bg-mist-800 px-2 py-0.5 text-mist-100">
                        suggested
                      </span>
                    )}
                    <span className="text-mist-500">{channels(candidate)}</span>
                    <button
                      type="button"
                      aria-pressed={chosen}
                      className={cn(field.input, 'ml-auto')}
                      onClick={() => pick(room, candidate.id)}
                    >
                      {chosen ? 'Picked' : 'Pick'}
                    </button>
                  </div>
                  <p className="m-0 text-mist-300">{candidate.about}</p>
                </li>
              );
            })}
          </ul>
          <p className="m-0 font-mono text-sm text-mist-400">
            Why {candidates.find(c => c.id === suggested)?.label}: {why}
          </p>
        </section>
      ))}
    </div>
  );
};
