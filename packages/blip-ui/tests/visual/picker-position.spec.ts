import { expect, test } from '@playwright/test';

import { cursorRoom, escapes } from './layout';

/**
 * A Picker's position (`position`), as a player and a screen reader get it:
 * the cursor's place under the list, following the keys, and each row's
 * place read with its name, across groups. No screenshots, so it runs on
 * any system
 */
const story = (id: string, scale = 3, layout = 'wide') =>
  `/iframe.html?id=components-picker--${id}&viewMode=story&globals=scale:${scale};layout:${layout}`;

test('the position follows the cursor and wraps with it', async ({ page }) => {
  await page.goto(story('scrolling-list'));
  const position = page.locator('[data-slot=picker-position]');
  await expect(position).toHaveText('1 of 12');
  await page.keyboard.press('ArrowDown');
  await expect(position).toHaveText('2 of 12');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowUp');
  await expect(position).toHaveText('12 of 12');
  // For the eye: each row says its own place
  await expect(position).toHaveAttribute('aria-hidden', 'true');
});

test('each row is read with its place in the whole list', async ({ page }) => {
  await page.goto(story('scrolling-list'));
  const rows = page
    .getByRole('list', { name: 'Colleagues' })
    .getByRole('listitem');
  await expect(rows.nth(2)).toHaveAttribute('aria-posinset', '3');
  await expect(rows.nth(2)).toHaveAttribute('aria-setsize', '12');
});

test('a group counts on from the rows before it', async ({ page }) => {
  // Back sits in a group of its own: the fourth of four, not the first of one
  await page.goto(story('shop-wares'));
  const back = page.locator('[data-slot=picker-item][data-id=back]');
  await expect(back).toHaveAttribute('aria-posinset', '4');
  await expect(back).toHaveAttribute('aria-setsize', '4');
  // A disabled ware counts too
  await expect(
    page.locator('[data-slot=picker-item][data-id=rope]'),
  ).toHaveAttribute('aria-posinset', '3');
});

for (const shot of [
  {
    name: '3x',
    scale: 3,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
  // The smallest wide stage a game shows (`MIN_SCALE`): under it the
  // stage asks for a bigger window, so the docs' 1x shot leaves it out
  {
    name: 'MIN_SCALE',
    scale: 2.25,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
])
  test(`scrolling-list has its room at ${shot.name}`, async ({ page }) => {
    await page.setViewportSize(shot.viewport);
    await page.goto(story('scrolling-list', shot.scale, shot.layout));
    await expect(page.locator('[data-slot=picker-position]')).toHaveText(
      '1 of 12',
    );
    await page.evaluate(() => document.fonts.ready);
    expect(await escapes(page)).toEqual([]);
    expect(await cursorRoom(page)).toEqual([]);
  });

test('the focus moves with the cursor, by the keys only', async ({ page }) => {
  await page.goto(story('scrolling-list'));
  await expect(page.locator('[data-slot=picker-position]')).toHaveText(
    '1 of 12',
  );
  const focusedRow = () =>
    page.evaluate(
      () =>
        document.activeElement?.closest('[data-slot=picker-item]')
          ?.textContent ?? null,
    );
  // The list's opening takes no focus
  expect(await focusedRow()).toBeNull();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('button', { name: 'Colleague 3' })).toBeFocused();
  // The list scrolls itself, never the page
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  // A pointer moves the cursor, not the focus
  await page.getByRole('button', { name: 'Colleague 1', exact: true }).hover();
  await expect(
    page.getByRole('button', { name: 'Colleague 1', exact: true }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(page.getByRole('button', { name: 'Colleague 3' })).toBeFocused();
});

test('Enter and Space on a focused row pick it once', async ({ page }) => {
  await page.goto('/iframe.html?id=components-dialog--default&viewMode=story');
  // The story opens with the dialog open, the cursor on Music
  const music = page.getByRole('dialog').getByRole('button', { name: /Music/ });
  await expect(music).toContainText('On');
  // Round to Music by the keys: it takes the focus
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(music).toBeFocused();
  // Each key flips it once; picked twice, it would stay as it was
  await page.keyboard.press('Enter');
  await expect(music).toContainText('Off');
  await page.keyboard.press(' ');
  await expect(music).toContainText('On');
});
