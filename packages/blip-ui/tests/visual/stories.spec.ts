import { expect, test } from '@playwright/test';

/**
 * Every story, screenshotted the ways a game shows it: wide at 3x (a
 * desktop) and 1x, and tall at 1x on a phone held upright, where rows
 * grow to a thumb's height and the controls move into a bar. The list
 * comes from the built Storybook's index, so a new story is covered
 * without touching this file. Tag a story `no-vrt` to leave it out.
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
    scale: 1,
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
    for (const { id } of stories) {
      await test.step(`${id} ${shot.name}`, async () => {
        await page.goto(
          `/iframe.html?id=${id}&viewMode=story&globals=scale:${shot.scale};layout:${shot.layout}`,
        );
        await page.locator('#storybook-root > *').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        await expect
          .soft(page.locator('#storybook-root'))
          .toHaveScreenshot(`${id}-${shot.name}.png`);
      });
    }
  }
});
