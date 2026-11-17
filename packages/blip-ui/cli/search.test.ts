import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  closestPage,
  distance,
  oneLine,
  queryTerms,
  search,
  stem,
} from './search.ts';

const page = (
  id: string,
  title: string,
  summary: string,
  text = summary,
  headings: string[] = [],
) => ({ id, kind: 'component', title, summary, headings, text });

const PAGES = [
  page(
    'confirm',
    'Confirm',
    "Asks before something that can't be undone: erasing a save.",
  ),
  page(
    'dialog',
    'Dialog',
    'A window over the stage, for what interrupts a screen.',
    'A window over the stage. Use role alertdialog, or Confirm, before something is deleted.',
    ['Usage'],
  ),
  page('button', 'Button', 'A pixel button, for the actions a screen offers.'),
  page('picker', 'Picker', 'A list of choices a player moves through.'),
];

const EXPORTS = [
  { name: 'Confirm', page: 'confirm', kind: 'component' },
  { name: 'Dialog', page: 'dialog', kind: 'component' },
  { name: 'PickerItem', page: 'picker', kind: 'component' },
  { name: 'ConfirmProps', page: 'confirm', kind: 'type' },
  { name: 'cn', page: null, kind: 'function' },
];

describe('stem and queryTerms', () => {
  it('meets delete, deleting and deleted at one word', () => {
    assert.equal(stem('deleting'), stem('delete'));
    assert.equal(stem('deleted'), stem('deletes'));
  });

  it('drops words that say nothing, unless nothing else is left', () => {
    assert.deepEqual(queryTerms('confirm before deleting'), [
      'confirm',
      'delet',
    ]);
    assert.deepEqual(queryTerms('how to'), ['how', 'to']);
  });
});

describe('search', () => {
  it('puts the page whose title matches first', () => {
    const hits = search('confirm before deleting', PAGES, EXPORTS);
    assert.equal(hits[0]!.id, 'confirm');
    assert.equal(hits[0]!.command, 'blip docs confirm');
  });

  it('finds a page by what its text says', () => {
    assert.equal(search('interrupts', PAGES, EXPORTS)[0]!.id, 'dialog');
  });

  it('finds an export by a word of its name, leaving out types and a repeated title', () => {
    const hits = search('item', PAGES, EXPORTS);
    assert.deepEqual(
      hits.map(hit => [hit.type, hit.id]),
      [['export', 'PickerItem']],
    );
    assert.ok(
      !search('confirm', PAGES, EXPORTS).some(hit => hit.type === 'export'),
    );
  });

  it('returns nothing when nothing matches', () => {
    assert.deepEqual(search('zzzz qqqq', PAGES, EXPORTS), []);
    assert.deepEqual(search('   ', PAGES, EXPORTS), []);
  });

  it('keeps to the limit', () => {
    assert.equal(search('screen', PAGES, EXPORTS, 1).length, 1);
  });
});

describe('closestPage', () => {
  it('measures edit distance', () => {
    assert.equal(distance('dialog', 'dialogue'), 2);
    assert.equal(distance('', 'abc'), 3);
  });

  it('names the page nearest to a misspelling or a part of a name', () => {
    assert.equal(closestPage('dialgo', PAGES, EXPORTS), 'dialog');
    assert.equal(closestPage('picker-item', PAGES, EXPORTS), 'picker');
    assert.equal(closestPage('conf', PAGES, EXPORTS), 'confirm');
  });
});

describe('oneLine', () => {
  it('cuts at the first sentence and at the limit', () => {
    assert.equal(oneLine('First one. Second one.'), 'First one.');
    assert.equal(oneLine('a'.repeat(200), 10), `${'a'.repeat(9)}…`);
  });
});
