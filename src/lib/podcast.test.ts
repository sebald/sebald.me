import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { duration, podcastFeed } from './podcast';

const show = {
  title: 'Sebastian Sebald, read aloud',
  description: 'Notes & more',
  author: 'Sebastian Sebald',
  email: 'me@example.com',
  image: '/audio.png',
};

const episode = {
  title: 'Where the Map Ends',
  description: 'A <modern> frontend had been hiding underneath.',
  url: '/notes/where-the-map-ends',
  audio: '/audio/where-the-map-ends.mp3',
  bytes: 9_089_191,
  date: new Date('2026-05-17'),
};

describe('duration', () => {
  it('derives the length from the size at 96 kbit/s', () => {
    // ffprobe reports 757.35s for this file
    assert.equal(duration(9_089_191), 757);
  });
});

describe('podcastFeed', () => {
  const xml = podcastFeed(show, [episode], 'https://sebald.me');

  it('links the audio as an absolute enclosure with its size', () => {
    assert.match(
      xml,
      /<enclosure url="https:\/\/sebald\.me\/audio\/where-the-map-ends\.mp3" length="9089191" type="audio\/mpeg"\/>/,
    );
  });

  it('resolves the cover and the self link against the site', () => {
    assert.match(
      xml,
      /<itunes:image href="https:\/\/sebald\.me\/audio\.png"\/>/,
    );
    assert.match(xml, /href="https:\/\/sebald\.me\/audio\.xml" rel="self"/);
  });

  it('escapes text', () => {
    assert.match(xml, /Notes &amp; more/);
    assert.match(xml, /A &lt;modern&gt; frontend/);
  });

  it('points the episode back to the note', () => {
    assert.match(
      xml,
      /Read the note: https:\/\/sebald\.me\/notes\/where-the-map-ends/,
    );
    assert.match(xml, /<pubDate>Sun, 17 May 2026 00:00:00 GMT<\/pubDate>/);
  });
});
