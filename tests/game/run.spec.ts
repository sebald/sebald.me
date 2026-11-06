import {
  choose,
  current,
  expect,
  playDuel,
  press,
  said,
  screen,
  settle,
  test,
  toMenu,
  toRoster,
} from './game';

test.describe('a run', () => {
  test.skip(({ isMobile }) => isMobile, 'played by keys');

  test('picking a role: the arrows change role and look, Escape goes back', async ({
    page,
  }) => {
    await toMenu(page);
    await choose(page, 'Start');
    await expect(screen(page)).toHaveAccessibleName('Pushback, pick a role');
    const picked = screen(page).locator('[aria-pressed=true]');
    await expect(picked).toHaveAccessibleName('PM, Jo');
    await page.keyboard.press('ArrowDown');
    await expect(picked).toHaveAccessibleName('PM, Piet');
    await page.keyboard.press('ArrowRight');
    await expect(picked).toHaveAccessibleName(/^Dev, /);
    await page.keyboard.press('Escape');
    await expect(screen(page)).toHaveAccessibleName('Pushback, title');
  });

  test('the roster: only the first colleague is open, the boss locked', async ({
    page,
  }) => {
    await toRoster(page);
    const opponents = screen(page)
      .getByRole('list', { name: 'Opponents in run order' })
      .getByRole('button');
    await expect(opponents).toHaveCount(4);
    await expect(opponents.nth(0)).toBeEnabled();
    for (const i of [1, 2, 3]) await expect(opponents.nth(i)).toBeDisabled();
    await expect(opponents.nth(3)).toHaveAccessibleName(/Stakeholder locked/);
    await page.keyboard.press('Escape');
    await expect(screen(page)).toHaveAccessibleName('Pushback, title');
  });

  test('a duel won by the right counters, and the roster after it', async ({
    page,
  }) => {
    await toRoster(page);
    const first = screen(page)
      .getByRole('list', { name: 'Opponents in run order' })
      .getByRole('button')
      .first();
    const name = (await first.textContent())!.replace(/Tier \d$/, '').trim();
    await page.keyboard.press('Enter');
    await expect(screen(page)).toHaveAccessibleName(
      `Pushback, duel against ${name}`,
    );
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await expect(
      screen(page).getByRole('button', {
        name: new RegExp(`^beaten, ${name}`),
      }),
    ).toBeVisible();
    // The next colleague is open now, and the keys are on them
    await expect(current(page)).toHaveText(/Tier 2/);
  });

  test('a duel lost: the colleague is still to beat', async ({ page }) => {
    await toRoster(page);
    await page.keyboard.press('Enter');
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    await playDuel(page, { wrong: true });
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
    await expect(current(page)).toHaveText(/Tier 1/);
    await expect(
      screen(page).getByRole('button', { name: /^beaten/ }),
    ).toHaveCount(0);
  });

  test('the same time plays the same duel', async ({ page }) => {
    const firsts: string[] = [];
    for (let round = 0; round < 2; round++) {
      if (round) await page.evaluate(() => localStorage.clear());
      await toRoster(page);
      await page.keyboard.press('Enter');
      await expect(screen(page)).toHaveAccessibleName(/duel against/);
      // On to the first choice: what was said, and what is on offer
      const offer = screen(page).getByRole('list').getByRole('button');
      for (let i = 0; i < 20 && (await offer.count()) === 0; i++) {
        await press(page, 'Enter');
        await settle(page, 700);
      }
      firsts.push(
        [
          await screen(page).getAttribute('aria-label'),
          await screen(page).locator('p').first().textContent(),
          ...(await offer.allTextContents()),
        ].join('\n'),
      );
    }
    expect(firsts[0]).toContain('duel against');
    expect(firsts[1]).toBe(firsts[0]);
  });

  test('Escape pauses the duel; its menu has the keys until it closes', async ({
    page,
  }) => {
    await toRoster(page);
    await page.keyboard.press('Enter');
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    const line = await said(page).textContent();
    await page.keyboard.press('Escape');
    const pause = screen(page).getByRole('list', { name: 'Pause' });
    await expect(pause).toBeVisible();
    await expect(current(page)).toHaveText('Resume');
    // Enter picks in the pause menu, not the duel's line under it
    await page.keyboard.press('ArrowDown');
    await expect(current(page)).toHaveText(/^Sound/);
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Enter');
    await expect(pause).toBeHidden();
    await expect(said(page)).toHaveText(line!);

    // Leaving asks first; Escape there answers no, back in the pause menu
    await page.keyboard.press('Escape');
    await expect(pause).toBeVisible();
    await choose(page, 'Back to the roster');
    const ask = page.getByRole('alertdialog', { name: 'Leave the duel?' });
    await expect(ask).toBeVisible();
    await expect(ask.locator('[aria-current=true]')).toHaveText('Cancel');
    await page.keyboard.press('Escape');
    await expect(ask).toBeHidden();
    await expect(pause).toBeVisible();
    await expect(screen(page)).toHaveAccessibleName(/duel against/);

    await choose(page, 'Back to the roster');
    await expect(ask).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(ask.locator('[aria-current=true]')).toHaveText('Leave');
    await page.keyboard.press('Enter');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
  });

  test('Continue picks the run up again after a reload', async ({ page }) => {
    await toRoster(page);
    await page.reload();
    await toMenu(page);
    await expect(
      screen(page).getByRole('button', { name: 'Continue' }),
    ).toBeEnabled();
    await choose(page, 'Continue');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
  });

  test('erasing the save asks first, then empties it', async ({ page }) => {
    await toRoster(page);
    await page.keyboard.press('Escape');
    await page.keyboard.press('Enter');
    await choose(page, 'Options');
    await choose(page, 'Erase save');
    const ask = page.getByRole('alertdialog').or(page.getByRole('dialog'));
    await expect(ask).toBeVisible();
    // The keys start on the safe answer, in the question, not the menu under it
    await expect(ask.locator('[aria-current=true]')).toHaveText(/cancel|keep/i);
    await page.keyboard.press('Enter');
    await expect(ask).toBeHidden();
    await expect(
      screen(page).getByRole('button', { name: 'Erase save' }),
    ).toBeEnabled();

    await choose(page, 'Erase save');
    await expect(ask).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(ask).toBeHidden();
    await expect(
      screen(page).getByRole('button', { name: 'Erase save' }),
    ).toBeDisabled();
  });
});
