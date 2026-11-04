import { defineConfig, devices } from '@playwright/test';

const PORT = 6106;

/**
 * Visual regression tests of the kit's stories. Like the site's, the
 * baselines are Linux-only: run them in the Playwright Docker image
 * (`pnpm vrt:dither-ui` from the repo root), never directly on macOS.
 */
export default defineConfig({
  testDir: './tests/visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    process.env.CI ? ['github'] : ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  outputDir: 'test-results',
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      // Pixel art on a dark ground: a pixel off is the regression
      threshold: 0.05,
    },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 960, height: 600 },
      },
    },
  ],
  webServer: {
    command: `pnpm build-storybook && node tests/serve.mjs ${PORT}`,
    url: `http://localhost:${PORT}/index.json`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
