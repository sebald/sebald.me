import { expect, test } from '@playwright/test';

import { cursorRoom, escapes } from './layout';

/**
 * A menu's items built from parts (`PickerItemDetail`, `PickerItemValue`,
 * `PickerItemMark`), as a player and a screen reader get them: each part
 * read as its own word, a disabled item dimmed with its parts, the cursor
 * on the name's line, and nothing cut off at any of the shots. No
 * screenshots, so it runs on any system
 */
const story = (id: string, scale: number, layout: string) =>
  `/iframe.html?id=components-picker--${id}&viewMode=story&globals=scale:${scale};layout:${layout}`;

const SHOTS = [
  {
    name: '3x',
    scale: 3,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
  {
    name: '1x',
    scale: 1,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
  {
    name: 'tall',
    scale: 402 / 320,
    layout: 'tall',
    viewport: { width: 402, height: 714 },
  },
];

test('each part is read as a word of its own', async ({ page }) => {
  await page.goto(story('shop-wares', 3, 'wide'));
  const menu = page.getByRole('list', { name: 'Wares · 30g' });
  await expect(menu.getByRole('button', { name: 'Tonic 25g' })).toBeVisible();
  await expect(
    menu.getByRole('button', { name: 'Lantern New 12g' }),
  ).toBeVisible();
  await expect(
    menu.getByRole('button', { name: 'Rope 45g 15g short' }),
  ).toBeDisabled();
});

test('a disabled item dims its parts with its name', async ({ page }) => {
  await page.goto(story('shop-wares', 3, 'wide'));
  const label = page
    .locator('[data-slot=picker-item][data-id=rope] [data-cursor-target]')
    .first();
  // The parts sit in the dimmed label, not beside it
  await expect(label.locator('[data-slot=picker-item-value]')).toHaveText(
    '45g',
  );
  await expect(label.locator('[data-slot=picker-item-detail]')).toHaveText(
    '15g short',
  );
  const opacity = await label.evaluate(el => getComputedStyle(el).opacity);
  expect(Number(opacity)).toBeLessThan(1);
});

test('the cursor points at the name, not between its lines', async ({
  page,
}) => {
  await page.goto(story('quest-log', 3, 'wide'));
  const item = page.locator('[data-slot=picker-item][data-id=ferry]');
  await expect(item.locator('[data-slot=picker-item-detail]')).toHaveCount(2);
  const { cursor, name } = await item.evaluate(li => {
    const box = (el: Element | Range) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom };
    };
    const target = li.querySelector('[data-cursor-target]')!;
    const range = document.createRange();
    range.selectNodeContents(target.firstChild!);
    return {
      cursor: box(li.querySelector('[data-slot=cursor]')!),
      name: box(range),
    };
  });
  const middle = (b: { top: number; bottom: number }) => (b.top + b.bottom) / 2;
  expect(Math.abs(middle(cursor) - middle(name))).toBeLessThan(2);
});

for (const shot of SHOTS)
  for (const id of ['quest-log', 'save-slots', 'shop-wares'])
    test(`${id} has its room at ${shot.name}`, async ({ page }) => {
      await page.setViewportSize(shot.viewport);
      await page.goto(story(id, shot.scale, shot.layout));
      await page.locator('[data-slot=picker]').waitFor();
      await page.evaluate(() => document.fonts.ready);
      expect(await escapes(page)).toEqual([]);
      expect(await cursorRoom(page)).toEqual([]);
    });
