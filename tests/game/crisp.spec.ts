import type { Page } from '@playwright/test';

import { expect, open, press, screen, test, toRoster } from './game';

/**
 * The stage starts on a whole device pixel at the ratios where it would
 * not by itself: 1.25 and 1.5 (Windows' scaling, where the scroll lands
 * between device pixels) and the phone's 2.625 (the tall stage's
 * centring). Otherwise every edge of the art falls between two device
 * pixels and the game goes soft.
 */

/** How far the stage's corner is from a whole device pixel, the worse axis */
const offGrid = (page: Page) =>
  screen(page).evaluate(stage => {
    const { left, top } = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio;
    const off = (v: number) => Math.abs(v * dpr - Math.round(v * dpr));
    return Math.max(off(left), off(top));
  });

const onGrid = (page: Page) =>
  expect.poll(() => offGrid(page)).toBeLessThan(0.02);

const holds = () => {
  test('on the title, in a duel and scrolled', async ({ page }) => {
    await open(page);
    await onGrid(page);
    await toRoster(page);
    await onGrid(page);
    // The duel scrolls the stage's bottom into view
    await press(page, 'Enter');
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    await onGrid(page);
    // A scroll of whole CSS pixels that are not whole device pixels
    await page.evaluate(() => window.scrollBy(0, -37));
    await onGrid(page);
  });
};

for (const ratio of [1.25, 1.5]) {
  test.describe(`at ${ratio}x`, () => {
    test.skip(({ isMobile }) => isMobile, 'a desktop ratio');
    test.use({ deviceScaleFactor: ratio });
    holds();
  });
}

test.describe('on the tall stage at 2.625x', () => {
  test.skip(({ isMobile }) => !isMobile, 'a phone held upright');
  holds();
});
