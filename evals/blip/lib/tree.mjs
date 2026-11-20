// Layer 1 of the collector, from a run's tree: `tsc`, the build, and what the
// agent's JSX is made of

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseSync } from 'oxc-parser';

export const PACKAGE = '@sebald/blip-ui';

/**
 * The environment of every process the collector starts. `BLIP_EVENTS=off`
 * keeps the CLI from writing to the agent's `.blip/events.jsonl`
 */
export const collectorEnv = (base = process.env) => ({
  ...base,
  BLIP_EVENTS: 'off',
  GIT_OPTIONAL_LOCKS: '0',
  CI: '1',
});

/** Raw tags Blip has a component for: a control, a heading, a list of choices */
export const REPLACEABLE = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'dialog',
  'progress',
  'meter',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'menu',
  'table',
  'nav',
  'details',
  'summary',
]);

/**
 * Classes that place (position, size, grid, flex, margin, gap, overflow)
 * against classes that restyle (colour, font, padding, border, shadow). A
 * margin on a `Button` says nothing about the `Button`
 */
const PLACING =
  /^(?:static|relative|absolute|fixed|sticky|inset|top|right|bottom|left|start|end|z|size|w|h|min-[wh]|max-[wh]|grid|col|row|flex|inline|block|hidden|contents|basis|grow|shrink|order|gap|space-[xy]|m[xytrblse]?|self|justify|items|content|place|overflow|float|clear|aspect|container|columns)(?:-|$)/;

/** The utility of a class without its variants (`tall:`, `*:data-[slot=x]:`) */
export const utilityOf = token => token.split(/:(?![^[(]*[\])])/).at(-1);

export const places = token =>
  PLACING.test(utilityOf(token).replace(/^[!-]+/, ''));

const lineStarts = source => {
  const starts = [0];
  for (let i = 0; i < source.length; i++)
    if (source[i] === '\n') starts.push(i + 1);
  return starts;
};

const lineAt = (starts, offset) => {
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (starts[mid] <= offset) low = mid;
    else high = mid - 1;
  }
  return low + 1;
};

const walk = (node, visit) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit);
    return;
  }
  if (typeof node.type === 'string') visit(node);
  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;
    const value = node[key];
    if (value && typeof value === 'object') walk(value, visit);
  }
};

/** Every string the expression of a `className` is made of */
const stringsOf = node => {
  const found = [];
  const skip = [];
  walk(node, n => {
    // `state === 'open' ? 'a' : 'b'`: 'open' is not a class
    if (n.type === 'ConditionalExpression')
      skip.push([n.test.start, n.test.end]);
    if (n.type === 'BinaryExpression') skip.push([n.start, n.end]);
  });
  walk(node, n => {
    const isString = n.type === 'Literal' && typeof n.value === 'string';
    if (!isString && n.type !== 'TemplateElement') return;
    if (skip.some(([from, to]) => n.start >= from && n.end <= to)) return;
    found.push(isString ? n.value : (n.value?.cooked ?? n.value?.raw ?? ''));
  });
  return found;
};

const nameOf = node => {
  if (node.type === 'JSXIdentifier')
    return { root: node.name, path: [node.name] };
  if (node.type === 'JSXMemberExpression') {
    const object = nameOf(node.object);
    return { root: object.root, path: [...object.path, node.property.name] };
  }
  return null;
};

const originOf = from => {
  if (from === PACKAGE || from.startsWith(`${PACKAGE}/`)) return 'blip';
  if (from.startsWith('.') || from.startsWith('@/') || from.startsWith('~/'))
    return 'own';
  return 'other';
};

/**
 * What one source file holds: its imports from Blip and its JSX elements,
 * each with the line it starts on and its classes
 */
