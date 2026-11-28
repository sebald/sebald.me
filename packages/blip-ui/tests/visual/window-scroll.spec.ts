import { type Page, expect, test } from '@playwright/test';

/**
 * A window with more rows than its screen has room for, as a player gets
 * it: the window stays inside the stage, its list scrolls, and the arrows
 * bring each row into view at once. Run against the screen's long list,
 * at 1x and on a phone held upright, where the room is least. No
 * screenshots, so it runs on any system
 */
const SHOTS = [
  // More rows than room in both: the stage at its smallest, and upright,
  // where a row is a thumb's height
  {
    name: '1x',
    scale: 1,
    layout: 'wide',
    viewport: { width: 960, height: 600 },
  },
  {
    name: 'tall',
    // The stage across a 402px phone, as the visual tests take it
    scale: 402 / 320,
    layout: 'tall',
    viewport: { width: 402, height: 714 },
  },
];

/** Whether the row lies wholly inside the list's visible part */
const shown = (page: Page, name: string) =>
  page.evaluate(label => {
    const list = document.querySelector<HTMLElement>(
      '[data-slot=picker] > ul',
    )!;
    const row = [...list.querySelectorAll('button')].find(
      b => b.textContent?.trim() === label,
    )!;
    const l = list.getBoundingClientRect();
    const r = row.getBoundingClientRect();
    return r.top >= l.top - 0.5 && r.bottom <= l.bottom + 0.5;
  }, name);

for (const shot of SHOTS) {
  test.describe(`a long list in a window, ${shot.name}`, () => {
    let errors: string[] = [];
    // Upright is a phone, touched
    test.use({ hasTouch: shot.layout === 'tall' });
    test.beforeEach(async ({ page }) => {
      errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize(shot.viewport);
      await page.goto(
        `/iframe.html?id=components-screen--long-list&viewMode=story&globals=scale:${shot.scale};layout:${shot.layout}`,
      );
      await page.locator('[data-slot=picker]').waitFor();
    });
    test.afterEach(() => expect(errors).toEqual([]));

    test('stays inside the stage, its title and legend in view', async ({
      page,
    }) => {
      const box = await page.evaluate(() => {
        const r = (s: string) =>
          document.querySelector(s)!.getBoundingClientRect();
        return {
          stage: r('[data-stage]'),
          window: r('[data-slot=window]'),
          list: r('[data-slot=picker] > ul'),
          scrolls: (() => {
            const ul = document.querySelector('[data-slot=picker] > ul')!;
            return ul.scrollHeight > ul.clientHeight;
          })(),
        };
      });
      expect(box.window.bottom).toBeLessThanOrEqual(box.stage.bottom + 0.5);
      expect(box.window.top).toBeGreaterThanOrEqual(box.stage.top - 0.5);
      expect(box.scrolls).toBe(true);
      await expect(page.getByText('Wares', { exact: true })).toBeInViewport();
      await expect(page.locator('[data-slot=legend]')).toBeInViewport();
    });

    test('the arrows bring every row into view, at once', async ({ page }) => {
      const rows = await page
        .locator('[data-slot=picker] ul button')
        .allTextContents();
      expect(rows.length).toBe(12);
      for (const row of rows.slice(1)) {
        await page.keyboard.press('ArrowDown');
        await expect(page.locator('[aria-current=true]')).toHaveText(row);
        // No glide: in view in the same frame the key moved the cursor
        expect(await shown(page, row.trim())).toBe(true);
        expect(
          await page
            .locator('[data-slot=picker] > ul')
            .evaluate(ul => getComputedStyle(ul).scrollBehavior),
        ).not.toBe('smooth');
      }
      // Round to the first again, and up to it from the top
      await page.keyboard.press('ArrowDown');
      expect(await shown(page, rows[0]!.trim())).toBe(true);
    });

    test('scrolled to its end, a tap or a click picks a row there', async ({
      page,
    }) => {
      const list = page.locator('[data-slot=picker] > ul');
      await list.evaluate(ul => {
        ul.scrollTop = ul.scrollHeight;
      });
      const back = page.getByRole('button', { name: 'Back' });
      await expect(back).toBeInViewport();
      // A finger on the phone, the pointer on the wide stage
      if (shot.layout === 'tall') await back.tap();
      else await back.click();
      await expect(page.locator('[aria-current=true]')).toHaveText('Back');
    });
  });
}
