import { type Page, expect, test } from '@playwright/test';

/**
 * A menu's name as a screen reader gets it: the title of the window or
 * dialog it is in, with no label of its own, and a label only where
 * nothing names it. The names the browser computes, no screenshots, so it
 * runs on any system
 */
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

/** Fails the test on an error on the page, a nameless menu's among them */
const watch = (page: Page) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (
      message.type() === 'error' &&
      !message.text().startsWith('Failed to load resource')
    )
      errors.push(message.text());
  });
  return errors;
};

test.describe('a menu', () => {
  let errors: string[] = [];
  test.beforeEach(({ page }) => {
    errors = watch(page);
  });
  test.afterEach(() => expect(errors).toEqual([]));

  test('in a window is named by its title', async ({ page }) => {
    await page.goto(story('components-picker--in-a-window'));
    const list = page.getByRole('list', { name: 'Options' });
    await expect(list).toBeVisible();
    await expect(list).not.toHaveAttribute('aria-label');
  });

  test('in the window page’s example is named by its title', async ({
    page,
  }) => {
    await page.goto(story('components-window--a-menu'));
    await expect(page.getByRole('list', { name: 'Inventory' })).toBeVisible();
  });

  test('beside another is named by its own window’s title', async ({
    page,
  }) => {
    await page.goto(story('components-picker--two-menus'));
    await expect(page.getByRole('list', { name: 'Party' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Bag' })).toBeVisible();
  });

  test('in a dialog is named by the dialog’s title', async ({ page }) => {
    // The story opens it
    await page.goto(story('components-dialog--default'));
    const dialog = page.getByRole('dialog', { name: 'Options' });
    await expect(dialog.getByRole('list', { name: 'Options' })).toBeVisible();
  });

  test('takes its label where nothing names it', async ({ page }) => {
    await page.goto(story('components-picker--default'));
    await expect(page.getByRole('list', { name: 'Menu' })).toBeVisible();
  });
});
