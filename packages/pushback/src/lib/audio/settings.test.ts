import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  DEFAULT_SOUND,
  SOUND_KEY,
  type SoundStorage,
  loadSound,
  parseSound,
  writeSound,
} from './settings';

const fakeStorage = (initial: Record<string, string> = {}): SoundStorage => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
};

describe('sound settings', () => {
  it('start off', () => {
    assert.deepEqual(DEFAULT_SOUND, { music: false, effects: false });
    assert.deepEqual(loadSound(fakeStorage()), DEFAULT_SOUND);
  });

  it('round-trip through storage', () => {
    const storage = fakeStorage();
    writeSound({ music: true, effects: false }, storage);
    assert.deepEqual(loadSound(storage), { music: true, effects: false });
  });

  it('fall back to off for anything unreadable', () => {
    assert.deepEqual(parseSound('not json'), DEFAULT_SOUND);
    assert.deepEqual(parseSound('null'), DEFAULT_SOUND);
    assert.deepEqual(parseSound('{"music":"yes"}'), DEFAULT_SOUND);
    assert.deepEqual(
      loadSound(fakeStorage({ [SOUND_KEY]: '{"effects":true}' })),
      { music: false, effects: true },
    );
  });

  it('keep working when storage throws', () => {
    const broken: SoundStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('quota');
      },
    };
    assert.deepEqual(loadSound(broken), DEFAULT_SOUND);
    assert.doesNotThrow(() =>
      writeSound({ music: true, effects: true }, broken),
    );
  });
});
