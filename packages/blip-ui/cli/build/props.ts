/**
 * Every component's props, from the type checker: the one module of the pack
 * step that asks it (Q5). `typescript/unstable/sync` is unstable on purpose
 * pinned (the package's `typescript`), runs only here, and `props.test.ts`
 * snapshots four components, so a break shows on a version bump.
 *
 * Props written in the component's own source are listed one by one, with
 * their description and `@default` from the JSDoc. What a component inherits
 * from a library (the native attributes of a `button`) is named once, as
 * `htmlProps`, not listed.
 */
import { join } from 'node:path';

import {
  API,
  type Checker,
  type Symbol as TsSymbol,
  type Type,
  SignatureKind,
  SymbolFlags,
} from 'typescript/unstable/sync';

import type { PublicExport } from './exports.ts';

export interface PropInfo {
  name: string;
  /** The type as the source writes it: `'primary' | 'secondary'` */
  type: string;
  /** The literal values it takes, in the order the source lists them; empty for other types */
  values: string[];
  /** `@default` from its JSDoc, without quotes around a string; null when it has none */
  default: string | null;
  required: boolean;
  description: string;
}

export interface ExportProps {
  /** What it passes on to a native element, as the source says it (`ButtonHTMLAttributes<HTMLButtonElement>`); null when nothing */
  htmlProps: string | null;
  props: PropInfo[];
}

