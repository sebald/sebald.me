import { type Page, expect, test } from '@playwright/test';

import { cursorRoom, escapes } from './layout';

/**
 * A `Screen variant="split"` (`buy-and-sell`), as a player and a screen
 * reader get it: two windows side by side on the wide stage and stacked
 * upright, read in the order they are seen, each list scrolling on its
 * own, nothing cut off at the smallest scale a game shows. No
 * screenshots, so it runs on any system
 */
const story = (scale: number, layout: string) =>
  `/iframe.html?id=components-screen--buy-and-sell&viewMode=story&globals=scale:${scale};layout:${layout}`;

const boxes = (page: Page) =>
  page.locator('[data-slot=window]').evaluateAll(windows =>
    windows.map(el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
    }),
  );

const open = async (page: Page, scale: number, layout: string) => {
  await page.goto(story(scale, layout));
  await page.locator('[data-slot=screen]').waitFor();
  await page.evaluate(() => document.fonts.ready);
};

test('side by side on the wide stage', async ({ page }) => {
  // `MIN_SCALE`, the smallest wide stage a game shows
  await open(page, 2.25, 'wide');
  const [buy, sell] = await boxes(page);
  expect(buy!.top).toBe(sell!.top);
  expect(buy!.bottom).toBe(sell!.bottom);
  expect(sell!.left).toBeGreaterThan(buy!.right);
  expect(await escapes(page)).toEqual([]);
  expect(await cursorRoom(page)).toEqual([]);
});

test('one above the other upright', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 714 });
  await open(page, 402 / 320, 'tall');
  const [buy, sell] = await boxes(page);
  expect(buy!.left).toBe(sell!.left);
  expect(sell!.top).toBeGreaterThan(buy!.bottom);
  expect(await cursorRoom(page)).toEqual([]);
});

test('read in the order they are seen', async ({ page }) => {
  await open(page, 3, 'wide');
  // Buy first, left or above; Sell after it
  const names = await page.getByRole('list').evaluateAll(lists =>
    lists
      .map(list => list.getAttribute('aria-labelledby'))
      .filter(Boolean)
      .map(id => document.getElementById(id!)?.textContent),
  );
  expect(names).toEqual(['Buy', 'Sell']);
});

test('each list scrolls on its own', async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 714 });
  await open(page, 402 / 320, 'tall');
  const [buy, sell] = [
    page.getByRole('list', { name: 'Buy' }),
    page.getByRole('list', { name: 'Sell' }),
  ];
  await buy.evaluate(el => (el.scrollTop = el.scrollHeight));
  expect(await buy.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
  expect(await sell.evaluate(el => el.scrollTop)).toBe(0);
});
