import { expect, test, type Page } from '@playwright/test';

// Setup
// ---------------
// Pin everything that would otherwise change between runs: the live
// Berlin-time logo, the consent banner and third-party scripts.
const FIXED_TIME = new Date('2026-01-01T11:00:00Z'); // 12:00 in Berlin

test.beforeEach(async ({ page, context, baseURL }) => {
  await page.clock.setFixedTime(FIXED_TIME);
  await context.addCookies([
    { name: 'cookie_consent', value: 'denied', url: baseURL! },
  ]);
  await context.route(/googletagmanager\.com|google-analytics\.com/, route =>
    route.abort(),
  );
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

  test('dialog', async ({ page }) => {
    await visit(page, '/inventory');
    await page
      .getByRole('button', { name: 'Open Dialog', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveScreenshot('inventory-dialog.png');
  });

  test('non-modal dialog', async ({ page }) => {
    await visit(page, '/inventory');
    await page
      .getByRole('button', { name: 'Open Non-modal Dialog (bottom)' })
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveScreenshot('inventory-dialog-bottom.png');
  });

  test('menu', async ({ page }) => {
    await visit(page, '/inventory');
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page).toHaveScreenshot('inventory-menu.png');
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
