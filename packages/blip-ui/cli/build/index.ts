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
import { basename, dirname, join, posix } from 'node:path';

import { mdxToMarkdown, summaryOf, titleOf } from './convert.ts';
import {
  type ExampleFile,
  exampleAt,
  exampleOfStory,
  humanize,
  rewriteImports,
  summaryOfExample,
} from './examples.ts';
import { type Rule, sortRules } from '../rules.ts';
import { compoundParts, parseExports } from './exports.ts';
import { checkSidecars } from './sidecar.ts';
import { buildRulesFile, loadCheckNames, loadSidecars } from './sidecars.ts';
import {
  type Manifest,
  type PageKind,
  type PageSource,
  buildManifest,
  undocumented,
  withoutDescription,
} from './manifest.ts';
import { propsSection, readProps } from './props.ts';

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

// The sidecars first: a page's rule blocks print from them
const sidecars = loadSidecars(src);
const { errors, warnings } = checkSidecars(sidecars, {
  pages: new Set(ids),
  checks: loadCheckNames(root),
});
for (const warning of warnings) console.warn(`rules: warning: ${warning}`);
if (errors.length > 0) {
  throw new Error(
    `The rule sidecars have ${errors.length} error${errors.length === 1 ? '' : 's'}:\n${errors.map(error => `  ${error}`).join('\n')}`,
  );
}
const allRules: Rule[] = sidecars.flatMap(sidecar => sidecar.rules);
const lookup = {
  forPage: (page: string) =>
    sortRules(allRules.filter(rule => rule.page === page)),
  whenNotFor: (page: string) =>
    sidecars.find(sidecar => sidecar.page === page)?.whenNot ?? [],
  byId: (id: string) => allRules.find(rule => rule.id === id),
};

const PACKAGE_NAME = '@sebald/blip-ui';

const indexSource = readFileSync(join(src, 'index.ts'), 'utf8');
const exported = new Set(parseExports(indexSource).map(entry => entry.name));

// Examples: `examples/*.tsx` next to a page, imports rewritten for a consumer
const exampleFiles: ExampleFile[] = readdirSync(src, {
  recursive: true,
  encoding: 'utf8',
})
  .map(file => file.split('\\').join('/'))
  .flatMap(path => {
    const at = exampleAt(path);
    if (!at) return [];
    const source = readFileSync(join(src, path), 'utf8');
    return [
      {
        id: `${at.page}/${at.name}`,
        page: at.page,
        path,
        file: `examples/${at.page}/${at.name}.tsx`,
        title: humanize(at.name),
        summary: summaryOfExample(source),
        source: rewriteImports(source, path, exported, PACKAGE_NAME),
      },
    ];
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const unknownPage = exampleFiles.find(example => !ids.includes(example.page));
if (unknownPage) {
  throw new Error(`${unknownPage.path}: there is no page "${unknownPage.page}"`);
}

/** The markdown of the example a story renders, for the `<Canvas>` of that story */
const canvasOf = (mdxFile: string, mdx: string) => {
  const stories = new Map(
    [...mdx.matchAll(/^import \* as (\w+) from '([^']+)';/gm)].map(match => [
      match[1]!,
      posix.normalize(posix.join(posix.dirname(mdxFile), `${match[2]}.tsx`)),
    ]),
  );
  return (namespace: string, story: string) => {
    const path = stories.get(namespace);
    if (!path) return undefined;
    let storySource: string;
    try {
      storySource = readFileSync(join(src, path), 'utf8');
    } catch {
      return undefined;
    }
    const target = exampleOfStory(storySource, path, story);
    const example = exampleFiles.find(example => example.path === target);
    if (!example) return undefined;
    return `\nExample \`${example.id}\` (\`blip examples ${example.id}\`):\n\n\`\`\`tsx\n${example.source.trimEnd()}\n\`\`\`\n`;
  };
};

const pages: PageSource[] = files.map(({ file, id }) => {
  const kind: PageKind = FOUNDATIONS.has(id)
    ? 'foundation'
    : file.startsWith('patterns/')
      ? 'pattern'
      : 'component';
  const mdx = readFileSync(join(src, file), 'utf8');
  const markdown = mdxToMarkdown(
    mdx,
    ids,
    '',
    canvasOf(file.split('\\').join('/'), mdx),
    lookup,
  );
  return {
    id,
    kind,
    markdown,
    prose: mdxToMarkdown(mdx, ids),
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

const entries = parseExports(indexSource).flatMap(
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
  const leak = /^import\b|<(?:Meta|Canvas|Controls|Rules?)\b/m.exec(outside);
  if (leak) throw new Error(`${page.id}: "${leak[0]}" is left after conversion`);
}

// `index.ts` is read for `export { … } from './…'` blocks only
const statements = readFileSync(join(src, 'index.ts'), 'utf8').match(/^export\b/gm) ?? [];
const blocks = readFileSync(join(src, 'index.ts'), 'utf8').match(/^export\s*\{/gm) ?? [];
if (statements.length !== blocks.length) {
  throw new Error('src/index.ts has an export the docs build does not read');
}

// The props come from the type checker; a type that is not readable fails here
const props = readProps(root, entries);
const manifest: Manifest = buildManifest(
  version,
  pages,
  entries,
  props,
  exampleFiles.map(({ id, page, title, summary, file }) => ({
    id,
    page,
    title,
    summary,
    file,
  })),
  allRules,
);

// `<Controls />` becomes the props table, now that the page's exports are known
for (const page of pages) {
  const names = manifest.pages.find(({ id }) => id === page.id)!.exports;
  const section = propsSection(
    page.id,
    names.map(name => [name, manifest.exports[name]!] as const),
  );
  const file = files.find(({ id }) => id === page.id)!.file;
  const source = readFileSync(join(src, file), 'utf8');
  page.markdown = mdxToMarkdown(
    source,
    ids,
    section,
    canvasOf(file.split('\\').join('/'), source),
    lookup,
  );
}

const docs = join(root, 'docs');
rmSync(docs, { recursive: true, force: true });
mkdirSync(join(docs, 'pages'), { recursive: true });
for (const page of pages) {
  writeFileSync(join(docs, 'pages', `${page.id}.md`), page.markdown);
}
for (const example of exampleFiles) {
  mkdirSync(join(docs, dirname(example.file)), { recursive: true });
  writeFileSync(join(docs, example.file), example.source);
}
writeFileSync(
  join(docs, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

const rulesFile = buildRulesFile(version, sidecars);
writeFileSync(
  join(docs, 'rules.json'),
  `${JSON.stringify(rulesFile, null, 2)}\n`,
);

const missing = undocumented(manifest);
const propCount = Object.values(manifest.exports).reduce(
  (sum, entry) => sum + (entry.props?.length ?? 0),
  0,
);
console.log(
  `docs: ${pages.length} pages, ${Object.keys(manifest.exports).length} exports, ${propCount} props, ${exampleFiles.length} examples, ${rulesFile.rules.length} rules`,
);
const bare = withoutDescription(manifest);
if (bare.length > 0) {
  console.log(`docs: ${bare.length} props have no description:`);
  console.log(`  ${bare.join(', ')}`);
}
if (missing.length > 0) {
  console.log(`docs: ${missing.length} exports are on no page:`);
  console.log(`  ${missing.join(', ')}`);
}
