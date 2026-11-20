import {
  choose,
  eventsOf,
  expect,
  openWith,
  playDuel,
  press,
  recordEvents,
  saveWith,
  screen,
  test,
  toBossDuel,
  toRoster,
} from './game';

/**
 * What the game tells its host (`onEvent`, and the DOM event the suite
 * listens to): the moments of a run in the order they happen
 */
test.describe('the events', () => {
  test.skip(({ isMobile }) => isMobile, 'played by keys');

  test('a new run, a duel won', async ({ page }) => {
    await recordEvents(page);
    await toRoster(page);
    await page.keyboard.press('Enter');
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');

    const events = await eventsOf(page);
    expect(events.map(e => e.type)).toEqual([
      'game:open',
      'screen',
      'screen',
      'run:start',
      'screen',
      'duel:start',
      'screen',
      'duel:end',
      'screen',
    ]);
    expect(events[0]).toEqual({
      type: 'game:open',
      returning: false,
      running: false,
      mode: 'easy',
    });
    expect(events.filter(e => e.type === 'screen')).toEqual(
      ['title', 'select', 'roster', 'duel', 'roster'].map(name => ({
        type: 'screen',
        name,
      })),
    );
    expect(events[3]).toMatchObject({ role: 'pm', look: 'a', replaced: false });
    expect(events[5]).toMatchObject({
      tier: 1,
      attempt: 'first',
      tutorial: true,
    });
    expect(events[7]).toMatchObject({
      result: 'won',
      opponent: (events[5] as { opponent: string }).opponent,
    });
  });

  test('a duel paused and left', async ({ page }) => {
    await recordEvents(page);
    await toRoster(page);
    await page.keyboard.press('Enter');
    await expect(screen(page)).toHaveAccessibleName(/duel against/);
    await press(page, 'Escape');
    await choose(page, 'Back to the roster');
    await press(page, 'ArrowDown');
    await press(page, 'Enter');
    await expect(screen(page)).toHaveAccessibleName('Pushback, roster');

    const types = (await eventsOf(page)).map(e => e.type);
    expect(types.slice(-4)).toEqual([
      'screen',
      'duel:pause',
      'duel:leave',
      'screen',
    ]);
    expect(types).not.toContain('duel:end');
  });

  test('a returning player continues and ships the role', async ({ page }) => {
    await recordEvents(page);
    await toBossDuel(page);
    await playDuel(page);
    await expect(screen(page)).toHaveAccessibleName('Pushback, result');

    const events = await eventsOf(page);
    expect(events[0]).toMatchObject({
      type: 'game:open',
      returning: true,
      running: true,
    });
    expect(events.find(e => e.type === 'run:continue')).toMatchObject({
      role: 'pm',
      beaten: 3,
    });
    expect(events.find(e => e.type === 'duel:start')).toMatchObject({
      tier: 'boss',
    });
    expect(events.slice(-3).map(e => e.type)).toEqual([
      'duel:end',
      'run:finish',
      'screen',
    ]);
    expect(events.at(-2)).toMatchObject({ role: 'pm', mode: 'easy' });
  });

  test("the title's views are screens too", async ({ page }) => {
    await recordEvents(page);
    await openWith(page, saveWith({ beaten: 1 }));
    await press(page, 'Enter');
    await choose(page, 'Options');
    const events = await eventsOf(page);
    expect(events.at(-1)).toEqual({ type: 'screen', name: 'options' });
  });
});
