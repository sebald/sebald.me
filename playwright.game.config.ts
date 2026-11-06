import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.GAME_PORT ?? 3000);

/**
 * The game played through its screens (`tests/game`): what a player can
 * do on each, by keys and by touch. No screenshots, so it runs anywhere,
 * against the dev server when one is up.
 */
export default defineConfig({
  testDir: './tests/game',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    // Locally the installed Chrome; CI has Playwright's own
    ...(process.env.CI ? {} : { channel: 'chrome' }),
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
    command: process.env.CI
      ? `pnpm build && pnpm start --port ${PORT}`
      : `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}/lab/pushback`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
