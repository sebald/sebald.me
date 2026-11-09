'use client';

import {
  BOSS_SLOT,
  CHARACTERS,
  LOOKS,
  type Look,
  MODES,
  MODE_LABELS,
  MODE_ORDER,
  type Mode,
  RULES,
  SLOTS,
  type Slot,
  characterById,
  drawDeck,
  repertoireFor,
  type SceneId,
} from '@sebald/pushback/lib/characters';
import {
  type DuelSetup,
  type DuelState,
  closerFor,
  createDuel,
  reduce,
} from '@sebald/pushback/lib/duel';
import { type Role, ROLES, deckPool } from '@sebald/pushback/lib/lines';
import { Rng, seedRng } from '@sebald/pushback/lib/random';
import { DuelScreen } from '@sebald/pushback/ui/duel-screen';
import { useMemo, useState } from 'react';

import { Field, ScaleSelect, Select, field } from './controls';

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
  look: Look;
  character: string;
  /** The room, instead of the opponent's: to judge the scale of each */
  scene: SceneId | null;
  slot: number;
  attempt: DuelSetup['attempt'];
  seed: number;
  silence: boolean;
  /** The ghost of the predecessor, as in easy mode */
  buddy: boolean;
  /** The ghost out on every defence right away, to see where it stands */
  ghostAlways: boolean;
  /** Whose rules: easy has no timer, hard tires slowly and rushes */
  mode: Mode;
  /** The silence bar's share of the reading time, instead of the mode's */
  share: number | null;
  collected: 'own' | 'all' | 'none';
  jump: Jump;
  momentumFull: boolean;
  reducedMotion: boolean;
  scale: number;
}

const SCENES: SceneId[] = ['floor', 'meeting', 'studio', 'office'];

/** The person on a sheet, from its id: `dev-sam` is Sam */
const personOn = (sheet: string) => {
  const name = sheet.slice(sheet.indexOf('-') + 1);
  return name[0]!.toUpperCase() + name.slice(1);
};

const DEFAULTS: Options = {
  role: 'pm',
  look: 'a',
  character: 'junior',
  scene: null,
  slot: 0,
  attempt: 'first',
  seed: 1,
  silence: true,
  buddy: false,
  ghostAlways: false,
  mode: 'normal',
  share: null,
  collected: 'own',
  jump: 'intro',
  momentumFull: false,
  reducedMotion: false,
  scale: 3,
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
    reduce(s, { type: 'throw', phrase: s.closer ?? s.hand[0]! });
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
  const slot: Slot = base;
  const rules = MODES[options.mode].rules;
  const deck = drawDeck(new Rng(seedRng(options.seed)));
  const collected =
    options.collected === 'all'
      ? deck
      : options.collected === 'none'
        ? []
        : deckPool(deck, options.role);
  let state = createDuel({
    role: options.role,
    character,
    slot,
    attempt: options.attempt,
    deck,
    repertoire: repertoireFor(character, deck, options.seed),
    collected,
    seed: options.seed,
    silence: options.silence,
    buddy: options.buddy,
    rules:
      options.share === null
        ? rules
        : { ...rules, reading: { ...rules.reading, share: options.share } },
    tutorial: options.slot === 0 && options.attempt === 'first',
  });
  state = play(state, options.jump);
  if (options.momentumFull) {
    state = {
      ...state,
      momentum: { ...state.momentum, player: RULES.momentum },
      closer: state.phase === 'attack' ? closerFor(state) : null,
    };
  }
  return state;
};

