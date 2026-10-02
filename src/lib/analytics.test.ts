import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createVisibleClock, isOutboundUrl } from './analytics';

const ORIGIN = 'https://sebald.me';

describe('isOutboundUrl', () => {
  it('detects links to other sites', () => {
    assert.equal(
      isOutboundUrl(new URL('https://github.com/sebald'), ORIGIN),
      true,
    );
    assert.equal(isOutboundUrl(new URL('http://example.com'), ORIGIN), true);
  });

  it('ignores links on the same site', () => {
    assert.equal(
      isOutboundUrl(new URL('https://sebald.me/notes'), ORIGIN),
      false,
    );
    assert.equal(
      isOutboundUrl(new URL('https://sebald.me/rss.xml'), ORIGIN),
      false,
    );
  });

  it('treats subdomains as outbound', () => {
    assert.equal(isOutboundUrl(new URL('https://www.sebald.me'), ORIGIN), true);
  });

  it('ignores non-web links', () => {
    assert.equal(
      isOutboundUrl(new URL('mailto:me@example.com'), ORIGIN),
      false,
    );
    assert.equal(isOutboundUrl(new URL('tel:+49123'), ORIGIN), false);
  });
});

describe('createVisibleClock', () => {
  it('counts time while visible', () => {
    const clock = createVisibleClock(0, true);
    assert.equal(clock.elapsed(1000), 1000);
  });

  it('pauses while hidden', () => {
    const clock = createVisibleClock(0, true);
    clock.setVisible(false, 1000);
    assert.equal(clock.elapsed(5000), 1000);
    clock.setVisible(true, 5000);
    assert.equal(clock.elapsed(6000), 2000);
  });

  it('starts paused when the page is hidden', () => {
    const clock = createVisibleClock(0, false);
    assert.equal(clock.elapsed(1000), 0);
    clock.setVisible(true, 1000);
    assert.equal(clock.elapsed(1500), 500);
  });

  it('ignores repeated visibility changes', () => {
    const clock = createVisibleClock(0, true);
    clock.setVisible(true, 500);
    clock.setVisible(false, 1000);
    clock.setVisible(false, 2000);
    assert.equal(clock.elapsed(3000), 1000);
  });
});
