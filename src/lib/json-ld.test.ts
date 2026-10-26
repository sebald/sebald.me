import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { articleJsonLd, serializeJsonLd } from './json-ld';

describe('serializeJsonLd', () => {
  it('escapes "<" so a value cannot close the script tag', () => {
    const json = serializeJsonLd({ headline: '</script><script>' });
    assert.equal(json.includes('<'), false);
    assert.deepEqual(JSON.parse(json), { headline: '</script><script>' });
  });
});

describe('articleJsonLd', () => {
  const note = {
    title: 'Where the Map Ends',
    description: 'A modern frontend had been hiding underneath.',
    url: '/notes/where-the-map-ends',
    image: '/og/where-the-map-ends.webp',
    date: new Date('2026-05-17'),
  };

  it('resolves the url and image against the site', () => {
    const data = articleJsonLd(note, 'https://sebald.me');
    assert.equal(data.url, 'https://sebald.me/notes/where-the-map-ends');
    assert.equal(data.image, 'https://sebald.me/og/where-the-map-ends.webp');
  });

  it('formats the date as YYYY-MM-DD', () => {
    assert.equal(
      articleJsonLd(note, 'https://sebald.me').datePublished,
      '2026-05-17',
    );
  });

  it('leaves the date out when the note has none', () => {
    const data = articleJsonLd(
      { ...note, date: undefined },
      'https://sebald.me',
    );
    assert.equal(data.datePublished, undefined);
  });
});
