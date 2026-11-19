import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { headingsOf } from './build/convert.ts';
import type { Manifest } from './build/manifest.ts';
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
  /** A page's markdown */
  markdown: (id: string) => string;
}

export const loadDocs = (docsDir: string): Docs => {
  const manifest = JSON.parse(
    readFileSync(join(docsDir, 'manifest.json'), 'utf8'),
  ) as Manifest;
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
    markdown: id => texts.get(id)!,
  };
};
