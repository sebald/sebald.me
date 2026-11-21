import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { Readout, type ReadoutProps } from './readout';
import { announcement } from './readout.announce';

describe('a readout’s announcement', () => {
  it('says nothing on the first render', () => {
    assert.equal(
      announcement({ previous: undefined, value: 120, label: 'Gold' }),
      null,
    );
  });

  it('says nothing when the value stayed the same', () => {
    assert.equal(
      announcement({ previous: 120, value: 120, label: 'Gold' }),
      null,
    );
  });

  it('says a change with its label', () => {
    assert.equal(
      announcement({ previous: 120, value: 1500, label: 'Gold' }),
      'Gold 1,500',
    );
  });

  it('says a change out of a maximum', () => {
    assert.equal(
      announcement({ previous: 42, value: 34, max: 50, label: ' HP ' }),
      'HP 34 of 50',
    );
  });
});

const render = (props: ReadoutProps) =>
  renderToStaticMarkup(createElement(Readout, props));

describe('a readout’s markup', () => {
  it('is plain text without a max', () => {
    const html = render({ value: 1200, children: 'Gold' });
    assert.match(html, /data-slot="readout"/);
    assert.doesNotMatch(html, /role="meter"/);
    assert.match(html, /Gold/);
    assert.match(html, /1,200/);
  });

  it('is a meter with a max, read as value of max', () => {
    const html = render({ value: 42, max: 50, children: 'HP' });
    assert.match(html, /role="meter"/);
    assert.match(html, /data-slot="readout"/);
    assert.match(html, /aria-valuenow="42"/);
    assert.match(html, /aria-valuemax="50"/);
    assert.match(html, /aria-valuetext="42 of 50"/);
    assert.match(html, /42\/50/);
  });
});
