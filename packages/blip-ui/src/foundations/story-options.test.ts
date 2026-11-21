import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { describe, it } from 'node:test';

/**
 * A prop that picks from options says them in its type, a union of
 * strings in the component's props (`variant?: 'primary' | 'secondary'`),
 * and the cva variants are checked against it with `satisfies`. A story
 * offers the same values again as its control's `options`, written out
 * so Storybook can list them. These tests read both from the sources and
 * fail when a story's list differs from the prop's, so a value added or
 * dropped in one shows up in the other.
 */

const ROOT = join(import.meta.dirname, '../components');

const files = readdirSync(ROOT, { recursive: true, encoding: 'utf8' });

/** The strings in a list written out: `'a', 'b'` */
const literals = (list: string) =>
  [...list.matchAll(/'([^']*)'/g)].map(match => match[1]!);

/**
 * Options not written out, and why they are right without a check: the
 * icons' names are the keys of `ICONS`, which is checked against `IconName`
 */
const DERIVED = new Set(['Object.keys(ICONS) as IconName[]', 'NAMES']);

/**
 * Every control with options in a story file: its prop (on the line, or
 * the nearest less indented `prop: {` above) and the options written out,
 * or `undefined` where they are one of `DERIVED`. Throws on any other
 * expression, so no control is skipped without a reason.
 */
/** A control's prop and its options, `undefined` where they are derived */
type Control = { prop: string | undefined; options: string[] | undefined };

const storyOptions = (file: string): Control[] => {
  const lines = readFileSync(join(ROOT, file), 'utf8').split('\n');
  return lines.flatMap((line, at): Control[] => {
    const option = line.indexOf('options:');
    if (option < 0) return [];
    let prop = /^\s*(\w+): \{/.exec(line.slice(0, option))?.[1];
    for (let above = at - 1; !prop && above >= 0; above--) {
      const open = /^(\s*)(\w+): \{\s*$/.exec(lines[above]!);
      if (open && open[1]!.length < option) prop = open[2];
    }
    const rest = [
      line.slice(option + 'options:'.length),
      ...lines.slice(at + 1),
    ]
      .join('\n')
      .trimStart();
    if (rest.startsWith('['))
      return [{ prop, options: literals(rest.slice(0, rest.indexOf(']'))) }];
    const expression = /^[^,}\n]*/.exec(rest)![0].trim();
    if (DERIVED.has(expression)) return [{ prop, options: undefined }];
    throw new Error(
      `${file}:${at + 1} offers ${prop}'s options as \`${expression}\`: write them out, or add it to DERIVED with why it is right`,
    );
  });
};

/** Each union a prop of that name has in the folder's components */
const propUnions = (folder: string, prop: string) => {
  const declaration = new RegExp(
    `\\n\\s+${prop}\\?:\\s*(?:\\|\\s*)?('[^']*'(?:\\s*\\|\\s*'[^']*')*);`,
    'g',
  );
  return files
    .filter(
      file =>
        dirname(file) === folder &&
        /\.tsx?$/.test(file) &&
        !/\.(stories|test|styles)\.tsx?$/.test(file),
    )
    .flatMap(file => [
      ...readFileSync(join(ROOT, file), 'utf8').matchAll(declaration),
    ])
    .map(match => literals(match[1]!));
};

/** The `@default` a prop of that name has in the folder's components */
const propDefaults = (folder: string, prop: string) => {
  const declaration = new RegExp(
    `@default '([^']*)'\\s*\\*/\\s*${prop}\\?:`,
    'g',
  );
  return files
    .filter(
      file => dirname(file) === folder && /^[^.]+\.tsx?$/.test(basename(file)),
    )
    .flatMap(file => [
      ...readFileSync(join(ROOT, file), 'utf8').matchAll(declaration),
    ])
    .map(match => match[1]!);
};

/**
 * The `Overview` story's source, and the lists written out in the file
 * that it maps over (`VARIANTS.flatMap(…)`)
 */
const overview = (file: string) => {
  const source = readFileSync(join(ROOT, file), 'utf8');
  const start = source.indexOf('export const Overview');
  if (start < 0) return undefined;
  const body = source.slice(start, source.indexOf('\n};', start));
  const lists = [...source.matchAll(/\nconst (\w+) = \[([^\]]*)\]/g)]
    .filter(match => new RegExp(`\\b${match[1]}\\b`).test(body))
    .map(match => literals(match[2]!));
  return { body, lists };
};

const stories = files.filter(file => file.endsWith('.stories.tsx'));

/**
 * Props whose values look alike, so the Overview (what the visual tests
 * compare) needn't show each: an `alertdialog` is drawn as a `dialog`
 */
const LOOK_ALIKE = new Set(['dialog/dialog.stories.tsx role']);

describe('story options', () => {
  it('finds stories with options to check', () => {
    assert.ok(stories.flatMap(storyOptions).length >= 10);
  });

  for (const file of stories)
    for (const { prop, options } of storyOptions(file)) {
      if (!options) continue;
      it(`${file}: ${prop}`, () => {
        assert.ok(prop, `an \`options\` in ${file} without its prop`);
        const unions = propUnions(dirname(file), prop);
        assert.ok(
          unions.length > 0,
          `no \`${prop}?: 'a' | 'b'\` in the props next to ${file}`,
        );
        for (const union of unions)
          assert.deepEqual(
            [...options].sort(),
            [...union].sort(),
            `${file} offers ${prop} as [${options}], the prop takes [${union}]`,
          );
      });
      // What the visual tests compare: every value in the Overview
      const shown = overview(file);
      if (shown && !LOOK_ALIKE.has(`${file} ${prop}`))
        it(`${file}: ${prop} in the Overview`, () => {
          const defaults = propDefaults(dirname(file), prop!);
          const missing = options.filter(
            value =>
              !shown.body.includes(`${prop}="${value}"`) &&
              !shown.lists.some(list => list.includes(value)) &&
              !(
                defaults.includes(value) &&
                new RegExp(`<\\w+(?![^>]*\\b${prop}=)[^>]*>`).test(shown.body)
              ),
          );
          assert.deepEqual(
            missing,
            [],
            `${file}'s Overview shows no ${prop} [${missing}]: set it, map over a list that has it, or (the default) leave it out`,
          );
        });
    }
});
