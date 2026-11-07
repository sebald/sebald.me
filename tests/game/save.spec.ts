import {
  current,
  expect,
  openWith,
  playDuel,
  press,
  saveWith,
  screen,
  test,
  toContinue,
} from './game';

/**
 * Where a returning player starts: the game opened on a save written
 * before it loads, so a test begins deep in a run instead of playing
 * its way there
 */
test.describe('a save to come back to', () => {
  test.skip(({ isMobile }) => isMobile, 'played by keys');

  test('Continue picks the run up where it was left', async ({ page }) => {
    await openWith(page, saveWith({ beaten: 1 }));
    await press(page, 'Enter');
    await expect(current(page)).toHaveText(/^Continue.*1\/4/);
    await press(page, 'Enter');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await expect(
      screen(page).getByRole('button', { name: /^beaten/ }),
    ).toHaveCount(1);
    await expect(current(page)).toHaveText(/Tier 2/);
  });

  test('the Stakeholder beaten: the run is won, its result card', async ({
    page,
  }) => {
    await openWith(page, saveWith({ beaten: 'colleagues', glossary: true }));
    await toContinue(page);
    await expect(current(page)).toHaveText(/Stakeholder/);
    await press(page, 'Enter');
    await expect(screen(page)).toHaveAccessibleName(
      /duel against .*Stakeholder/,
    );
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, result');
    await expect(screen(page)).toContainText('Stakeholder beaten');
  });
});