/** An indexed access or a `typeof` is what `readable-types` removed; none may come back */
const UNREADABLE = /\btypeof\b|[\w)]\[\s*['"A-Za-z]/;

const collapse = (text: string) => text.replace(/\s+/g, ' ').trim();

const withoutUndefined = (text: string) =>
  text.replace(/\s*\|\s*undefined\s*$/, '').replace(/^undefined\s*\|\s*/, '');

const fromLibrary = (fileName: string) => fileName.includes('/node_modules/');

/** The members of a union, or the type itself */
const members = (type: Type): Type[] =>
  type.isUnionType() ? [...type.getTypes()] : [type];

/** Whether an indexed access or `keyof` is left anywhere in a resolved type */
const holdsDeferred = (type: Type, seen = new Set<number>()): boolean => {
  if (seen.has(type.id)) return false;
  seen.add(type.id);
  if (type.isIndexedAccessType() || type.isIndexType()) return true;
  if (type.isUnionType() || type.isIntersectionType())
    return type.getTypes().some(inner => holdsDeferred(inner, seen));
  return false;
};

const tagText = (symbol: TsSymbol, checker: Checker, name: string) =>
  symbol.getJsDocTags(checker).find(tag => tag.name === name)?.text;

const readProp = (
  prop: TsSymbol,
  checker: Checker,
  owner: string,
): PropInfo => {
  const declaration = prop.declarations
    .map(handle => handle.resolve())
    .find(node => node && !fromLibrary(node.getSourceFile().fileName)) as
    | { type?: { getText(): string } }
    | undefined;
  const type = checker.getTypeOfSymbol(prop)!;
  const resolved = collapse(withoutUndefined(checker.typeToString(type)));
  const written = declaration?.type && !/\/[/*]/.test(declaration.type.getText())
    ? collapse(withoutUndefined(declaration.type.getText()))
    : resolved;

  if (UNREADABLE.test(written) || UNREADABLE.test(resolved) || holdsDeferred(type)) {
    throw new Error(
      `${owner}: the type of "${prop.name}" is not readable (${written}). ` +
        'Write the values out as a literal union (Q5)',
    );
  }

  const found = members(type).flatMap(member =>
    member.isStringLiteralType() || member.isNumberLiteralType()
      ? [String(member.value)]
      : [],
  );
  const quoted = (value: string) =>
    written.includes(`'${value}'`) ? written.indexOf(`'${value}'`) : -1;
  // The source's order when it spells the values out, else the checker's
  const values = found.every(value => quoted(value) >= 0)
    ? [...found].sort((a, b) => quoted(a) - quoted(b))
    : found;

  const tag = tagText(prop, checker, 'default');
  return {
    name: prop.name,
    type: written,
    values,
    default: tag === undefined ? null : tag.replace(/^(['"`])(.*)\1$/, '$2'),
    required: !(prop.flags & SymbolFlags.Optional),
    description: collapse(prop.getDocumentationComment(checker)),
  };
};

/**
 * What a component passes on to a native element: the `extends …` of the
 * interface that types its props, when what it inherits is a library's
 * `…Attributes`. Null when it inherits nothing from one (`children` is no element's).
 */
const htmlPropsOf = (
  checker: Checker,
  propsType: Type,
  inherited: readonly TsSymbol[],
): string | null => {
  // A native element's attributes are the ones whose handlers name its element
  const element = inherited
    .map(prop => /\bHTML\w*Element\b/.exec(checker.typeToString(checker.getTypeOfSymbol(prop)!))?.[0])
    .find(Boolean);
  if (!element) return null;
  const text = propsType
    .getSymbol()
    ?.declarations.map(handle => handle.resolve()?.getText() ?? '')
    .join('\n');
  const heritage = /\bextends\s+([^{]+?)\s*\{/.exec(text ?? '')?.[1];
  return heritage
    ? collapse(heritage).replace(/<\s+/g, '<').replace(/\s+>/g, '>').replace(/,\s*>/g, '>')
    : `HTMLAttributes<${element}>`;
};

/**
 * The props of each component export. `exports` are the entries of
 * `src/index.ts` (and compound parts such as `Stage.Center`); anything that is
 * not a function of one props object is left out.
 */
export const readProps = (
  root: string,
  entries: readonly PublicExport[],
  tsconfig = 'tsconfig.build.json',
): Map<string, ExportProps> => {
  const result = new Map<string, ExportProps>();
  const api = new API({ cwd: root });
  try {
    const snapshot = api.updateSnapshot({
      openProject: join(root, tsconfig),
    });
    const project = snapshot.getProjects()[0];
    if (!project) throw new Error(`${tsconfig} opens no project`);
    const { checker, program } = project;
    const index = program.getSourceFile(join(root, 'src/index.ts'));
    const indexModule = index && checker.getSymbolAtLocation(index);
    if (!indexModule) throw new Error('src/index.ts is not in the program');
    const exported = new Map(
      checker.getExportsOfModule(indexModule).map(symbol => [symbol.name, symbol]),
    );

    for (const entry of entries) {
      if (entry.kind !== 'component') continue;
      const [name, part] = entry.name.split('.') as [string, string?];
      let symbol = exported.get(name);
      if (symbol && part) {
        const type = checker.getTypeOfSymbol(symbol);
        symbol = type && checker.getPropertyOfType(type, part);
      }
      const type = symbol && checker.getTypeOfSymbol(symbol);
      if (!type) continue;
      const parameter = checker
        .getSignaturesOfType(type, SignatureKind.Call)[0]
        ?.getParameters()[0];
      const propsType = parameter && checker.getTypeOfSymbol(parameter);
      if (!propsType) {
        result.set(entry.name, { htmlProps: null, props: [] });
        continue;
      }
      const all = checker.getPropertiesOfType(propsType);
      const own = all.filter(prop =>
        prop.declarations.some(
          handle => !fromLibrary(handle.resolve()?.getSourceFile().fileName ?? ''),
        ),
      );
      result.set(entry.name, {
        htmlProps: htmlPropsOf(
          checker,
          propsType,
          all.filter(prop => !own.includes(prop)),
        ),
        props: own.map(prop => readProp(prop, checker, entry.name)),
      });
    }
  } finally {
    api.close();
  }
  return result;
};

/** A props table as markdown; empty when there is nothing to list */
export const propsTable = (props: readonly PropInfo[]) => {
  if (props.length === 0) return '';
  const cell = (text: string) => text.replaceAll('|', '\\|');
  const rows = props.map(prop =>
    [
      `\`${prop.name}\`${prop.required ? ' (required)' : ''}`,
      `\`${cell(prop.type)}\`${
        prop.values.length > 0 && !prop.type.includes("'")
          ? `: ${prop.values.map(value => `\`${value}\``).join(' \\| ')}`
          : ''
      }`,
      prop.default === null ? '' : `\`${cell(prop.default)}\``,
      cell(prop.description),
    ].join(' | '),
  );
  return [
    '| Prop | Type | Default | Description |',
    '| --- | --- | --- | --- |',
    ...rows.map(row => `| ${row} |`),
  ].join('\n');
};

/**
 * The `## Props` section that takes the place of Storybook's `<Controls />`:
 * one table per component of the page that has props, the page's own
 * component first. Empty when no component of the page has any.
 */
export const propsSection = (
  page: string,
  exports: readonly (readonly [
    string,
    { props?: PropInfo[]; htmlProps?: string | null },
  ])[],
) => {
  const own = page.replaceAll('-', '');
  const listed = exports
    .filter(([, entry]) => entry.props && entry.props.length > 0)
    .sort(
      ([a], [b]) =>
        Number(b.toLowerCase() === own) - Number(a.toLowerCase() === own),
    );
  if (listed.length === 0) return '';
  const lines = ['## Props', ''];
  for (const [name, entry] of listed) {
    if (listed.length > 1) lines.push(`### \`${name}\``, '');
    lines.push(propsTable(entry.props!), '');
    if (entry.htmlProps) {
      lines.push(`Also takes the props of \`${entry.htmlProps}\`.`, '');
    }
  }
  return lines.join('\n').trimEnd();
};
