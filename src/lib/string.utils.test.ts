import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { readingTime } from './string.utils';

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
