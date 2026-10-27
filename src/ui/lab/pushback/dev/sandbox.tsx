'use client';

import { useMemo, useState } from 'react';

import {
  BOSS_SLOT,
  CHARACTERS,
  RULES,
  SLOTS,
  type Slot,
  characterById,
} from '@/lib/lab/pushback/characters';
import {
  type DuelSetup,
  type DuelState,
  createDuel,
  reduce,
} from '@/lib/lab/pushback/duel';
import { PAIRS, type Role, ROLES, poolOf } from '@/lib/lab/pushback/lines';

import { DuelScreen } from '../duel-screen';

// Options
// ---------------
type Jump =
  | 'intro'
  | 'defend'
  | 'attack'
  | 'resolve-win'
  | 'resolve-miss'
  | 'end-win'
  | 'end-lose';

interface Options {
  role: Role;
  character: string;
  slot: number;
  attempt: DuelSetup['attempt'];
  seed: number;
  silence: boolean;
  seconds: number | null;
  collected: 'own' | 'all' | 'none';
  jump: Jump;
  momentumFull: boolean;
  reducedMotion: boolean;
  scale: number;
}

const DEFAULTS: Options = {
  role: 'pm',
  character: 'junior',
  slot: 0,
  attempt: 'first',
  seed: 1,
  silence: true,
  seconds: null,
  collected: 'own',
  jump: 'intro',
  momentumFull: false,
  reducedMotion: false,
  scale: 2,
};

/** Play the reducer forward to the asked phase */
const play = (state: DuelState, jump: Jump): DuelState => {
  const right = (s: DuelState) =>
    reduce(s, { type: 'counter', phrase: s.exchange!.answer });
  const wrong = (s: DuelState) =>
    reduce(s, {
      type: 'counter',
      phrase:
        s.menu.find(id => id !== s.exchange!.answer) ?? s.exchange!.answer,
    });
  const next = (s: DuelState) => reduce(s, { type: 'continue' });
  const throwFirst = (s: DuelState) =>
    reduce(s, {
      type: 'throw',
      phrase: s.hand[0]!,
      micDrop: s.micDropAvailable,
    });
  const run = (s: DuelState, defend: (s: DuelState) => DuelState) => {
    for (let guard = 0; guard < 60 && s.phase !== 'end'; guard++) {
      if (s.phase === 'defend') s = defend(s);
      else if (s.phase === 'attack') s = throwFirst(s);
      else s = next(s);
    }
    return s;
  };
  switch (jump) {
    case 'intro':
      return state;
    case 'defend':
      return reduce(state, { type: 'begin' });
    case 'attack': {
      const s = next(right(reduce(state, { type: 'begin' })));
      return s.phase === 'attack' ? s : next(right(s));
    }
    case 'resolve-win':
      return right(reduce(state, { type: 'begin' }));
    case 'resolve-miss':
      return wrong(reduce(state, { type: 'begin' }));
    case 'end-win':
      return run(reduce(state, { type: 'begin' }), right);
    case 'end-lose':
      return run(reduce(state, { type: 'begin' }), wrong);
  }
};

/** The state the sandbox hands to the real duel screen */
export const sandboxState = (options: Options): DuelState => {
  const character = characterById(options.character as 'junior');
  const base: Slot =
    character.role === 'boss' ? BOSS_SLOT : (SLOTS[options.slot] ?? SLOTS[0]!);
  const slot: Slot =
    options.seconds === null ? base : { ...base, silence: options.seconds };
  const collected =
    options.collected === 'all'
      ? PAIRS.map(p => p.id)
      : options.collected === 'none'
        ? []
        : poolOf(options.role).map(p => p.id);
  let state = createDuel({
    role: options.role,
    character,
    slot,
    attempt: options.attempt,
    collected,
    seed: options.seed,
    silence: options.silence,
    tutorial: options.slot === 0 && options.attempt === 'first',
  });
  state = play(state, options.jump);
  if (options.momentumFull) {
    state = {
      ...state,
      momentum: { ...state.momentum, player: RULES.momentum },
      micDropAvailable: state.phase === 'attack',
    };
  }
  return state;
};

// Sandbox
// ---------------
const field = 'flex items-center justify-between gap-3 text-sm';
const input =
  'rounded-md bg-mist-900 px-2 py-1 text-mist-100 ring-1 ring-mist-700';

