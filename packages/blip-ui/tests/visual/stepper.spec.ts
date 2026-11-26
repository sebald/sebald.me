import { expect, test } from '@playwright/test';

/**
 * The stepper as a screen reader and a player get it, run against its
 * options example: the role, name and description the browser computes,
 * and the keys. Its label and description reach it through Base UI's
 * internals (`labelable-provider`), which a version bump may change
 * without a word: this is what notices. No screenshots, so it runs on any
 * system
 */
const story = '/iframe.html?id=components-stepper--options&viewMode=story';

test.describe('a stepper', () => {
  // Every test fails on an error on the page (a missing favicon is not one)
  let errors: string[] = [];
  test.beforeEach(async ({ page }) => {
    errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (
        message.type() === 'error' &&
        !message.text().startsWith('Failed to load resource')
      )
        errors.push(message.text());
    });
    await page.goto(story);
    await page.locator('[data-slot=stepper]').first().waitFor();
  });
  test.afterEach(() => expect(errors).toEqual([]));

  test('is named by its label and described by its description', async ({
    page,
  }) => {
    const music = page.getByRole('switch', { name: 'Music' });
    await expect(music).toBeChecked();
    await expect(page.getByRole('switch', { name: 'Hints' })).not.toBeChecked();
    const speed = page.getByRole('slider', { name: 'Text speed' });
    await expect(speed).toHaveAttribute('aria-valuetext', 'Normal');
    await expect(speed).toHaveAccessibleDescription(
      'How fast lines are written out.',
    );
  });

  test('steps on Left and Right, round past the ends; Up and Down leave it', async ({
    page,
  }) => {
    const music = page.getByRole('switch', { name: 'Music' });
    const speed = page.getByRole('slider', { name: 'Text speed' });
    await page.keyboard.press('ArrowDown');
    await expect(music).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(music).not.toBeChecked();
    await page.keyboard.press('Space');
    await expect(music).toBeChecked();
    await page.keyboard.press('ArrowDown');
    await expect(speed).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(speed).toHaveAttribute('aria-valuetext', 'Slow');
    await page.keyboard.press('ArrowLeft');
    await expect(speed).toHaveAttribute('aria-valuetext', 'Fast');
    await page.keyboard.press('ArrowUp');
    await expect(music).toBeFocused();
  });

  test("its focus is its field's cursor, its arrows bright beside it", async ({
    page,
  }) => {
    await page.keyboard.press('ArrowDown');
    const row = page.locator('[data-slot=field]', {
      has: page.getByRole('switch', { name: 'Music' }),
    });
    // What the player sees of the marks: the field's cursor at the label,
    // the arrows either side of the value showing, not yellow
    await expect(row.locator('[data-slot=cursor]')).toHaveCSS('opacity', '1');
    await expect(row.locator('[data-slot=step]').first()).toHaveCSS(
      'opacity',
      '1',
    );
    await expect(row.getByRole('switch')).toHaveCSS(
      'color',
      'rgb(214, 209, 194)',
    );
  });

  test('a tap on its label steps it, and the form sends its value', async ({
    page,
  }) => {
    await page.getByText('Hints', { exact: true }).click();
    await expect(page.getByRole('switch', { name: 'Hints' })).toBeChecked();
    await page.getByRole('slider', { name: 'Text speed' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Music On, Fast text.')).toBeVisible();
  });
});
