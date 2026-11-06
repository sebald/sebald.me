import type { Page } from '@playwright/test';

import {
  choose,
  expect,
  holdClock,
  open,
  playDuel,
  press,
  settle,
  screen,
  test,
  toMenu,
  toRoster,
} from './game';

/**
 * Each of the game's screens as a picture, for what the flows can't
 * see: a screen that still works but looks wrong. Linux only, in the
 * Playwright image (`pnpm vrt:game`), like the site's baselines; a
 * baseline is looked at before it is committed.
 */
test.describe('screens', { tag: '@screens' }, () => {
  test.beforeEach(({ page }) => holdClock(page));

  /** The stage, the screen's region: the page around it is the site's */
  const shot = (page: Page, name: string) =>
    expect(screen(page)).toHaveScreenshot(`${name}.png`);

  test('the title and its windows', async ({ page }) => {
    await open(page);
    await shot(page, 'title-splash');
    await toMenu(page);
    await shot(page, 'title-menu');
    await choose(page, 'How to play');
    await shot(page, 'title-how-to-play');
    await press(page, 'Escape');
    await choose(page, 'Options');
    await shot(page, 'title-options');
  });

  test('a run: the role, the roster, a duel and its windows', async ({
    page,
  }) => {
    await toMenu(page);
    await choose(page, 'Start');
    await expect(screen(page)).toHaveAccessibleName('Pushback, pick a role');
    await shot(page, 'select');
    await press(page, 'Enter');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await shot(page, 'roster');

    await press(page, 'Enter');
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    await shot(page, 'duel-line');
    // On to the first choice
    const offer = screen(page).getByRole('list').getByRole('button');
    for (let i = 0; i < 20 && (await offer.count()) === 0; i++) {
      await press(page, 'Enter');
      await settle(page, 700);
    }
    await shot(page, 'duel-choice');

    await press(page, 'Escape');
    await expect(
      screen(page).getByRole('list', { name: 'Pause' }),
    ).toBeVisible();
    await shot(page, 'duel-pause');
    await choose(page, 'Back to the roster');
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await shot(page, 'duel-leave');
    await press(page, 'Escape');
    await press(page, 'Escape');

    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await shot(page, 'roster-after-a-win');
  });

  test('what a won duel adds: the glossary, and erasing the save', async ({
    page,
  }) => {
    await toRoster(page);
    await press(page, 'Enter');
    await playDuel(page);
    await press(page, 'Escape');
    await press(page, 'Enter');
    await choose(page, /^Glossary/);
    await expect(
      screen(page).getByLabel('Glossary', { exact: true }),
    ).toBeVisible();
    await shot(page, 'glossary');
    await press(page, 'Escape');
    await choose(page, 'Options');
    await choose(page, 'Erase save');
    await expect(
      page.getByRole('alertdialog').or(page.getByRole('dialog')),
    ).toBeVisible();
    await shot(page, 'options-erase');
  });
});