export const Sandbox = () => {
  const [options, setOptions] = useState<Options>(DEFAULTS);
  const [applied, setApplied] = useState<Options>(DEFAULTS);
  const [generation, setGeneration] = useState(0);
  const [last, setLast] = useState<string>('');

  const initial = useMemo(() => sandboxState(applied), [applied]);
  const set = <K extends keyof Options>(key: K, value: Options[K]) =>
    setOptions(previous => ({ ...previous, [key]: value }));
  const apply = () => {
    setApplied(options);
    setGeneration(g => g + 1);
    setLast('');
  };

  return (
    <div className="grid gap-6">
      <form
        className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-xl bg-mist-950 p-4 font-mono md:grid-cols-3"
        onSubmit={event => {
          event.preventDefault();
          apply();
        }}
      >
        <label className={field}>
          Player role
          <select
            className={input}
            value={options.role}
            onChange={e => set('role', e.target.value as Role)}
          >
            {ROLES.map(role => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          Character
          <select
            className={input}
            value={options.character}
            onChange={e => set('character', e.target.value)}
          >
            {CHARACTERS.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          Slot
          <select
            className={input}
            value={options.slot}
            onChange={e => set('slot', Number(e.target.value))}
          >
            {SLOTS.map((slot, index) => (
              <option key={index} value={index}>
                {index + 1}: tier {slot.tier}, {slot.decoys},{' '}
                {slot.silence ?? 'no'}s
              </option>
            ))}
          </select>
        </label>
        <label className={field}>
          Attempt
          <select
            className={input}
            value={options.attempt}
            onChange={e => set('attempt', e.target.value as Options['attempt'])}
          >
            <option value="first">first</option>
            <option value="retry">retry</option>
            <option value="replay">replay</option>
          </select>
        </label>
        <label className={field}>
          Seed
          <input
            className={input}
            type="number"
            value={options.seed}
            onChange={e => set('seed', Number(e.target.value))}
          />
        </label>
        <label className={field}>
          Collected
          <select
            className={input}
            value={options.collected}
            onChange={e =>
              set('collected', e.target.value as Options['collected'])
            }
          >
            <option value="own">own pool</option>
            <option value="all">everything</option>
            <option value="none">nothing</option>
          </select>
        </label>
        <label className={field}>
          Silence bar
          <input
            type="checkbox"
            checked={options.silence}
            onChange={e => set('silence', e.target.checked)}
          />
        </label>
        <label className={field}>
          Seconds override
          <input
            className={input}
            type="number"
            min={1}
            max={30}
            value={options.seconds ?? ''}
            placeholder="slot"
            onChange={e =>
              set(
                'seconds',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
          />
        </label>
        <label className={field}>
          Jump to
          <select
            className={input}
            value={options.jump}
            onChange={e => set('jump', e.target.value as Jump)}
          >
            <option value="intro">intro</option>
            <option value="defend">defend (first phrase)</option>
            <option value="attack">attack (the hand)</option>
            <option value="resolve-win">resolve, player won</option>
            <option value="resolve-miss">resolve, player missed</option>
            <option value="end-win">end, won</option>
            <option value="end-lose">end, lost</option>
          </select>
        </label>
        <label className={field}>
          Momentum full
          <input
            type="checkbox"
            checked={options.momentumFull}
            onChange={e => set('momentumFull', e.target.checked)}
          />
        </label>
        <label className={field}>
          Reduced motion
          <input
            type="checkbox"
            checked={options.reducedMotion}
            onChange={e => set('reducedMotion', e.target.checked)}
          />
        </label>
        <label className={field}>
          Scale
          <select
            className={input}
            value={options.scale}
            onChange={e => set('scale', Number(e.target.value))}
          >
            {[1, 2, 3, 4].map(n => (
              <option key={n} value={n}>
                {n}x
              </option>
            ))}
          </select>
        </label>
        <div className="col-span-full flex items-center gap-4">
          <button
            type="submit"
            className="rounded-md bg-mist-100 px-3 py-1 text-sm font-semibold text-mist-900"
          >
            Apply
          </button>
          <span className="text-sm text-mist-400">
            Boss: pick The Stakeholder (the slot is ignored). {last}
          </span>
        </div>
      </form>

      <div>
        <DuelScreen
          key={generation}
          initial={initial}
          scale={applied.scale}
          reducedMotion={applied.reducedMotion}
          onEnd={duel =>
            setLast(
              `Duel ended: ${duel.winner === 'player' ? 'won' : 'lost'} in ${duel.exchanges} exchanges.`,
            )
          }
          onBack={() => setLast('Back to the roster.')}
        />
      </div>

      <section className="grid gap-2 font-mono text-sm text-mist-400">
        <h2 className="text-mist-200">Later panels</h2>
        <p>
          Sprite viewer: package 5 (sheets and swaps). Scene viewer: package 4
          (loops and posters).
        </p>
      </section>
    </div>
  );
};
