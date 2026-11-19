/**
 * The pack step's docs: `docs/pages/*.md` and `docs/manifest.json`, from the
 * MDX pages and `src/index.ts`. Run by `prepack` as
 * `node dist/cli/build/index.js` from the package's folder.
 */
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

import { mdxToMarkdown, summaryOf, titleOf } from './convert.ts';
import { compoundParts, parseExports } from './exports.ts';
import {
  type PageKind,
  type PageSource,
  buildManifest,
  undocumented,
} from './manifest.ts';

/** Pages about the repo, not about using the kit */
const NOT_SHIPPED = new Set(['building-components']);

/** Pages outside `components/` */
const FOUNDATIONS = new Set(['introduction', 'hooks']);

const root = process.cwd();
const src = join(root, 'src');

const files = readdirSync(src, { recursive: true, encoding: 'utf8' })
  .filter(file => file.endsWith('.mdx'))
  .map(file => ({ file, id: basename(file, '.mdx') }))
  .filter(({ id }) => !NOT_SHIPPED.has(id))
  .sort((a, b) => a.id.localeCompare(b.id));

const ids = files.map(({ id }) => id);

const pages: PageSource[] = files.map(({ file, id }) => {
  const kind: PageKind = FOUNDATIONS.has(id) ? 'foundation' : 'component';
  const markdown = mdxToMarkdown(readFileSync(join(src, file), 'utf8'), ids);
  return {
    id,
    kind,
    markdown,
    title: titleOf(markdown),
    summary: summaryOf(markdown),
  };
});

const readModule = (from: string) => {
  for (const extension of ['tsx', 'ts']) {
    try {
      return readFileSync(join(src, `${from}.${extension}`), 'utf8');
    } catch {}
  }
  return '';
};

const entries = parseExports(readFileSync(join(src, 'index.ts'), 'utf8')).flatMap(
  entry =>
    entry.kind === 'component'
      ? [
          entry,
          ...compoundParts(readModule(entry.from), entry.name).map(name => ({
            ...entry,
            name,
          })),
        ]
      : [entry],
);

const { version } = JSON.parse(
  readFileSync(join(root, 'package.json'), 'utf8'),
) as { version: string };

// A block the conversion missed would ship to every consumer
for (const page of pages) {
  const outside = page.markdown
    .split(/^\s*(?:`{3,}|~{3,}).*$/m)
    .filter((_, index) => index % 2 === 0)
    .join('\n');
  const leak = /^import\b|<(?:Meta|Canvas|Controls)\b/m.exec(outside);
  if (leak) throw new Error(`${page.id}: "${leak[0]}" is left after conversion`);
}

// `index.ts` is read for `export { … } from './…'` blocks only
const statements = readFileSync(join(src, 'index.ts'), 'utf8').match(/^export\b/gm) ?? [];
const blocks = readFileSync(join(src, 'index.ts'), 'utf8').match(/^export\s*\{/gm) ?? [];
if (statements.length !== blocks.length) {
  throw new Error('src/index.ts has an export the docs build does not read');
}

const manifest = buildManifest(version, pages, entries);

const docs = join(root, 'docs');
rmSync(docs, { recursive: true, force: true });
mkdirSync(join(docs, 'pages'), { recursive: true });
for (const page of pages) {
  writeFileSync(join(docs, 'pages', `${page.id}.md`), page.markdown);
}
writeFileSync(
  join(docs, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

const missing = undocumented(manifest);
console.log(
  `docs: ${pages.length} pages, ${Object.keys(manifest.exports).length} exports`,
);
if (missing.length > 0) {
  console.log(`docs: ${missing.length} exports are on no page:`);
  console.log(`  ${missing.join(', ')}`);
}
