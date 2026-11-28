import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { headingsOf } from './build/convert.ts';
import type { Manifest, ManifestExample } from './build/manifest.ts';
import type { Rule, RulesFile, WhenNot } from './rules.ts';
import type { SearchExport, SearchPage } from './search.ts';

/**
 * The installed package's `docs/`: the nearest one above this file, which is
 * `dist/cli/` in a tarball and `cli/` in the repo (where the pack step has
 * to have run).
 */
export const findDocsDir = (from = fileURLToPath(import.meta.url)) => {
  // `dist/cli/bin.js` and `cli/bin.ts` are two levels or one under the package
  let dir = dirname(from);
  for (let level = 0; level < 3; level++) {
    if (existsSync(join(dir, 'docs', 'manifest.json')))
      return join(dir, 'docs');
    dir = dirname(dir);
  }
  return null;
};

export interface Docs {
  manifest: Manifest;
  pages: SearchPage[];
  exports: SearchExport[];
  examples: ManifestExample[];
  /** Every rule, the open ones too; none when the docs have no `rules.json` */
  rules: Rule[];
  whenNot: Record<string, WhenNot[]>;
  /** A page's markdown */
  markdown: (id: string) => string;
  /** An example's source */
  source: (example: ManifestExample) => string;
}

export const loadDocs = (docsDir: string): Docs => {
  const manifest = JSON.parse(
    readFileSync(join(docsDir, 'manifest.json'), 'utf8'),
  ) as Manifest;
  const rulesPath = join(docsDir, 'rules.json');
  const rules: RulesFile | null = existsSync(rulesPath)
    ? (JSON.parse(readFileSync(rulesPath, 'utf8')) as RulesFile)
    : null;
  const texts = new Map(
    manifest.pages.map(page => [
      page.id,
      readFileSync(join(docsDir, page.file), 'utf8'),
    ]),
  );
  return {
    manifest,
    pages: manifest.pages.map(page => ({
      id: page.id,
      kind: page.kind,
      title: page.title,
      summary: page.summary,
      headings: headingsOf(texts.get(page.id)!),
      text: texts.get(page.id)!,
    })),
    exports: Object.entries(manifest.exports).map(([name, entry]) => ({
      name,
      ...entry,
    })),
    examples: manifest.examples ?? [],
    rules: rules?.rules ?? [],
    whenNot: rules?.whenNot ?? {},
    markdown: id => texts.get(id)!,
    source: example => readFileSync(join(docsDir, example.file), 'utf8'),
  };
};
