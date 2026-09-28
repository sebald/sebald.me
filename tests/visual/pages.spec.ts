import { expect, test, type Page } from '@playwright/test';

// Setup
// ---------------
// Pin everything that would otherwise change between runs: the live
// Berlin-time logo.
const FIXED_TIME = new Date('2026-01-01T11:00:00Z'); // 12:00 in Berlin

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(FIXED_TIME);
});

/**
 * Navigate and wait until the page is visually settled: fonts loaded and
 * every image (including lazy ones below the fold) decoded.
 */
const visit = async (page: Page, path: string) => {
  await page.goto(path);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const images = Array.from(document.images);
    for (const img of images) img.loading = 'eager';
    await Promise.all(images.map(img => img.decode().catch(() => {})));
  });
  await page.waitForLoadState('networkidle');
};

// Inventory
// ---------------
test.describe('inventory', () => {
  test('page', async ({ page }) => {
    await visit(page, '/inventory');
    await expect(page).toHaveScreenshot('inventory.png', { fullPage: true });
  });

  // Overlays aren't part of the full-page screenshot, so open each one
  const OVERLAYS = [
    { trigger: 'Open Dialog', role: 'dialog', name: 'inventory-dialog' },
    {
      trigger: 'Open Non-modal Dialog (bottom)',
      role: 'dialog',
      name: 'inventory-dialog-bottom',
    },
    { trigger: 'Open Menu', role: 'menu', name: 'inventory-menu' },
    // Toasts render as non-modal dialogs inside the "Notifications" region
    { trigger: 'Show Toast', role: 'dialog', name: 'inventory-toast' },
  ] as const;

  for (const { trigger, role, name } of OVERLAYS) {
    test(name, async ({ page }) => {
      await visit(page, '/inventory');
      await page.getByRole('button', { name: trigger, exact: true }).click();
      await expect(page.getByRole(role)).toBeVisible();
      await expect(page).toHaveScreenshot(`${name}.png`);
    });
  }

  // Tooltips open on hover (after a delay) instead of on click
  test('inventory-tooltip', async ({ page }) => {
    await visit(page, '/inventory');
    await page
      .getByRole('button', { name: 'Show Tooltip', exact: true })
      .hover();
    await expect(page.getByText('A short hint for a control')).toBeVisible();
    await expect(page).toHaveScreenshot('inventory-tooltip.png');
  });
});

// Notes
// ---------------
const NOTES = [
  '/notes/failing-forward-at-design-systems',
  '/notes/where-the-map-ends',
];

for (const path of NOTES) {
  test(`note ${path}`, async ({ page }) => {
    await visit(page, path);
    await expect(page).toHaveScreenshot(`${path.split('/').at(-1)}.png`, {
      fullPage: true,
    });
  });
}
