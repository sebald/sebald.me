import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  BACKING,
  MIN_SCALE,
  backingFor,
  crisp,
  crispScale,
  fitFor,
  fontSizeFor,
  scaleFor,
  tallFor,
} from './scale';

describe('scaleFor', () => {
  it('is 3x wherever the stage fits at 960 by 642', () => {
    assert.equal(scaleFor(960, 642), 3);
    assert.equal(scaleFor(1920, 1080), 3);
    assert.equal(scaleFor(2560, 1440), 3);
  });

  it('shrinks with the narrower side below that', () => {
    assert.equal(scaleFor(640, 600), 2);
    assert.equal(scaleFor(960, 428), 2);
    assert.equal(scaleFor(360, 800), 1.125);
    assert.ok(scaleFor(300, 800) < MIN_SCALE);
  });

  it('takes a larger cap for the workbench', () => {
    assert.equal(scaleFor(1920, 1080, 4), 4);
  });

  it('crops the ceiling of a short window before shrinking', () => {
    assert.deepEqual(fitFor(1200, 700), { scale: 3, crop: 0 });
    // 642 tall at 3x, 600 of room: 14 rows go
    assert.deepEqual(fitFor(1200, 600), { scale: 3, crop: 14 });
    // Past 60 rows the stage shrinks to fit 154 rows
    const short = fitFor(1200, 400);
    assert.equal(short.crop, 60);
    assert.ok(Math.abs(short.scale - 400 / 154) < 1e-9);
  });

  it('fills an upright window: the width sets the scale, the height the rows', () => {
    // iPhone 17 in Safari: 402 by 714, no whole thirds above the minimum
    const phone = tallFor(402, 714, 3, 3);
    assert.ok(Math.abs(phone.scale - 402 / 320) < 1e-9);
    assert.equal(phone.rows, Math.floor(714 / (402 / 320)));
    // 17 Pro Max: 440 wide snaps to 4/3
    assert.equal(tallFor(440, 796, 3, 3).scale, 4 / 3);
    assert.equal(tallFor(440, 796, 3, 3).rows, 597);
    // Never above the maximum, never fewer rows than the stage
    assert.equal(tallFor(1200, 1600).scale, 3);
    assert.equal(tallFor(400, 200).rows, 214);
  });

  it('keeps tall text at 17 px or more', () => {
    assert.equal(fontSizeFor(1.25), 14);
    assert.equal(fontSizeFor(1.25, true), 17);
    assert.equal(fontSizeFor(3, true), 17);
  });

  it('never goes above the maximum', () => {
    assert.equal(scaleFor(10_000, 10_000, 5), 5);
  });

  it('snaps to the device pixels on a dense screen, not on a 1x one', () => {
    assert.equal(crispScale(2.9, 2), 2.5);
    assert.equal(crispScale(2.9, 3), 2 + 2 / 3);
    assert.equal(crispScale(2.9, 1), 2.9);
    assert.equal(crispScale(3, 2), 3);
    // Never under the minimum: the fraction stays
    assert.equal(crispScale(2.4, 2), 2.4);
    assert.equal(crispScale(2.6, 2), 2.5);
    assert.deepEqual(fitFor(900, 1000, 3, 2), { scale: 2.5, crop: 0 });
    const short = fitFor(1200, 400, 3, 2);
    assert.equal(short.scale, 2.5);
    assert.equal(short.crop, 60);
  });

  it('draws the canvas at the device pixels when they are whole', () => {
    assert.equal(crisp(2.5, 2), true);
    assert.equal(crisp(2.5, 1), false);
    assert.equal(backingFor(2.5, 2), 5);
    assert.equal(backingFor(3, 3), 9);
    assert.equal(backingFor(2, 1), 2);
    assert.equal(backingFor(2.7, 1), BACKING);
    // An iPhone held upright: drawn at 4 and shown at 3.77, never enlarged
    assert.equal(backingFor(402 / 320, 3), 4);
    assert.equal(backingFor(1.172, 2), BACKING);
  });
});

describe('fontSizeFor', () => {
  it('is 16 px at 3x with a 14 px floor', () => {
    assert.equal(fontSizeFor(1), 14);
    assert.equal(fontSizeFor(3), 16);
    assert.equal(fontSizeFor(4.5), 24);
  });
});

describe('native size', () => {
  it('takes the stage size as a parameter', () => {
    const native = { width: 160, height: 100 };
    assert.equal(scaleFor(480, 300, 3, native), 3);
    assert.equal(scaleFor(240, 300, 3, native), 1.5);
    assert.deepEqual(tallFor(480, 700, 3, 1, native), { scale: 3, rows: 233 });
    assert.equal(tallFor(480, 100, 3, 1, native).rows, 100);
    assert.deepEqual(fitFor(480, 270, 3, 1, native), { scale: 3, crop: 10 });
  });
});
