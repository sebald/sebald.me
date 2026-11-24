import { expect, test } from '@playwright/test';

import { cursorRoom, escapes, windowsInWindows } from './layout';

/**
 * Every story, screenshotted the ways a game shows it: wide at 3x (a
 * desktop) and 1x, and tall on a phone held upright, where rows
 * grow to a thumb's height and the controls move into a bar. The list
 * comes from the built Storybook's index, so a new story is covered
 * without touching this file. Tag a story `no-vrt` to leave it out, or
 * `no-vrt-<shot>` (`no-vrt-1x`) to leave out one shot it has no room for.
 *
 * A screenshot only says a story looks as it did when its baseline was
 * taken, a fault included. So each shot is also checked for what a
 * picture can't show is wrong: nothing of the story may lie outside the
 * box the screenshot takes, and every focus cursor has its room, focused
 * or not.
 */
interface Entry {
  id: string;
  type: 'story' | 'docs';
  tags?: string[];
}

const SHOTS = [
  {
    name: '3x',
    scale: 3,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
  {
    name: '1x',
    scale: 1,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
  // A phone upright, the size the layout fixes were made for
  {
    name: 'tall',
    // The stage across a 402px phone: 402 / 320
    scale: 402 / 320,
    layout: 'tall',
    viewport: { width: 402, height: 714 },
  },
] as const;

test('stories', async ({ page, baseURL }) => {
  const index = (await (await fetch(`${baseURL}/index.json`)).json()) as {
    entries: Record<string, Entry>;
  };
  const stories = Object.values(index.entries).filter(
    entry => entry.type === 'story' && !entry.tags?.includes('no-vrt'),
  );
  expect(stories.length).toBeGreaterThan(0);
  // One test for every screenshot: give each its own time, not 30s for all
  test.setTimeout(stories.length * SHOTS.length * 15_000);

  for (const shot of SHOTS) {
    await page.setViewportSize(shot.viewport);
    for (const { id, tags } of stories) {
      if (tags?.includes(`no-vrt-${shot.name}`)) continue;
      await test.step(`${id} ${shot.name}`, async () => {
        await page.goto(
          `/iframe.html?id=${id}&viewMode=story&globals=scale:${shot.scale};layout:${shot.layout}`,
        );
        await page.locator('#storybook-root > *').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        expect
          .soft(
            await escapes(page),
            'parts outside the story, cut off in the screenshot',
          )
          .toEqual([]);
        expect
          .soft(
            await cursorRoom(page),
            'a focus cursor without its room (foundations/focus.mdx)',
          )
          .toEqual([]);
        await expect
          .soft(page.locator('#storybook-root'))
          .toHaveScreenshot(`${id}-${shot.name}.png`);
      });
    }
  }
});

/**
 * No story draws a window in a window, those left out of the screenshots
 * (`no-vrt`) included: a frame in a frame is never right, so each is
 * opened once, wide, and looked at for one
 */
test('no window in a window', async ({ page, baseURL }) => {
  const index = (await (await fetch(`${baseURL}/index.json`)).json()) as {
    entries: Record<string, Entry>;
  };
  const stories = Object.values(index.entries).filter(
    entry => entry.type === 'story',
  );
  test.setTimeout(stories.length * 10_000);
  await page.setViewportSize({ width: 960, height: 600 });
  const found: string[] = [];
  for (const { id } of stories) {
    await page.goto(`/iframe.html?id=${id}&viewMode=story&globals=scale:3`);
    await page.locator('#storybook-root > *').first().waitFor();
    for (const fault of await windowsInWindows(page))
      found.push(`${id}: ${fault}`);
  }
  expect(found).toEqual([]);
});
