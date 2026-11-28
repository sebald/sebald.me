import { expect, test } from '@playwright/test';

import { cursorRoom, escapes } from './layout';

/**
 * The guide's example, a menu window and a form window on one screen:
 * upright the form keeps its height and the menu takes the cut by
 * scrolling, so nothing of the form spills out of its window. No
 * screenshots, so it runs on any system
 */
const story = (scale: number, layout: string) =>
  `/iframe.html?id=guides-menus-and-forms--menu-and-form&viewMode=story&globals=scale:${scale};layout:${layout}`;

test('upright, the form keeps its height and the menu scrolls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 402, height: 714 });
  await page.goto(story(402 / 320, 'tall'));
  await page.locator('[data-slot=form]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const { form, menu } = await page.evaluate(() => {
    const body = (el: Element) => {
      const b = el.closest('[data-slot=window]')!.lastElementChild!;
      return { scroll: b.scrollHeight, client: b.clientHeight };
    };
    const list = document.querySelector('[data-slot=picker] ul')!;
    return {
      form: body(document.querySelector('[data-slot=form]')!),
      menu: { scroll: list.scrollHeight, client: list.clientHeight },
    };
  });
  // Nothing of the form outside its window: its Legend in the frame
  expect(form.scroll).toBeLessThanOrEqual(form.client);
  // The menu is the one that is cut, and scrolls
  expect(menu.scroll).toBeGreaterThan(menu.client);
  expect(await cursorRoom(page)).toEqual([]);
});

test('side by side at the smallest scale a game shows', async ({ page }) => {
  await page.setViewportSize({ width: 960, height: 600 });
  await page.goto(story(2.25, 'wide'));
  await page.locator('[data-slot=form]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  expect(await escapes(page)).toEqual([]);
  expect(await cursorRoom(page)).toEqual([]);
});
