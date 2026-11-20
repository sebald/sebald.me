/**
 * Reads the sidecars and the checks from disk and builds `rules.json`'s
 * content. Pack step only.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

import { type RulesFile, sortRules } from '../rules.ts';
import { type Sidecar, parseSidecar } from './sidecar.ts';

const SUFFIX = '.blip-rules.yaml';

/** Every sidecar under `src/`, by file name */
export const loadSidecars = (src: string): Sidecar[] =>
  readdirSync(src, { recursive: true, encoding: 'utf8' })
    .filter(file => file.endsWith(SUFFIX))
    .sort((a, b) => basename(a).localeCompare(basename(b)))
    .map(file => parseSidecar(readFileSync(join(src, file), 'utf8'), file));

/** The names of the checks, `cli/validate/checks/<name>.ts`: none until `validate` lands */
export const loadCheckNames = (root: string) => {
  const dir = join(root, 'cli', 'validate', 'checks');
  if (!existsSync(dir)) return new Set<string>();
  return new Set(
    readdirSync(dir)
      .filter(file => file.endsWith('.ts') && !/\.(test|d)\.ts$/.test(file))
      .map(file => basename(file, '.ts'))
      .filter(name => name !== 'index'),
  );
};

export const buildRulesFile = (
  version: string,
  sidecars: readonly Sidecar[],
): RulesFile => ({
  version,
  rules: sidecars.flatMap(sidecar => sortRules(sidecar.rules)),
  whenNot: Object.fromEntries(
    sidecars
      .filter(sidecar => sidecar.whenNot.length > 0)
      .map(sidecar => [sidecar.page, sidecar.whenNot]),
  ),
});
