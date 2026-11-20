import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { parseExports } from './exports.ts';
import { propsSection, propsTable, readProps } from './props.ts';

const PACKAGE = join(import.meta.dirname, '../..');

/** The components whose props the snapshot pins: variants, a role, a required inherited prop, a layout */
const PINNED = ['Button', 'Dialog', 'IconButton', 'Meter'];

const SNAPSHOT = join(import.meta.dirname, 'props.snapshot.json');

describe('readProps', () => {
  const entries = parseExports(
    readFileSync(join(PACKAGE, 'src/index.ts'), 'utf8'),
  ).filter(entry => PINNED.includes(entry.name));
  const props = readProps(PACKAGE, entries);
  const actual = Object.fromEntries(
    PINNED.map(name => [name, props.get(name)]),
  );

  // Run with UPDATE_SNAPSHOT=1 after a prop changed on purpose
  it('matches the snapshot of four components', () => {
    if (process.env.UPDATE_SNAPSHOT) {
      writeFileSync(SNAPSHOT, `${JSON.stringify(actual, null, 2)}\n`);
    }
    assert.deepEqual(
      actual,
      JSON.parse(readFileSync(SNAPSHOT, 'utf8')),
      'a prop changed: UPDATE_SNAPSHOT=1 pnpm test rewrites cli/build/props.snapshot.json',
    );
  });

  it('lists a variant with its values in the source order and its default', () => {
    const variant = props.get('Button')!.props.find(p => p.name === 'variant');
    assert.deepEqual(variant?.values, ['primary', 'secondary', 'destructive']);
    assert.equal(variant?.default, 'primary');
  });

  it('lists the role of a dialog', () => {
    const role = props.get('Dialog')!.props.find(p => p.name === 'role');
    assert.deepEqual(role?.values, ['dialog', 'alertdialog']);
  });

  it('marks aria-label required on an icon button and names the native props it passes on', () => {
    const label = props
      .get('IconButton')!
      .props.find(p => p.name === 'aria-label');
    assert.equal(label?.required, true);
    assert.match(props.get('Button')!.htmlProps ?? '', /ButtonHTMLAttributes/);
  });

  it('lists no prop that comes from a native element', () => {
    const names = props.get('Button')!.props.map(p => p.name);
    assert.deepEqual(names, ['variant', 'size']);
  });
});

describe('readProps on a type that is not readable', () => {
  const project = (source: string) => {
    const root = mkdtempSync(join(tmpdir(), 'blip-props-'));
    mkdirSync(join(root, 'src'));
    writeFileSync(join(root, 'src/index.ts'), source);
    writeFileSync(
      join(root, 'tsconfig.build.json'),
      JSON.stringify({
        compilerOptions: { strict: true, module: 'esnext', noEmit: true },
        include: ['src'],
      }),
    );
    return root;
  };
  const entries = [{ name: 'Thing', kind: 'component' as const, from: 'index' }];

  it('fails on an indexed access', () => {
    const root = project(`
      const styles = { variant: { a: '', b: '' } };
      type Variants = { variant?: 'a' | 'b' };
      export const Thing = (props: { variant?: Variants['variant'] }) => null;
    `);
    assert.throws(() => readProps(root, entries), /not readable/);
  });

  it('fails on a typeof', () => {
    const root = project(`
      const SIZES = ['a', 'b'] as const;
      export const Thing = (props: { size?: (typeof SIZES)[number] }) => null;
    `);
    assert.throws(() => readProps(root, entries), /not readable/);
  });

  it('passes a literal union', () => {
    const root = project(`
      /** How big @default 'a' */
      export const Thing = (props: { size?: 'a' | 'b' }) => null;
    `);
    const found = readProps(root, entries).get('Thing')!;
    assert.deepEqual(found.props[0]!.values, ['a', 'b']);
  });
});

describe('propsTable and propsSection', () => {
  const prop = {
    name: 'variant',
    type: "'a' | 'b'",
    values: ['a', 'b'],
    default: 'a',
    required: false,
    description: 'How it looks',
  };

  it('escapes pipes in a type and marks required props', () => {
    const table = propsTable([prop, { ...prop, name: 'x', required: true }]);
    assert.match(table, /`'a' \\\| 'b'`/);
    assert.match(table, /`x` \(required\)/);
  });

  it('is empty when a page has no props', () => {
    assert.equal(propsSection('stage', [['Stage', { props: [] }]]), '');
  });

  it('puts the page’s own component first and names the others', () => {
    const section = propsSection('picker', [
      ['PickerItem', { props: [prop] }],
      ['Picker', { props: [prop], htmlProps: 'HTMLAttributes<HTMLDivElement>' }],
    ]);
    assert.ok(section.startsWith('## Props'));
    assert.ok(section.indexOf('### `Picker`') < section.indexOf('### `PickerItem`'));
    assert.match(section, /Also takes the props of `HTMLAttributes<HTMLDivElement>`/);
  });
});
