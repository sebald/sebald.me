import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { missingPackages } from './missing';

const BLIP = '@sebald/blip-ui';
const PUSHBACK = '@sebald/pushback';

const naming = (...names: string[]) => ({
  releases: names.map(name => ({ name })),
});

describe('missingPackages', () => {
  it('nothing changed, nothing missing', () => {
    assert.deepEqual(missingPackages([], []), []);
    assert.deepEqual(missingPackages([], [naming(BLIP)]), []);
  });

  it('a changed package without any changeset is missing', () => {
    assert.deepEqual(missingPackages([BLIP, PUSHBACK], []), [BLIP, PUSHBACK]);
  });

  it('each changed package needs a changeset that names it', () => {
    assert.deepEqual(missingPackages([BLIP, PUSHBACK], [naming(BLIP)]), [
      PUSHBACK,
    ]);
    assert.deepEqual(
      missingPackages([BLIP, PUSHBACK], [naming(BLIP), naming(PUSHBACK)]),
      [],
    );
    assert.deepEqual(
      missingPackages([BLIP, PUSHBACK], [naming(BLIP, PUSHBACK)]),
      [],
    );
  });

  it('only empty changesets: nothing is released, nothing missing', () => {
    assert.deepEqual(missingPackages([BLIP, PUSHBACK], [naming()]), []);
  });

  it('an empty changeset next to a named one does not cover the rest', () => {
    assert.deepEqual(
      missingPackages([BLIP, PUSHBACK], [naming(), naming(BLIP)]),
      [PUSHBACK],
    );
  });

  it('a changeset for an unchanged package is fine', () => {
    assert.deepEqual(missingPackages([BLIP], [naming(BLIP, PUSHBACK)]), []);
  });
});
