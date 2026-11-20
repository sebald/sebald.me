/**
 * Examples: `.tsx` files in an `examples/` folder next to a page (spec 2.3).
 * Stories import them, and the pack step copies them to `docs/examples/`
 * with their imports rewritten to the package's name, so the file reads as
 * consumer code. A story that renders one is how a `<Canvas>` finds its
 * source.
 */
import { posix } from 'node:path';

export interface ExampleFile {
  /** `dialog/options`: the page and the file's name */
  id: string;
  page: string;
  /** Path under `src/` */
  path: string;
  /** Path of the copy, relative to `docs/` */
  file: string;
  title: string;
  /** What its doc comment says, on one line */
  summary: string;
  /** The source, imports rewritten */
  source: string;
}

/** The page and name of an example by its path under `src/`, or null */
export const exampleAt = (path: string) => {
  const match = /(?:^|\/)([^/]+)\/examples\/([^/]+)\.tsx$/.exec(path);
  return match ? { page: match[1]!, name: match[2]! } : null;
};

/** `in-a-window` is "In a window" */
export const humanize = (name: string) => {
  const text = name.replaceAll('-', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** The doc comment of the exported component, on one line */
export const summaryOfExample = (source: string) => {
  const comment = /\/\*\*([\s\S]*?)\*\/\s*export\s+function\b/.exec(source)?.[1];
  return (comment ?? '')
    .split('\n')
    .map(line => line.replace(/^\s*\*?\s?/, '').trim())
    .filter(Boolean)
    .join(' ');
};

const IMPORT = /^import\s+(type\s+)?([^'";]*?)\s+from\s+'([^']+)';\n/gm;

/**
 * The source with every relative import turned into one import from the
 * package. Throws on a relative import that is not a named import of
 * something `src/index.ts` exports, which a consumer could not write.
 */
export const rewriteImports = (
  source: string,
  path: string,
  exported: ReadonlySet<string>,
  packageName: string,
) => {
  const names: string[] = [];
  const kept: string[] = [];
  const body = source.replace(IMPORT, (whole, typeOnly, clause, from) => {
    if (!from.startsWith('.')) {
      kept.push(whole);
      return '';
    }
    const target = posix.normalize(posix.join(posix.dirname(path), from));
    if (target.startsWith('..') || /\.stories$|\.test$/.test(target)) {
      throw new Error(`${path}: imports ${from}, which a consumer does not have`);
    }
    if (/(^|\/)examples\//.test(target)) {
      throw new Error(`${path}: imports another example (${from})`);
    }
    const list = /^\{([\s\S]*)\}$/.exec(clause.trim())?.[1];
    if (list === undefined) {
      throw new Error(`${path}: ${from} is not a named import`);
    }
    for (const part of list.split(',').map(p => p.trim()).filter(Boolean)) {
      const bare = part.replace(/^type\s+/, '');
      if (!exported.has(bare)) {
        throw new Error(`${path}: ${bare} is not exported from the package`);
      }
      names.push(typeOnly && !part.startsWith('type ') ? `type ${part}` : part);
    }
    return '';
  });
  if (names.length === 0 && kept.length === 0) return body;
  const unique = [...new Set(names)].sort((a, b) =>
    a.replace(/^type\s+/, '').localeCompare(b.replace(/^type\s+/, '')),
  );
  const external = kept.join('');
  const statement =
    unique.length === 0
      ? ''
      : `import { ${unique.join(', ')} } from '${packageName}';\n`.length <= 80
        ? `import { ${unique.join(', ')} } from '${packageName}';\n`
        : `import {\n${unique.map(name => `  ${name},\n`).join('')}} from '${packageName}';\n`;
  return `${external}${external && statement ? '\n' : ''}${statement}${body.startsWith('\n') ? '' : '\n'}${body}`.replace(
    /\n{3,}/g,
    '\n\n',
  );
};

/**
 * The example a story renders: the story's block in its file, and the
 * `./examples/…` import whose local name it uses as a tag
 */
export const exampleOfStory = (
  storiesSource: string,
  storiesPath: string,
  story: string,
): string | null => {
  const start = new RegExp(`export const ${story}\\b`).exec(storiesSource);
  if (!start) return null;
  const rest = storiesSource.slice(start.index + 1);
  const end = rest.search(/\nexport const /);
  const block = end < 0 ? rest : rest.slice(0, end);
  for (const [, specifiers, from] of storiesSource.matchAll(
    /^import\s+\{([^}]*)\}\s+from\s+'(\.[^']*\/examples\/[^']+)';/gm,
  )) {
    for (const part of specifiers!.split(',')) {
      const local = part.trim().split(/\s+as\s+/).pop()!;
      if (local && new RegExp(`<${local}[\\s/>]`).test(block)) {
        return posix.normalize(posix.join(posix.dirname(storiesPath), `${from}.tsx`));
      }
    }
  }
  return null;
};
