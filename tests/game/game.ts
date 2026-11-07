import {
  type Locator,
  type Page,
  expect,
  test as base,
} from '@playwright/test';
import { type Mode, bossIndex } from '@sebald/pushback/lib/characters';
import {
  BOSS_PAIRS,
  CLOSERS,
  PAIRS,
  pairById,
} from '@sebald/pushback/lib/lines';
import {
  type Save,
  SAVE_KEY,
  emptySave,
  startRun,
} from '@sebald/pushback/lib/save';

/**
 * The game played through its screens, by what a player and a screen
 * reader get: the screen's region, its buttons, the current item
 * (`aria-current`) and what the live region says. Nothing here reads a
 * class or a component's internals, so the suite holds while the UI
 * underneath is rebuilt.
 */

/** A duel's seed is the time it starts at: a fixed time plays the same duels */
export const START = new Date('2026-01-01T10:00:00Z');

export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, run) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        // A failed load is reported with its address below
        if (
          message.type() === 'error' &&
          !message.text().startsWith('Failed to load resource')
        )
          errors.push(message.text());
      });
      page.on('response', response => {
        if (response.status() >= 400)
          errors.push(`${response.status()} ${response.url()}`);
      });
      await run(errors);
      expect(errors, 'no errors in the console').toEqual([]);
    },
    { auto: true },
  ],
  page: async ({ page }, run) => {
    // Vercel's analytics script is served on Vercel only; a build
    // elsewhere asks for it and gets a 404
    await page.route('**/_vercel/**', route =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    );
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
    // Every change to the page, counted, so a test can wait until it rests
    await page.addInitScript(() => {
      const counter = window as unknown as { __changes: number };
      counter.__changes = 0;
      new MutationObserver(() => counter.__changes++).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      });
    });
    await page.clock.install({ time: START });
    await page.clock.setFixedTime(START);
    await run(page);
  },
});

export { expect };

/**
 * A key, then a moment for what it starts (a screen's entrance, a
 * listener that waits a task): the time runs on by itself in the flows,
 * and only by this when a test holds the clock still (`holdClock`)
 */
export const press = async (page: Page, key: string) => {
  await page.keyboard.press(key);
  await settle(page);
};

/** Until the page has stopped changing for a real moment: React has rendered */
const rest = async (page: Page) => {
  const changes = () =>
    page.evaluate(() => (window as unknown as { __changes: number }).__changes);
  let before = -1;
  for (let i = 0; i < 50; i++) {
    const now = await changes();
    if (now === before) return;
    before = now;
    await page.waitForTimeout(40);
  }
};

/**
 * React renders what changed, then `ms` of the game's time, then React
 * renders what that time did: an animation starts from when its screen
 * mounts, so with the clock held (`holdClock`) every run sees the same
 * frames, however fast the server is
 */
export const settle = async (page: Page, ms = 250) => {
  await rest(page);
  await page.clock.runFor(ms);
  await rest(page);
};

/**
 * Hold the clock still from here on: only `press` and `runFor` move it,
 * so every run sees the same frame of what animates (for screenshots)
 */
export const holdClock = (page: Page) =>
  page.clock.pauseAt(new Date(START.getTime() + 1000));

/** The game's current screen: the region named "Pushback, …" */
export const screen = (page: Page): Locator =>
  page.getByRole('region', { name: /^Pushback, / });

/** Open the game and wait for its title */
export const open = async (page: Page) => {
  await page.goto('/lab/pushback');
  await settle(page, 500);
  await expect(screen(page)).toHaveAccessibleName('Pushback, title');
};

/**
 * A returning player's save, built with the game's own functions: a run
 * as the first role and look, drawn at the fixed time (so the same
 * colleagues every run), with its first `beaten` colleagues beaten and,
 * with `glossary`, every pair collected (the Stakeholder asks for
 * counters from every pool)
 */
export const saveWith = ({
  mode = 'easy',
  beaten = 0,
  flawless = false,
  glossary = false,
}: {
  mode?: Mode;
  beaten?: number | 'colleagues';
  flawless?: boolean;
  glossary?: boolean;
} = {}): Save => {
  const save = startRun(emptySave(mode), 'pm', 'a', START.getTime());
  const run = save.run!;
  const count = beaten === 'colleagues' ? bossIndex(run.run) : beaten;
  const all = PAIRS.map(pair => pair.id);
  return {
    ...save,
    run: {
      ...run,
      beaten: Object.fromEntries(
        Array.from({ length: count }, (_, i) => [i, { flawless, score: 1000 }]),
      ),
      attempts: count,
      collected: glossary
        ? [...new Set([...run.collected, ...all])]
        : run.collected,
    },
    glossary: glossary ? all : [],
  };
};

/**
 * Open the game on a save, as a returning player would: it is in
 * storage before the page's first script, written once, so what the
 * test plays from there is saved as it would be
 */
export const openWith = async (page: Page, save: Save) => {
  await page.addInitScript(
    ([key, value]) => {
      if (sessionStorage.getItem('pushback-test-save')) return;
      sessionStorage.setItem('pushback-test-save', '1');
      localStorage.setItem(key, value);
    },
    [SAVE_KEY, JSON.stringify(save)] as const,
  );
  await open(page);
};

/** From the title's menu, the run in play picked up: on its roster */
export const toContinue = async (page: Page) => {
  await press(page, 'Enter');
  await choose(page, /^Continue/);
  await expect(screen(page)).toHaveAccessibleName('Pushback, roster');
};

/** What the live region says now (the duel narrates every step in it) */
export const said = (page: Page) =>
  page.locator('[aria-live]').filter({ hasText: /\S/ }).last();

/** The item the keys are on in the screen's menu */
export const current = (page: Page) =>
  screen(page).locator('[aria-current=true]').first();

/**
 * Move down the menu that holds the item named `name` to it and pick it.
 * The menu's own current item: a window over a list (the pause over the
 * duel's replies) has one of its own. The menu is the list with a name;
 * a group of its items is a list without one.
 */
export const choose = async (page: Page, name: string | RegExp) => {
  const item = screen(page).getByRole('button', { name });
  await expect(item).toBeEnabled();
  const label = (await item.textContent())!.trim();
  // The menu is the named list (a group inside it is a list too)
  const on = item
    .locator('xpath=ancestor::*[(@role="list" or self::ul) and @aria-label][1]')
    .locator('[aria-current=true]');
  for (let i = 0; i < 12; i++) {
    if ((await on.textContent())?.trim() === label) break;
    await press(page, 'ArrowDown');
  }
  await expect(on).toHaveText(label);
  await press(page, 'Enter');
};

/** From the title's splash to the menu */
export const toMenu = async (page: Page) => {
  await open(page);
  await press(page, 'Enter');
  await expect(
    screen(page).getByRole('list', { name: 'Title menu' }),
  ).toBeVisible();
};

/** A new run as the first role and look, on its roster */
export const toRoster = async (page: Page) => {
  await toMenu(page);
  await choose(page, 'Start');
  await expect(screen(page)).toHaveAccessibleName('Pushback, pick a role');
  await press(page, 'Enter');
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
        await press(page, 'ArrowDown');
      }
    }
    await page.keyboard.press('Enter');
    await settle(page, 700);
  }
  throw new Error('the duel did not end in 300 presses');
};
