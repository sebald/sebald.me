import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isVisible, shouldShowDrafts } from './draft.utils';

describe('shouldShowDrafts', () => {
  it('shows drafts on the dev server', () => {
    assert.equal(shouldShowDrafts({ NODE_ENV: 'development' }), true);
  });

  it('shows drafts on preview deployments', () => {
    assert.equal(
      shouldShowDrafts({ NODE_ENV: 'production', VERCEL_ENV: 'preview' }),
      true,
    );
  });

  it('hides drafts in production', () => {
    assert.equal(
      shouldShowDrafts({ NODE_ENV: 'production', VERCEL_ENV: 'production' }),
      false,
    );
  });

  it('hides drafts in local production builds', () => {
    assert.equal(shouldShowDrafts({ NODE_ENV: 'production' }), false);
  });
});

describe('isVisible', () => {
  it('always shows published entries', () => {
    assert.equal(isVisible({ draft: false }, false), true);
    assert.equal(isVisible({}, false), true);
  });

  it('shows drafts only when allowed', () => {
    assert.equal(isVisible({ draft: true }, false), false);
    assert.equal(isVisible({ draft: true }, true), true);
  });
});
