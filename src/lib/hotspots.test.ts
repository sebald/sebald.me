import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hotspotAt, pngSize, toHotspots } from './hotspots';

describe('toHotspots', () => {
  it('converts native pixels to percent', () => {
    const [spot] = toHotspots(
      [{ name: 'lantern', remark: 'Lit.', at: [100, 25, 50, 10] }],
      { width: 200, height: 50 },
    );
    assert.deepEqual(spot, {
      name: 'lantern',
      remark: 'Lit.',
      left: 50,
      top: 50,
      width: 25,
      height: 20,
    });
  });
});

describe('pngSize', () => {
  it('reads width and height from the header', () => {
    const header = new Uint8Array(24);
    const view = new DataView(header.buffer);
    view.setUint32(16, 1374);
    view.setUint32(20, 549);
    assert.deepEqual(pngSize(header), { width: 1374, height: 549 });
  });
});

describe('hotspotAt', () => {
  const spots = toHotspots(
    [
      { name: 'mug', remark: '', at: [10, 10, 10, 10] },
      { name: 'table', remark: '', at: [0, 0, 100, 25] },
    ],
    { width: 100, height: 50 },
  );

  it('prefers the spot listed first', () => {
    assert.equal(hotspotAt(spots, 15, 30)?.name, 'mug');
  });

  it('falls back to the larger spot around it', () => {
    assert.equal(hotspotAt(spots, 50, 40)?.name, 'table');
  });

  it('finds nothing outside every spot', () => {
    assert.equal(hotspotAt(spots, 50, 90), undefined);
  });
});
