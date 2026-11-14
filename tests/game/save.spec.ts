import { readFile } from 'node:fs/promises';

import {
  choose,
  current,
  expect,
  openWith,
  playDuel,
  press,
  said,
  saveWith,
  screen,
  sharedWith,
  takenOffline,
  test,
  toBossDuel,
  withShareSheet,
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
    await toBossDuel(page);
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, result');
    await expect(screen(page)).toContainText('Stakeholder beaten');
  });

  test('lost to the Stakeholder: taken offline, and the result says so', async ({
    page,
  }) => {
    await toBossDuel(page);
    await playDuel(page, { wrong: true, until: () => takenOffline(page) });
    await expect(said(page)).toHaveText(
      /You lost\. The Stakeholder took it offline/,
    );
    await playDuel(page, { wrong: true });
    await expect(screen(page)).toHaveAccessibleName('Pushback, result');
    await expect(screen(page)).toContainText('Stakeholder took it offline');
  });

  test('the result as a picture: saved where there is no share sheet', async ({
    page,
  }) => {
    await toBossDuel(page);
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, result');
    await expect(
      screen(page).getByRole('button', { name: 'Copy result' }),
    ).toBeVisible();
    const download = page.waitForEvent('download');
    await choose(page, 'Save image');
    const file = await download;
    expect(file.suggestedFilename()).toBe('pushback-pm.png');
    const png = await readFile((await file.path())!);
    // The PNG's header: its width and height, big-endian from byte 16
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
    await expect(
      screen(page).getByRole('button', { name: 'Saved' }),
    ).toBeVisible();
  });

  test('the result as a picture: handed to the share sheet alone', async ({
    page,
  }) => {
    await withShareSheet(page);
    await toBossDuel(page);
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, result');
    // The sheet can copy too: no Copy result beside it
    await expect(
      screen(page).getByRole('button', { name: 'Copy result' }),
    ).toHaveCount(0);
    await choose(page, 'Share…');
    await expect(
      screen(page).getByRole('button', { name: 'Shared' }),
    ).toBeVisible();
    const shared = await sharedWith(page);
    expect(shared.files).toHaveLength(1);
    expect(shared.files[0]).toMatchObject({
      name: 'pushback-pm.png',
      type: 'image/png',
    });
    expect(shared.files[0]!.size).toBeGreaterThan(10_000);
    // No text beside it: macOS's sheet would copy it as a second file
    expect(shared.text).toBeUndefined();
  });
});
