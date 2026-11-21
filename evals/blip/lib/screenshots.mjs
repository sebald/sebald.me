// Where the rendered pass (`rendered.mjs`) keeps a run's screenshots, and where
// the judge reads them from: one place, light enough to import without
// Playwright. `<labelDir>/.screenshots/<run id>/<url id>@wide|phone.png`, with
// the run id being `<config>/<run dir>`.

import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const screenshotsDir = (labelDir, runId) =>
  join(labelDir, '.screenshots', runId);

/** A rubric statement's `screenshot` (`<url id>@wide|phone`); a bare url id is the wide one */
export const screenshotName = name =>
  /@(wide|phone)$/.test(name) ? name : `${name}@wide`;

/** The screenshot file of a run for a rubric `screenshot` name, or null when there is none */
export const screenshotFile = (labelDir, runId, name) => {
  const path = join(
    screenshotsDir(labelDir, runId),
    `${screenshotName(name)}.png`,
  );
  return existsSync(path) ? path : null;
};
