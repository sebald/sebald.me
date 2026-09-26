import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

/**
 * Visual regression tests. Baselines are Linux-only, so always run them in
 * the Playwright Docker image (`pnpm vrt`), never directly on macOS.
 */
export default defineConfig({
  testDir: './tests/visual',
  // One set of baselines for every OS; running outside Docker fails loudly
  snapshotPathTemplate:
    '{testDir}/__screenshots__/{testFilePath}/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    process.env.CI ? ['github'] : ['list'],
    ['html', { open: 'never' }],
  ],
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // The theme is dark and low-contrast; the default (0.2) misses subtle
      // border and radius changes. Docker keeps rendering deterministic.
      threshold: 0.05,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The site's CSS turns off all transitions under reduced motion, so
    // overlays open instantly (`animations: 'disabled'` only acts at capture)
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
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
