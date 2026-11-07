import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.GAME_PORT ?? 3000);

/** In the Playwright image (`pnpm vrt:game`) or CI, where screenshots match */
const LINUX = process.platform === 'linux';

/**
 * The game played through its screens (`tests/game`): what a player can
 * do on each, by keys and by touch, anywhere, against the dev server
 * when one is up. The screenshots of each screen (`@screens`) only on
 * Linux: their baselines are the Playwright image's, like the site's.
 */
export default defineConfig({
  testDir: './tests/game',
  // `GAME_SCREENS=1` runs them elsewhere too, to try a change (not to commit)
  grepInvert: LINUX || process.env.GAME_SCREENS ? undefined : /@screens/,
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      stylePath: './tests/game/screens.css',
      // Dark and low-contrast pixel art: the default (0.2) misses a
      // changed frame line
      threshold: 0.05,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    // On a Mac the installed Chrome; the Playwright image has its own
    ...(LINUX ? {} : { channel: 'chrome' }),
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // Built in CI and the Playwright image: no dev overlay in a screenshot
    command:
      process.env.CI || LINUX
        ? `pnpm build && pnpm start --port ${PORT}`
        : `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}/lab/pushback`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
