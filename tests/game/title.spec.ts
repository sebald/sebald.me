import type { Page } from '@playwright/test';
import type { Save } from '@sebald/pushback/lib/save';
import { SHEET_IDS } from '@sebald/pushback/lib/sprites';

import {
  choose,
  current,
  expect,
  open,
  openWith,
  press,
  said,
  saveWith,
  screen,
  test,
  toMenu,
} from './game';

test.describe('the title', () => {
  test.skip(({ isMobile }) => isMobile, 'played by keys');

  test('fetches the cast before a key is pressed', async ({ page }) => {
    const requested: string[] = [];
    page.on('request', request => requested.push(request.url()));
    await open(page);
    // Next adds a hash to a file's name: match on its base name
    await expect
      .poll(() =>
        SHEET_IDS.filter(
          sheet => !requested.some(url => url.includes(`/${sheet}.`)),
        ),
      )
      .toEqual([]);
  });

  test('opens on the splash, Enter shows the menu', async ({ page }) => {
    await open(page);
    await expect(screen(page).getByText('Press Enter to play')).toBeVisible();
    await page.keyboard.press('Enter');
    const menu = screen(page).getByRole('list', { name: 'Title menu' });
    // No run yet: no Continue
    await expect(menu.getByRole('button')).toHaveText([
      'Start',
      /^Glossary/,
      'How to play',
      'Options',
    ]);
    await expect(current(page)).toHaveText('Start');
  });

  test('the arrows move through the menu and say what an item does', async ({
    page,
  }) => {
    await toMenu(page);
    await page.keyboard.press('ArrowDown');
    await expect(current(page)).toHaveText(/^Glossary/);
    // Shown beside the menu, and said
    await expect(
      screen(page)
        .getByText('Nothing collected yet.', { exact: false })
        .first(),
    ).toBeVisible();
    await expect(said(page)).toContainText('Nothing collected yet.');
    await page.keyboard.press('ArrowUp');
    await expect(current(page)).toHaveText('Start');
    // Round past the top to the bottom
    await page.keyboard.press('ArrowUp');
    await expect(current(page)).toHaveText('Options');
  });

  test('How to play opens in place of the logo, and Escape goes back', async ({
    page,
  }) => {
    await toMenu(page);
    const logo = screen(page).getByRole('img', { name: 'Pushback' });
    await choose(page, 'How to play');
    await expect(
      screen(page).getByRole('heading', { name: 'How it works' }),
    ).toBeVisible();
    await expect(logo).toBeHidden();
    // Still the title for a screen reader
    await expect(screen(page)).toHaveAccessibleName('Pushback, title');
    await page.keyboard.press('Escape');
    await expect(
      screen(page).getByRole('list', { name: 'Title menu' }),
    ).toBeVisible();
    await expect(logo).toBeVisible();
  });

  test('Options change the mode, and the save keeps it', async ({ page }) => {
    await toMenu(page);
    await choose(page, 'Options');
    const options = screen(page).getByRole('list', { name: 'Options' });
    await expect(
      options.getByRole('button', { name: 'Mode Easy' }),
    ).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(
      options.getByRole('button', { name: 'Mode Normal' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      screen(page).getByRole('list', { name: 'Title menu' }),
    ).toBeVisible();

    await page.reload();
    await toMenu(page);
    await choose(page, 'Options');
    await expect(
      screen(page).getByRole('button', { name: 'Mode Normal' }),
    ).toBeVisible();
  });

  /** Options on a save, the mode switched: the question it asks first */
  const switchMode = async (page: Page, save: Save) => {
    await openWith(page, save);
    await press(page, 'Enter');
    await choose(page, 'Options');
    await page.keyboard.press('ArrowRight');
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    return dialog;
  };

  test('switching the mode with a run in play says it goes', async ({
    page,
  }) => {
    await expect(await switchMode(page, saveWith())).toContainText(
      'so switching starts over and deletes your run as PM.',
    );
  });

  test('switching the mode lists everything it deletes', async ({ page }) => {
    await expect(
      await switchMode(page, saveWith({ glossary: true })),
    ).toContainText(
      /so switching starts over and deletes your run as PM and \d+ collected lines\./,
    );
  });

  test('M mutes and unmutes, anywhere', async ({ page }) => {
    await toMenu(page);
    const sound = screen(page).getByRole('button', { name: 'Sound (M)' });
    const before = await sound.getAttribute('aria-pressed');
    await page.keyboard.press('m');
    await expect(sound).not.toHaveAttribute('aria-pressed', before!);
    await page.keyboard.press('m');
    await expect(sound).toHaveAttribute('aria-pressed', before!);
  });

  test('a window too small for the menus asks to grow, then plays', async ({
    page,
  }) => {
    // Under the smallest scale (2.25): 700 wide is about 2x
    await page.setViewportSize({ width: 700, height: 500 });
    await open(page);
    await expect(
      screen(page).getByText('Make the window bigger to play.'),
    ).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(screen(page).getByText('Press Enter to play')).toBeVisible();
  });

  test('left alone, it plays the demo; a key brings the menu back', async ({
    page,
  }) => {
    await toMenu(page);
    await page.clock.runFor(21_000);
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    await page.keyboard.press('Space');
    await expect(
      screen(page).getByRole('list', { name: 'Title menu' }),
    ).toBeVisible();
  });
});
