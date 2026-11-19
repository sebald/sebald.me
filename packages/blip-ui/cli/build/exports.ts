/**
 * What `src/index.ts` exports, read as text: the file only re-exports, one
 * `export { … } from '…'` block per module. TypeScript 7 has no in-process
 * parser, and the type checker is for props, which come later.
 */

export type ExportKind =
  | 'component'
  | 'hook'
  | 'context'
  | 'constant'
  | 'function'
  | 'type';

export interface PublicExport {
  /** `Stage`, or `Stage.Center` for a part attached to a component */
  name: string;
  kind: ExportKind;
  /** The module it comes from, relative to `src/` without an extension */
  from: string;
}

const kindOf = (name: string, isType: boolean): ExportKind => {
  if (isType) return 'type';
  if (/^use[A-Z]/.test(name)) return 'hook';
  if (name.endsWith('Context')) return 'context';
  if (/^[A-Z0-9_]+$/.test(name)) return 'constant';
  if (/^[A-Z]/.test(name)) return 'component';
  return 'function';
};

/** The names `export { … } from '…'` blocks re-export, with their modules */
export const parseExports = (source: string): PublicExport[] =>
  [
    ...source
      .replace(/\/\/.*$/gm, '')
      .matchAll(/export\s*\{([^}]*)\}\s*from\s*['"]\.\/([^'"]+)['"]/g),
  ].flatMap(([, names, from]) =>
    names!
      .split(',')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const isType = /^type\s/.test(part);
        const name = part
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)
          .pop()!;
        return { name, kind: kindOf(name, isType), from: from! };
      }),
  );

/**
 * The parts a module hangs on a component (`Stage.Center = Center`), which
 * `index.ts` does not list because they come with it
 */
export const compoundParts = (source: string, name: string) =>
  [
    ...source.matchAll(new RegExp(`^${name}\\.([A-Za-z]\\w*)\\s*=`, 'gm')),
  ].map(match => `${name}.${match[1]}`);
