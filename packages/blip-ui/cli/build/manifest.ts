import type { ExportKind, PublicExport } from './exports.ts';

export type PageKind = 'component' | 'pattern' | 'foundation';

export interface Page {
  id: string;
  kind: PageKind;
  title: string;
  summary: string;
  /** Path of its markdown file, relative to `docs/` */
  file: string;
  exports: string[];
  rules: string[];
  examples: string[];
}

export interface ManifestExport {
  /** The page it is on, or null when it is on none */
  page: string | null;
  kind: ExportKind;
}

export interface Manifest {
  version: string;
  pages: Page[];
  exports: Record<string, ManifestExport>;
  examples: never[];
}

export interface PageSource {
  id: string;
  kind: PageKind;
  /** The page as markdown */
  markdown: string;
  title: string;
  summary: string;
}

/**
 * Whether a page names an export. A capitalised name is a word of its own
 * (also `Stage.Center`, where `.` is no boundary); a lowercase one (`px`,
 * `lit`) is also an ordinary word, so it counts only in a code span.
 */
const mentions = (markdown: string, name: string) => {
  const escaped = name.replaceAll('.', '\\.');
  return new RegExp(
    /^[a-z]/.test(name)
      ? `(?<=\`)${escaped}(?!\\w)`
      : `(?<![\\w.])${escaped}(?!\\w)`,
  ).test(markdown);
};

/**
 * The page an export is on: the one of its component's folder when that page
 * names it, else the first page that does
 */
export const pageOf = (
  entry: PublicExport,
  pages: readonly PageSource[],
): string | null => {
  const folder = /^components\/([^/]+)\//.exec(entry.from)?.[1];
  const own = pages.find(page => page.id === folder);
  if (own && mentions(own.markdown, entry.name)) return own.id;
  return pages.find(page => mentions(page.markdown, entry.name))?.id ?? null;
};

export const buildManifest = (
  version: string,
  pages: readonly PageSource[],
  entries: readonly PublicExport[],
): Manifest => {
  const exports: Record<string, ManifestExport> = Object.fromEntries(
    entries.map(entry => [
      entry.name,
      { page: pageOf(entry, pages), kind: entry.kind },
    ]),
  );
  return {
    version,
    pages: pages.map(page => ({
      id: page.id,
      kind: page.kind,
      title: page.title,
      summary: page.summary,
      file: `pages/${page.id}.md`,
      exports: Object.entries(exports)
        .filter(([, entry]) => entry.page === page.id)
        .map(([name]) => name),
      rules: [],
      examples: [],
    })),
    exports,
    examples: [],
  };
};

/** Value exports on no page; types follow their component and are not asked for */
export const undocumented = (manifest: Manifest) =>
  Object.entries(manifest.exports)
    .filter(([, entry]) => entry.page === null && entry.kind !== 'type')
    .map(([name]) => name);
