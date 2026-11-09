import { expect, test } from '@playwright/test';

import { escapes } from './layout';

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
 * box the screenshot takes.
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
        await expect
          .soft(page.locator('#storybook-root'))
          .toHaveScreenshot(`${id}-${shot.name}.png`);
      });
    }
  }
});
