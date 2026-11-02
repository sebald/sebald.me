'use client';

import { useEffect, useState } from 'react';

import { type Cue, DUEL_LAYERS, MUSIC } from '@/lib/lab/pushback/audio/music';
import { compile } from '@/lib/lab/pushback/audio/notes';
import { cn } from '@/lib/styles.utils';

import type { BlipVoice, Effect } from '../audio/effects';
import {
  auditionMusic,
  effect,
  setMomentum,
  speak,
  unlock,
} from '../audio/engine';
import { field } from './controls';

const CUES = Object.keys(MUSIC) as Cue[];

const EFFECT_LABELS: Record<Effect, string> = {
  cursor: 'Cursor',
  confirm: 'Confirm',
  cancel: 'Cancel',
  bump: 'Disabled bump',
  fast: 'Fast counter',
  hit: 'Hit',
  micDrop: 'Mic drop',
  flash: 'Stopwatch, half gone',
  tick: 'Stopwatch tick',
  win: 'YOU WIN stinger',
  lose: 'YOU LOSE stinger',
};

const VOICES: Record<BlipVoice, string> = {
  pm: 'PM',
  dev: 'Dev',
  designer: 'Designer',
  boss: 'Stakeholder',
  ghost: 'Ghost',
};

/** A line typed at the game's pace, three letters a step */
const LINE = "Let's take this offline.";

const typeLine = (voice: BlipVoice) => {
  unlock();
  for (let i = 3; i <= LINE.length + 2; i += 3) {
    setTimeout(() => speak(voice, LINE.slice(i - 3, i), true), (i / 3) * 125);
  }
};

/** What a piece takes of the chip, as the hardware counts it */
const channels = (cue: Cue) => {
  const { channels: c, steps } = compile(MUSIC[cue]);
  return `${steps / 16} bars · FM ${c.fm + (c.dac ? 1 : 0)}/6 · PSG ${c.psg}/3 · noise ${c.noise}/1`;
};

/**
 * Every piece of the soundtrack and every effect, whatever the game's
 * switches say: a piece plays until stopped (a jingle once), the duel and
 * the boss with their momentum layers.
 */
export const SoundDemo = () => {
  const [playing, setPlaying] = useState<Cue | null>(null);
  const [momentum, setLayer] = useState(0);

  // Stop when the section goes
  useEffect(() => () => auditionMusic(null), []);

  const play = (cue: Cue) => {
    const stop = playing === cue;
    setPlaying(stop ? null : cue);
    auditionMusic(stop ? null : cue);
    // A jingle is over by itself
    if (!stop && MUSIC[cue].once) {
      const { steps, stepSeconds } = compile(MUSIC[cue]);
      setTimeout(
        () => setPlaying(current => (current === cue ? null : current)),
        steps * stepSeconds * 1000,
      );
    }
  };

  return (
    <div className="grid gap-4">
      <div className={field.form}>
        {CUES.map(cue => (
          <button
            key={cue}
            type="button"
            aria-pressed={playing === cue}
            className={cn(field.input, playing === cue && 'ring-mist-300')}
            onClick={() => play(cue)}
            title={channels(cue)}
          >
            {playing === cue ? '■' : '▶'} {MUSIC[cue].name}
          </button>
        ))}
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
      </div>
      <ol className="m-0 grid gap-1 pl-5 font-mono text-sm text-mist-400">
        {DUEL_LAYERS.map((layer, i) => (
          <li
            key={layer}
            className={i <= momentum ? 'text-mist-100' : undefined}
          >
            {i === 0 ? 'Duel' : `Momentum ${i}`}: {layer}
          </li>
        ))}
      </ol>
      <div className={field.form}>
        {(Object.keys(EFFECT_LABELS) as Effect[]).map(name => (
          <button
            key={name}
            type="button"
            className={field.input}
            onClick={() => {
              unlock();
              effect(name, true);
            }}
          >
            {EFFECT_LABELS[name]}
          </button>
        ))}
      </div>
      <div className={field.form}>
        <span className="text-mist-300">Text blip</span>
        {(Object.keys(VOICES) as BlipVoice[]).map(voice => (
          <button
            key={voice}
            type="button"
            className={field.input}
            onClick={() => typeLine(voice)}
          >
            {VOICES[voice]}
          </button>
        ))}
      </div>
      <p className="m-0 font-mono text-sm text-mist-400">
        {CUES.map(cue => `${MUSIC[cue].name}: ${channels(cue)}`).join(' · ')}
      </p>
    </div>
  );
};
