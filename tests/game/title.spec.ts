import {
  choose,
  current,
  expect,
  open,
  said,
  screen,
  test,
  toMenu,
} from './game';

test.describe('the title', () => {
  test.skip(({ isMobile }) => isMobile, 'played by keys');

  test('opens on the splash, Enter shows the menu', async ({ page }) => {
    await open(page);
    await expect(screen(page).getByText('Press Enter to play')).toBeVisible();
    await page.keyboard.press('Enter');
    const menu = screen(page).getByRole('list', { name: 'Title menu' });
    await expect(menu.getByRole('button')).toHaveText([
      'Start',
      'Continue',
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
    await expect(current(page)).toHaveText('Continue');
    // Shown beside the menu, and said
    await expect(
      screen(page)
        .getByText('No run in progress yet.', { exact: false })
        .first(),
    ).toBeVisible();
    await expect(said(page)).toContainText('No run in progress yet.');
    await page.keyboard.press('ArrowUp');
    await expect(current(page)).toHaveText('Start');
    // Round past the top to the bottom
    await page.keyboard.press('ArrowUp');
    await expect(current(page)).toHaveText('Options');
  });

  test('How to play opens and Escape goes back', async ({ page }) => {
    await toMenu(page);
    await choose(page, 'How to play');
    await expect(
      screen(page).getByRole('heading', { name: 'How it works' }),
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(
      screen(page).getByRole('list', { name: 'Title menu' }),
    ).toBeVisible();
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

  test('M mutes and unmutes, anywhere', async ({ page }) => {
    await toMenu(page);
    const sound = screen(page).getByRole('button', { name: 'Sound (M)' });
    const before = await sound.getAttribute('aria-pressed');
    await page.keyboard.press('m');
    await expect(sound).not.toHaveAttribute('aria-pressed', before!);
    await page.keyboard.press('m');
    await expect(sound).toHaveAttribute('aria-pressed', before!);
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
