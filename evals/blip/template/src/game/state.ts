// The game's state and what can be done to it. Actions refuse what the state
// doesn't allow and say why; none of them asks the player anything, that is a
// screen's job.
import { useSyncExternalStore } from 'react';

import {
  FIXTURES,
  ITEMS,
  REST_COST,
  type FixtureName,
  type GameState,
  type Options,
} from './data';

export type Refusal = { ok: false; reason: 'gold' | 'none' };
export type Result = { ok: true } | Refusal;

const copy = (state: GameState): GameState => structuredClone(state);

let game: GameState = copy(FIXTURES.start);
const listeners = new Set<() => void>();

const set = (next: GameState) => {
  game = next;
  listeners.forEach(listener => listener());
};

/** The current game state */
export const getGame = () => game;

/** The current game state, re-rendering the component when it changes */
export const useGame = () =>
  useSyncExternalStore(
    listener => {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    getGame,
    getGame,
  );

/** Replace the game with a fixture, as a new copy */
export const openFixture = (name: FixtureName) => set(copy(FIXTURES[name]));

const count = (id: string) =>
  game.pack.find(entry => entry.item === id)?.count ?? 0;

const withPack = (id: string, change: number): GameState['pack'] => {
  const next = count(id) + change;
  const rest = game.pack.filter(entry => entry.item !== id);
  return next > 0 ? [...rest, { item: id, count: next }] : rest;
};

/** Buy one of an item: refused for an unknown item or too little gold */
export const buy = (id: string): Result => {
  const found = ITEMS.find(item => item.id === id);
  if (!found) return { ok: false, reason: 'none' };
  if (game.gold < found.price) return { ok: false, reason: 'gold' };
  set({
    ...game,
    gold: game.gold - found.price,
    pack: withPack(id, 1),
  });
  return { ok: true };
};

/** Sell one of an item from the pack: refused when there is none */
export const sell = (id: string): Result => {
  const found = ITEMS.find(item => item.id === id);
  if (!found || count(id) === 0) return { ok: false, reason: 'none' };
  set({
    ...game,
    gold: game.gold + found.sellPrice,
    pack: withPack(id, -1),
  });
  return { ok: true };
};

/** Save the game into a slot (0 to 2), whatever it held before */
export const save = (slot: number): Result => {
  const leader = game.party[0];
  if (!(slot in game.slots) || !leader) return { ok: false, reason: 'none' };
  const slots = [...game.slots] as GameState['slots'];
  slots[slot] = {
    place: game.place,
    leader: leader.name,
    level: leader.level,
    playtime: game.playtime,
    savedAt: new Date().toISOString(),
  };
  set({ ...game, slots });
  return { ok: true };
};

/**
 * Load a slot: the place and play time of the save come back. Refused for an
 * empty slot
 */
export const load = (slot: number): Result => {
  const saved = game.slots[slot];
  if (!saved) return { ok: false, reason: 'none' };
  set({ ...game, place: saved.place, playtime: saved.playtime, fight: null });
  return { ok: true };
};

/** Rest at camp: costs `REST_COST` gold, refused without it */
export const rest = (): Result => {
  if (game.gold < REST_COST) return { ok: false, reason: 'gold' };
  set({
    ...game,
    gold: game.gold - REST_COST,
    party: game.party.map(member => ({
      ...member,
      hp: member.maxHp,
      mp: member.maxMp,
    })),
  });
  return { ok: true };
};

/** Change one option; the volumes stay between 0 and 10 */
export const setOption = <K extends keyof Options>(
  key: K,
  value: Options[K],
) => {
  const next =
    typeof value === 'number' ? Math.min(10, Math.max(0, value)) : value;
  set({ ...game, options: { ...game.options, [key]: next } });
};

/** End the run: back to a new game */
export const leaveRun = () => set(copy(FIXTURES.empty));
