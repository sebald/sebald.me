import assert from 'node:assert/strict';
import test from 'node:test';

import { mergeClassName } from './styles.utils';

test('mergeClassName', async t => {
  t.test('should return base classes without a className', () => {
    assert.equal(mergeClassName('p-4 text-sm'), 'p-4 text-sm');
  });

  t.test('should append the className', () => {
    assert.equal(mergeClassName('p-4', 'mt-2'), 'p-4 mt-2');
  });

  t.test('should let the className win conflicts', () => {
    assert.equal(mergeClassName('p-4 text-sm', 'p-2'), 'text-sm p-2');
  });

  t.test('should resolve the function form with the state', () => {
    const merged = mergeClassName<{ open: boolean }>('p-4', state =>
      state.open ? 'p-2' : undefined,
    );

    assert.equal(typeof merged, 'function');
    if (typeof merged !== 'function') return;
    assert.equal(merged({ open: true }), 'p-2');
    assert.equal(merged({ open: false }), 'p-4');
  });
});
