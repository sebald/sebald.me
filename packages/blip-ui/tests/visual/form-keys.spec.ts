import { type Page, expect, test } from '@playwright/test';

/**
 * A form window's keys, the research's table
 * (`docs/blip-harness/research/forms-and-navigation.md`, section 5) run
 * against the `Form` example: no key code of the example's own, the form
 * moves its rows. No screenshots, so it runs on any system
 */
const story = '/iframe.html?id=components-form--saving-a-game&viewMode=story';

/** What has the focus: a field's name, or a button's words */
const focused = (page: Page) =>
  page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    if (!active || active === document.body) return 'nothing';
    return (
      active.getAttribute('name') ??
      active.textContent?.trim() ??
      active.tagName
    );
  });

test.describe('a form window', () => {
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
    await page.locator('form[data-slot=form]').waitFor();
  });
  test.afterEach(() => expect(errors).toEqual([]));

  test('Down from nothing visits each row in order and wraps; Up reverses', async ({
    page,
  }) => {
    const seen = [];
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('ArrowDown');
      seen.push(await focused(page));
    }
    expect(seen).toEqual(['name', 'note', 'Save', 'name']);
    await page.keyboard.press('ArrowUp');
    expect(await focused(page)).toBe('Save');
    await page.keyboard.press('ArrowUp');
    expect(await focused(page)).toBe('note');
  });

  test('in a field Left and Right move the caret, Up and Down leave the row', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('Mira');
    await page.keyboard.press('ArrowLeft');
    expect(await focused(page)).toBe('name');
    expect(
      await page.evaluate(
        () => (document.activeElement as HTMLInputElement).selectionStart,
      ),
    ).toBe(3);
    await page.keyboard.press('ArrowDown');
    expect(await focused(page)).toBe('note');
  });

  test('Esc lets go of a field and the next Down goes back to it', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    expect(await focused(page)).toBe('note');
    await page.keyboard.press('Escape');
    expect(await focused(page)).toBe('nothing');
    await page.keyboard.press('ArrowDown');
    expect(await focused(page)).toBe('note');
  });

  test('a row of buttons moves with Left and Right, round at the ends', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowUp');
    expect(await focused(page)).toBe('Save');
    await page.keyboard.press('ArrowRight');
    expect(await focused(page)).toBe('Back');
    await page.keyboard.press('ArrowRight');
    expect(await focused(page)).toBe('Save');
    await page.keyboard.press('ArrowLeft');
    expect(await focused(page)).toBe('Back');
  });

  test('Enter in a field sends the form, and so does the submit button', async ({
    page,
  }) => {
    await page.keyboard.press('ArrowDown');
    await page.keyboard.type('Cave');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Saved as Cave.')).toBeVisible();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Saved as Cave.')).toBeHidden();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Saved as Cave.')).toBeVisible();
  });

  test('Tab visits every control in reading order, unchanged', async ({
    page,
  }) => {
    const seen = [];
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab');
      seen.push(await focused(page));
    }
    expect(seen).toEqual(['name', 'note', 'Save', 'Back']);
    await page.keyboard.press('Shift+Tab');
    expect(await focused(page)).toBe('Save');
  });
});
