import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isOutboundUrl } from './analytics';

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
