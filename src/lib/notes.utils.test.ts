import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { neighbours } from './notes.utils';

const notes = [{ url: '/c' }, { url: '/b' }, { url: '/a' }];

describe('neighbours', () => {
  it('returns the newer and older note', () => {
    assert.deepEqual(neighbours(notes, '/b'), {
      newer: { url: '/c' },
      older: { url: '/a' },
    });
  });

  it('has no newer note for the newest one', () => {
    assert.deepEqual(neighbours(notes, '/c'), {
      newer: undefined,
      older: { url: '/b' },
    });
  });

  it('has no older note for the oldest one', () => {
    assert.deepEqual(neighbours(notes, '/a'), {
      newer: { url: '/b' },
      older: undefined,
    });
  });

  it('returns nothing for an unknown note', () => {
    assert.deepEqual(neighbours(notes, '/x'), {
      newer: undefined,
      older: undefined,
    });
  });
});
