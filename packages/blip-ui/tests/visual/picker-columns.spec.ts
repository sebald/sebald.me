import { expect, test } from '@playwright/test';

import { cursorRoom, escapes } from './layout';

/**
 * A Picker in columns (`columns`), as a player and a screen reader get it:
 * every value under its column's name, each read with that name, and
 * nothing cut off at any of the shots. No screenshots, so it runs on any
 * system
 */
const story = (scale: number, layout: string) =>
  `/iframe.html?id=components-picker--shop-columns&viewMode=story&globals=scale:${scale};layout:${layout}`;

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

for (const shot of SHOTS) {
  test(`each value lines up under its column at ${shot.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(shot.viewport);
    await page.goto(story(shot.scale, shot.layout));
    await page.locator('[data-slot=picker]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    const { header, rows } = await page.evaluate(() => {
      const edges = (els: Iterable<Element>) =>
        [...els].map(el => {
          const r = el.getBoundingClientRect();
          return [Math.round(r.left), Math.round(r.right)];
        });
      return {
        header: edges(
          document.querySelectorAll('[data-slot=picker-header] > span'),
        ).slice(1),
        rows: [...document.querySelectorAll('[data-slot=picker-item]')].flatMap(
          li => {
            const values = li.querySelectorAll('[data-slot=picker-item-value]');
            if (!values.length) return [];
            return [
              edges([
                li.querySelector('[data-slot=picker-item-name]')!,
                ...values,
              ]),
            ];
          },
        ),
      };
    });
    expect(rows.length).toBe(4);
    // The name's column, then Price, then Owned: the same cells in every row
    for (const row of rows) expect(row).toEqual(header);
  });

  test(`shop-columns has its room at ${shot.name}`, async ({ page }) => {
    await page.setViewportSize(shot.viewport);
    await page.goto(story(shot.scale, shot.layout));
    await page.locator('[data-slot=picker]').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.locator('p', { hasText: 'Heals a little.' }),
    ).toBeInViewport();
    expect(await escapes(page)).toEqual([]);
    expect(await cursorRoom(page)).toEqual([]);
  });
}

test('each value is read with its column’s name', async ({ page }) => {
  await page.goto(story(3, 'wide'));
  const menu = page.getByRole('list', { name: 'Wares · 30g' });
  await expect(
    menu.getByRole('button', { name: 'Tonic Price 25g Owned 3' }),
  ).toBeVisible();
  await expect(
    menu.getByRole('button', { name: 'Lantern New Price 12g Owned 0' }),
  ).toBeVisible();
  await expect(
    menu.getByRole('button', { name: 'Rope Price 45g Owned 1 15g short' }),
  ).toBeDisabled();
  // The header is for the eye: not an item of the list
  await expect(menu.getByRole('listitem')).toHaveCount(6);
  await expect(menu.locator('[data-slot=picker-header]')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
});

test('a row with no values takes the whole width', async ({ page }) => {
  await page.goto(story(3, 'wide'));
  await page.locator('[data-slot=picker]').waitFor();
  const { name, price } = await page.evaluate(() => ({
    name: document
      .querySelector('[data-id=back] [data-slot=picker-item-name]')!
      .getBoundingClientRect().right,
    // The first value column's names, over Price
    price: document
      .querySelectorAll('[data-slot=picker-header] > span')[2]!
      .getBoundingClientRect().right,
  }));
  // Across the value columns, not squeezed into the name's
  expect(name).toBeGreaterThan(price);
});