// Sandbox
// ---------------
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
        className={field.form}
        onSubmit={event => {
          event.preventDefault();
          apply();
        }}
      >
        <Select
          label="Player role"
          value={options.role}
          options={ROLES}
          onChange={role => set('role', role)}
        />
        <Select
          label="Look"
          value={options.look}
          options={(['a', 'b'] as const).map(
            look => [look, LOOKS[options.role][look].name] as const,
          )}
          onChange={look => set('look', look)}
        />
        <Select
          label="Opponent"
          value={options.character}
          options={CHARACTERS.map(
            c =>
              [
                c.id,
                c.sheet === 'boss'
                  ? c.name
                  : `${c.name} · ${personOn(c.sheet)}`,
              ] as const,
          )}
          onChange={id => set('character', id)}
        />
        <Select
          label="Room"
          value={options.scene ?? ''}
          options={[['', "the opponent's"], ...SCENES]}
          onChange={id => set('scene', id || null)}
        />
        <Select
          label="Slot"
          value={options.slot}
          options={SLOTS.map(
            (slot, index) =>
              [
                index,
                `${index + 1}: tier ${slot.tier}, ${slot.decoys}, ${slot.silence ? 'timed' : 'no bar'}`,
              ] as const,
          )}
          onChange={slot => set('slot', slot)}
        />
        <Select
          label="Attempt"
          value={options.attempt}
          options={['first', 'retry', 'replay'] as const}
          onChange={attempt => set('attempt', attempt)}
        />
        <Field label="Seed">
          <input
            className={field.input}
            type="number"
            value={options.seed}
            onChange={e => set('seed', Number(e.target.value))}
          />
        </Field>
        <Select
          label="Collected"
          value={options.collected}
          options={
            [
              ['own', 'own pool'],
              ['all', 'everything'],
              ['none', 'nothing'],
            ] as const
          }
          onChange={collected => set('collected', collected)}
        />
        <Field label="Silence bar">
          <input
            type="checkbox"
            checked={options.silence}
            onChange={e => set('silence', e.target.checked)}
          />
        </Field>
        <Field label="Ghost">
          <input
            type="checkbox"
            checked={options.buddy}
            onChange={e => set('buddy', e.target.checked)}
          />
        </Field>
        <Field label="Ghost right away">
          <input
            type="checkbox"
            checked={options.ghostAlways}
            onChange={e => {
              set('ghostAlways', e.target.checked);
              if (e.target.checked) set('buddy', true);
            }}
          />
        </Field>
        <Select
          label="Rules"
          value={options.mode}
          options={MODE_ORDER.map(mode => [mode, MODE_LABELS[mode]] as const)}
          onChange={mode => set('mode', mode)}
        />
        <Field label="Reading share">
          <input
            className={field.input}
            type="number"
            min={0.1}
            max={2}
            step={0.1}
            value={options.share ?? ''}
            placeholder="mode"
            onChange={e =>
              set(
                'share',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
          />
        </Field>
        <Select
          label="Jump to"
          value={options.jump}
          options={
            [
              ['intro', 'intro'],
              ['defend', 'defend (first phrase)'],
              ['attack', 'attack (the hand)'],
              ['resolve-win', 'resolve, player won'],
              ['resolve-miss', 'resolve, player missed'],
              ['end-win', 'end, won'],
              ['end-lose', 'end, lost'],
            ] as const
          }
          onChange={jump => set('jump', jump)}
        />
        <Field label="Momentum full">
          <input
            type="checkbox"
            checked={options.momentumFull}
            onChange={e => set('momentumFull', e.target.checked)}
          />
        </Field>
        <Field label="Reduced motion">
          <input
            type="checkbox"
            checked={options.reducedMotion}
            onChange={e => set('reducedMotion', e.target.checked)}
          />
        </Field>
        <ScaleSelect
          value={options.scale}
          scales={[1, 2, 3, 4]}
          onChange={n => set('scale', n)}
        />
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
          look={applied.look}
          scale={applied.scale}
          ghostAlways={applied.ghostAlways}
          scene={applied.scene ?? undefined}
          reducedMotion={applied.reducedMotion}
          onEnd={duel =>
            setLast(
              `Duel ended: ${duel.winner === 'player' ? 'won' : 'lost'} in ${duel.exchanges} exchanges.`,
            )
          }
          onBack={() => setLast('Back to the roster.')}
        />
      </div>
    </div>
  );
};
