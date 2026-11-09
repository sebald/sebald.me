import type { Page } from '@playwright/test';

import { expect, open, opponents, screen, settle, test } from './game';

test.describe('on a phone, by touch', () => {
  test.skip(({ isMobile }) => !isMobile, 'a phone held upright');

  const tap = (page: Page, name: string | RegExp) =>
    screen(page)
      .getByRole('button', { name, exact: typeof name === 'string' })
      .first()
      .tap();

  test('from the title to a duel and back, all by taps', async ({ page }) => {
    await open(page);
    await expect(screen(page).getByText('Tap to play')).toBeVisible();
    await screen(page).tap();
    await expect(screen(page).getByText('Tap a line')).toBeVisible();
    await tap(page, 'Start');
    await expect(screen(page)).toHaveAccessibleName('Pushback, pick a role');
    // A tap picks a face, a second one on it plays
    await tap(page, 'PM, Jo');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await opponents(page).first().tap();
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    // A tap anywhere on the stage goes on with the duel
    const line = await screen(page).locator('p').first().textContent();
    await screen(page).tap();
    await settle(page, 700);
    await expect(screen(page).locator('p').first()).not.toHaveText(line!);
  });

  test('the corner Back leaves the roster', async ({ page }) => {
    await open(page);
    await screen(page).tap();
    await tap(page, 'Start');
    await tap(page, 'PM, Jo');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await tap(page, /^Back/);
    await expect(screen(page)).toHaveAccessibleName('Pushback, title');
  });
});
