import { expect, test } from '@playwright/test';

/**
 * Every story, screenshotted at the scales a game shows it: 3x (a
 * desktop) and 1x (the tall stage on a phone). The list comes from the
 * built Storybook's index, so a new story is covered without touching
 * this file. Tag a story `no-vrt` to leave it out.
 */
interface Entry {
  id: string;
  type: 'story' | 'docs';
  tags?: string[];
}

const SCALES = [3, 1];

test('stories', async ({ page, baseURL }) => {
  const index = (await (await fetch(`${baseURL}/index.json`)).json()) as {
    entries: Record<string, Entry>;
  };
  const stories = Object.values(index.entries).filter(
    entry => entry.type === 'story' && !entry.tags?.includes('no-vrt'),
  );
  expect(stories.length).toBeGreaterThan(0);

  for (const { id } of stories) {
    for (const scale of SCALES) {
      await test.step(`${id} at ${scale}x`, async () => {
        await page.goto(
          `/iframe.html?id=${id}&viewMode=story&globals=scale:${scale}`,
        );
        await page.locator('#storybook-root > *').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        await expect
          .soft(page.locator('#storybook-root'))
          .toHaveScreenshot(`${id}-${scale}x.png`);
      });
    }
  }
});
