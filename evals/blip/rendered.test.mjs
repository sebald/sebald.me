import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { count, launch, renderPages, subtract } from './lib/rendered.mjs';

const DIST = join(fileURLToPath(import.meta.url), '../fixtures/rendered');

const page = (id, viewport, extra = {}) => ({
  id,
  url: `?screen=${id}`,
  viewport,
  rendered: true,
  reason: null,
  escapes: [],
  cut: [],
  axe: [],
  screenshot: `${id}@${viewport}.png`,
  ...extra,
});

describe('what the template shows is not the agent’s', () => {
  it('takes off faults and axe nodes the template has too, whatever their distance', () => {
    const mine = [
      page('camp', 'wide', {
        escapes: ['div.a by 9px', 'div.b by 3px'],
        cut: ['"Rest" cut by div. by 4px'],
        axe: [
          { id: 'color-contrast', impact: 'serious', nodes: 3 },
          { id: 'image-alt', impact: 'critical', nodes: 1 },
        ],
      }),
    ];
    const template = [
      page('camp', 'wide', {
        escapes: ['div.a by 2px'],
        cut: ['"Rest" cut by div. by 1px'],
        axe: [{ id: 'color-contrast', impact: 'serious', nodes: 3 }],
      }),
    ];
    const [out] = subtract(mine, template);
    assert.deepEqual(out.escapes, ['div.b by 3px']);
    assert.deepEqual(out.cut, []);
    assert.deepEqual(
      out.axe.map(v => v.id),
      ['image-alt'],
    );
    assert.deepEqual(out.subtracted, { escapes: 1, cut: 1, axe: 1 });
  });

  it('subtracts nothing from a page that did not render', () => {
    const mine = [page('camp', 'wide', { rendered: false, reason: 'x' })];
    const template = [page('camp', 'wide', { escapes: ['div by 5px'] })];
    assert.deepEqual(subtract(mine, template), mine);
  });

  it('counts per viewport', () => {
    const totals = count([
      page('a', 'wide', { cut: ['x'] }),
      page('a', 'phone', { rendered: false }),
    ]);
    assert.equal(totals.wide.cut, 1);
    assert.equal(totals.phone.rendered, 0);
    assert.equal(totals.phone.pages, 1);
  });
});

// These open the installed Chrome (as the game's tests do); without one they are skipped
let browser = null;
let out = null;
before(async () => {
  try {
    browser = await launch();
  } catch {
    browser = null;
  }
  out = mkdtempSync(join(tmpdir(), 'blip-rendered-'));
});
after(async () => {
  await browser?.close();
  if (out) rmSync(out, { recursive: true, force: true });
});

describe('the rendered pass', () => {
  const urls = ['ok', 'cut', 'escape', 'axe', 'crash', 'missing', 'blank'].map(
    id => ({ id, url: `?screen=${id}` }),
  );

  it('records faults, failures and a picture for every URL, and goes on', async t => {
    if (!browser) return t.skip('no Chrome to open');
    const pages = await renderPages({ dist: DIST, urls, outDir: out, browser });
    const at = (id, viewport = 'wide') =>
      pages.find(p => p.id === id && p.viewport === viewport);
    assert.equal(pages.length, urls.length * 2);

    assert.equal(at('ok').rendered, true);
    assert.deepEqual(
      [at('ok').escapes, at('ok').cut, at('ok').axe],
      [[], [], []],
    );

    assert.equal(at('cut').cut.length, 1);
    assert.match(at('cut').cut[0], /^"Buy the Iron Sword for 150 gol/);
    assert.deepEqual(at('cut').escapes, []);

    assert.equal(at('escape').escapes.length, 1);
    assert.match(at('escape').escapes[0], /^p\.\w* by \d+px$/);

    assert.deepEqual(
      at('axe').axe.map(v => v.id),
      ['image-alt'],
    );

    for (const id of ['crash', 'missing', 'blank']) {
      assert.equal(at(id).rendered, false, id);
      assert.ok(at(id).reason, id);
    }
    assert.match(at('crash').reason, /the screen threw/);
    assert.equal(at('missing').reason, 'the screen is not registered');

    // Every picture exists, rendered or not
    for (const p of pages)
      assert.ok(existsSync(join(out, p.screenshot)), p.screenshot);
  });

  it('gives the same result twice', async t => {
    if (!browser) return t.skip('no Chrome to open');
    const run = () =>
      renderPages({
        dist: DIST,
        urls: urls.filter(u => ['ok', 'cut', 'crash'].includes(u.id)),
        outDir: join(out, 'again'),
        browser,
      });
    assert.deepEqual(await run(), await run());
  });
});