export const analyseSource = (file, source) => {
  const { program } = parseSync(file, source, { lang: 'tsx' });
  const starts = lineStarts(source);
  const imported = new Map();
  const imports = [];
  const elements = [];

  walk(program, node => {
    if (node.type === 'ImportDeclaration') {
      const from = node.source.value;
      for (const spec of node.specifiers ?? []) {
        const local = spec.local.name;
        if (spec.type === 'ImportSpecifier') {
          const name = spec.imported.name ?? spec.imported.value;
          imported.set(local, { from, name });
          if (from === PACKAGE) {
            imports.push({
              name,
              type: node.importKind === 'type' || spec.importKind === 'type',
              line: lineAt(starts, spec.start),
            });
          }
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          imported.set(local, { from, name: null });
        } else {
          imported.set(local, { from, name: 'default' });
        }
      }
    } else if (node.type === 'JSXOpeningElement') {
      const name = nameOf(node.name);
      const line = lineAt(starts, node.start);
      let classes = null;
      let style = false;
      for (const attr of node.attributes ?? []) {
        if (attr.type !== 'JSXAttribute') continue;
        if (attr.name.name === 'style') style = true;
        if (attr.name.name === 'className') {
          const tokens = (attr.value ? stringsOf(attr.value) : [])
            .flatMap(s => s.split(/\s+/))
            .filter(Boolean);
          classes = { line: lineAt(starts, attr.start), tokens };
        }
      }
      if (!name) {
        elements.push({ kind: 'other', tag: '?', line, classes, style });
      } else if (name.path.length === 1 && /^[a-z]/.test(name.root)) {
        elements.push({ kind: 'raw', tag: name.root, line, classes, style });
      } else {
        const from = imported.get(name.root);
        const origin = from ? originOf(from.from) : 'own';
        let display = name.path.join('.');
        if (origin === 'blip') {
          // `import { Tabs as T }` is `Tabs`; `import * as B` drops the `B.`
          display =
            from.name === null
              ? name.path.slice(1).join('.')
              : [
                  from.name === 'default' ? name.root : from.name,
                  ...name.path.slice(1),
                ].join('.');
        }
        elements.push({ kind: origin, tag: display, line, classes, style });
      }
    }
  });

  return { imports, elements };
};

const walkFiles = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
    a.name < b.name ? -1 : 1,
  )) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(path, out);
    else if (/\.(tsx|jsx)$/.test(entry.name)) out.push(path);
  }
  return out;
};

const git = (cwd, args) =>
  execFileSync('git', args, {
    cwd,
    env: collectorEnv(),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });

/**
 * The lines changed since the run's first commit, by file under `src/`
 * (`'all'` for a file the agent added without committing it)
 */
export const changedLines = cwd => {
  const root = git(cwd, ['rev-list', '--max-parents=0', 'HEAD'])
    .trim()
    .split('\n')
    .at(-1);
  const changed = new Map();
  let file = null;
  for (const line of git(cwd, [
    '-c',
    'core.quotePath=false',
    'diff',
    '-U0',
    '--no-color',
    '--no-renames',
    '--src-prefix=a/',
    '--dst-prefix=b/',
    root,
    '--',
    'src',
  ]).split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line === '+++ /dev/null' ? null : line.slice(6);
    } else if (file && line.startsWith('@@')) {
      const match = /\+(\d+)(?:,(\d+))?/.exec(line);
      const from = Number(match[1]);
      const count = match[2] === undefined ? 1 : Number(match[2]);
      const set = changed.get(file) ?? new Set();
      for (let i = 0; i < count; i++) set.add(from + i);
      changed.set(file, set);
    }
  }
  for (const added of git(cwd, [
    '-c',
    'core.quotePath=false',
    'ls-files',
    '-o',
    '--exclude-standard',
    '--',
    'src',
  ])
    .split('\n')
    .filter(Boolean)) {
    changed.set(added, 'all');
  }
  return changed;
};

const counter = () => ({});
const bump = (counts, key, by = 1) => {
  counts[key] = (counts[key] ?? 0) + by;
};
const sorted = counts =>
  Object.fromEntries(
    Object.entries(counts).sort(([a], [b]) => (a < b ? -1 : 1)),
  );

/** The names the installed package exports (a value import of another is invented) */
export const packageExports = cwd => {
  const manifest = join(cwd, 'node_modules', PACKAGE, 'docs', 'manifest.json');
  if (!existsSync(manifest)) return null;
  try {
    const { exports } = JSON.parse(readFileSync(manifest, 'utf8'));
    return new Set(Object.keys(exports).map(name => name.split('.')[0]));
  } catch {
    return null;
  }
};

/**
 * Counts what the agent's `src/` is made of. With `scope: 'changed-lines'`
 * only elements, classes and imports on lines changed since the first commit
 * count in the totals; the overrides that recur (Q11) are always taken from
 * changed lines, so a file the agent never touched can't make a candidate
 */
