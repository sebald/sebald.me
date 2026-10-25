import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatDuration, readingTime } from './string.utils';

const words = (count: number) => Array(count).fill('word').join(' ');

describe('readingTime', () => {
  it('takes at least a minute', () => {
    assert.equal(readingTime(''), 1);
    assert.equal(readingTime('Hello there.'), 1);
  });

  it('rounds up to the next minute', () => {
    assert.equal(readingTime(words(230)), 1);
    assert.equal(readingTime(words(231)), 2);
  });

  it('ignores code blocks', () => {
    assert.equal(
      readingTime(`${words(200)}\n\`\`\`ts\n${words(100)}\n\`\`\``),
      1,
    );
  });

  it('ignores punctuation', () => {
    assert.equal(readingTime(`— — — ${words(230)}`), 1);
  });
});

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    assert.equal(formatDuration(0), '0:00');
    assert.equal(formatDuration(448.6), '7:28');
    assert.equal(formatDuration(1027), '17:07');
  });

  it('adds hours from one hour up', () => {
    assert.equal(formatDuration(3600), '1:00:00');
    assert.equal(formatDuration(3725), '1:02:05');
  });

  it('treats invalid values as zero', () => {
    assert.equal(formatDuration(-5), '0:00');
    assert.equal(formatDuration(Number.NaN), '0:00');
  });
});
