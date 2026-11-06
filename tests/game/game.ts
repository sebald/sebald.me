import {
  type Locator,
  type Page,
  expect,
  test as base,
} from '@playwright/test';
import {
  BOSS_PAIRS,
  CLOSERS,
  PAIRS,
  pairById,
} from '@sebald/pushback/lib/lines';

/**
 * The game played through its screens, by what a player and a screen
 * reader get: the screen's region, its buttons, the current item
 * (`aria-current`) and what the live region says. Nothing here reads a
 * class or a component's internals, so the suite holds while the UI
 * underneath is rebuilt.
 */

/** A duel's seed is the time it starts at: a fixed time plays the same duels */
const START = new Date('2026-01-01T10:00:00Z');

export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, run) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });
      await run(errors);
      expect(errors, 'no errors in the console').toEqual([]);
    },
    { auto: true },
  ],
  page: async ({ page }, run) => {
    // The demo's picks and the sound's noise use Math.random: seed it too
    await page.addInitScript(() => {
      let state = 0x2f6b3a1d;
      Math.random = () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
      };
    });
    // Fake timers to step through a duel, and a time that stands still:
    // a run's opponents and a duel's lines are seeded by it
    await page.clock.install({ time: START });
    await page.clock.setFixedTime(START);
    await run(page);
  },
});

export { expect };

/** The game's current screen: the region named "Pushback, …" */
export const screen = (page: Page): Locator =>
  page.getByRole('region', { name: /^Pushback, / });

/** Open the game and wait for its title */
export const open = async (page: Page) => {
  await page.goto('/lab/pushback');
  await expect(screen(page)).toHaveAccessibleName('Pushback, title');
};

/** What the live region says now (the duel narrates every step in it) */
export const said = (page: Page) =>
  page.locator('[aria-live]').filter({ hasText: /\S/ }).last();

/** The item the keys are on in the screen's menu */
export const current = (page: Page) =>
  screen(page).locator('[aria-current=true]').first();

/** Move down the menu to the item named `name` and pick it */
export const choose = async (page: Page, name: string | RegExp) => {
  const item = screen(page).getByRole('button', { name });
  await expect(item).toBeEnabled();
  for (let i = 0; i < 12; i++) {
    const on = await current(page).textContent();
    if (on && (await item.textContent())?.trim() === on.trim()) break;
    await page.keyboard.press('ArrowDown');
  }
  await expect(current(page)).toHaveText((await item.textContent())!.trim());
  await page.keyboard.press('Enter');
};

/** From the title's splash to the menu */
export const toMenu = async (page: Page) => {
  await open(page);
  await page.keyboard.press('Enter');
  await expect(
    screen(page).getByRole('list', { name: 'Title menu' }),
  ).toBeVisible();
};

/** A new run as the first role and look, on its roster */
export const toRoster = async (page: Page) => {
  await toMenu(page);
  await choose(page, 'Start');
  await expect(screen(page)).toHaveAccessibleName('Pushback, pick a role');
  await page.keyboard.press('Enter');
  await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
};

/** Every phrase the game has, and the one counter that answers it */
const COUNTERS = new Map<string, string>([
  ...[...PAIRS, ...CLOSERS].map(pair => [pair.phrase, pair.counter] as const),
  ...BOSS_PAIRS.map(
    pair => [pair.phrase, pairById(pair.answeredBy).counter] as const,
  ),
]);

/** The reply on offer that answers a phrase on screen, if one is on offer */
const answer = async (page: Page) => {
  const text = (await screen(page).innerText()).replace(/\s+/g, ' ');
  const replies = await screen(page).getByRole('button').allTextContents();
  for (const [phrase, counter] of COUNTERS)
    if (text.includes(phrase) && replies.some(r => r.trim() === counter))
      return counter;
  return null;
};

/**
 * Play the duel on screen to its end: on defence the counter that
 * answers the phrase (from the game's own lines), otherwise Enter
 * (continue, or the first phrase to throw); the time runs on between
 * presses, as it would while a player reads. `wrong` replies with
 * anything but the counter, to lose.
 */
export const playDuel = async (page: Page, { wrong = false } = {}) => {
  for (let i = 0; i < 300; i++) {
    const name = (await screen(page).getAttribute('aria-label')) ?? '';
    if (!name.includes('duel against')) return;
    const counter = await answer(page);
    if (counter) {
      for (let step = 0; step < 8; step++) {
        const on = (await current(page).textContent())?.trim();
        if (wrong ? on !== counter : on === counter) break;
        await page.keyboard.press('ArrowDown');
      }
    }
    await page.keyboard.press('Enter');
    await page.clock.runFor(700);
  }
  throw new Error('the duel did not end in 300 presses');
};