export const analyseTree = (cwd, scope) => {
  const known = packageExports(cwd);
  const changed = changedLines(cwd);
  const isChanged = (file, line) => {
    const lines = changed.get(file);
    return lines === 'all' || (lines?.has(line) ?? false);
  };

  const rawTags = counter();
  const components = { blip: 0, own: 0, other: 0 };
  const blipComponents = counter();
  const classNames = {
    total: 0,
    onBlip: 0,
    onRaw: 0,
    placing: 0,
    restyling: 0,
  };
  const inventedImports = [];
  const overrides = [];
  let inlineStyles = 0;
  let rawControls = 0;
  let wrappers = 0;
  let importsFromBlip = 0;

  for (const path of walkFiles(join(cwd, 'src'))) {
    const file = relative(cwd, path).split(sep).join('/');
    const { imports, elements } = analyseSource(
      file,
      readFileSync(path, 'utf8'),
    );

    for (const imp of imports) {
      if (scope !== 'all' && !isChanged(file, imp.line)) continue;
      if (!imp.type) importsFromBlip++;
      if (!imp.type && known && !known.has(imp.name))
        inventedImports.push(imp.name);
    }

    for (const element of elements) {
      const changedHere = isChanged(file, element.line);
      const countedElement = scope === 'all' || changedHere;
      const classesChanged =
        element.classes && isChanged(file, element.classes.line);
      const countedClasses =
        element.classes && (scope === 'all' || classesChanged);

      if (countedElement) {
        if (element.kind === 'raw') {
          bump(rawTags, element.tag);
          if (REPLACEABLE.has(element.tag)) rawControls++;
          else wrappers++;
        } else if (element.kind === 'blip') {
          components.blip++;
          bump(blipComponents, element.tag);
        } else if (element.kind === 'own') components.own++;
        else components.other++;
        if (element.style) inlineStyles++;
      }

      if (countedClasses) {
        classNames.total++;
        if (element.kind === 'blip') classNames.onBlip++;
        else classNames.onRaw++;
        for (const token of element.classes.tokens) {
          if (places(token)) classNames.placing++;
          else classNames.restyling++;
        }
      }

      if (element.kind === 'raw' || element.kind === 'blip') {
        const bare = element.kind === 'raw' && !element.classes && changedHere;
        if (
          (element.classes && classesChanged) ||
          (bare && REPLACEABLE.has(element.tag))
        ) {
          const restyle = [
            ...new Set(
              (element.classes?.tokens ?? []).filter(token => !places(token)),
            ),
          ].sort();
          if (
            restyle.length > 0 ||
            (element.kind === 'raw' && REPLACEABLE.has(element.tag))
          ) {
            overrides.push({
              key: `${element.kind}:${element.tag}|${restyle.join(',')}`,
              kind: element.kind,
              element: element.tag,
              classes: restyle,
              file,
              line: element.classes?.line ?? element.line,
            });
          }
        }
      }
    }
  }

  return {
    scope,
    rawTags: {
      total: Object.values(rawTags).reduce((a, b) => a + b, 0),
      controls: rawControls,
      wrappers,
      byTag: sorted(rawTags),
    },
    components: { ...components, blipByName: sorted(blipComponents) },
    classNames,
    inlineStyles,
    // null: no manifest in the run, so not measured
    imports: {
      fromBlip: importsFromBlip,
      invented: known ? inventedImports.sort() : null,
    },
    overrides,
  };
};

const run = (cwd, command, args) => {
  const bin = join(cwd, 'node_modules', '.bin', command);
  if (!existsSync(bin)) return { ran: false, ok: null, errors: null };
  const done = spawnSync(bin, args, {
    cwd,
    env: collectorEnv(),
    encoding: 'utf8',
    timeout: 5 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `${done.stdout ?? ''}\n${done.stderr ?? ''}`;
  return {
    ran: true,
    ok: done.status === 0,
    errors: output.match(/\berror TS\d+/g)?.length ?? 0,
  };
};

/** `tsc --noEmit` and `vite build` with what the run installed */
export const checkBuild = cwd => ({
  tsc: run(cwd, 'tsc', ['--noEmit']),
  build: run(cwd, 'vite', ['build']),
});
