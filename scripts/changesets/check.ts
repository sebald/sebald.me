import { getChangedPackagesSinceRef } from '@changesets/git';
import { readChangesets } from '@changesets/read';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { missingPackages } from './missing';

/**
 * Fail when a pull request changes a package's code (`changedFilePatterns`
 * in `.changeset/config.json`) without a changeset that names it.
 * `changeset status` only asks for one changeset of any kind.
 *
 *   node --import tsx scripts/changesets/check.ts [base ref, default origin/main]
 */
const root = path.resolve(__dirname, '../..');
const ref = process.argv[2] ?? 'origin/main';

const main = async () => {
  const config = JSON.parse(
    await readFile(path.join(root, '.changeset/config.json'), 'utf8'),
  ) as { changedFilePatterns?: string[] };

  const changed = (
    await getChangedPackagesSinceRef({
      cwd: root,
      ref,
      changedFilePatterns: config.changedFilePatterns,
    })
  )
    .map(pkg => pkg.packageJson.name)
    .toSorted();
  const changesets = await readChangesets(root, ref);
  const missing = missingPackages(changed, changesets);

  if (missing.length > 0) {
    console.error(
      [
        `Changed since ${ref} without a changeset that names it:`,
        ...missing.map(name => `  - ${name}`),
        '',
        'Run `pnpm changeset` and pick it, or `pnpm changeset --empty` if nothing is released.',
      ].join('\n'),
    );
    process.exit(1);
  }

  console.log(
    changed.length === 0
      ? `No package code changed since ${ref}.`
      : `Changesets cover ${changed.join(', ')}.`,
  );
};

void main();
