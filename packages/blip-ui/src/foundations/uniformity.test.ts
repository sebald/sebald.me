import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { SPACE } from './pixel';

/**
 * The kit's components look like one set: their styles take spacing,
 * text sizes and the disabled look from one scale each. These tests read
 * every class in the components' sources (not the stories) and fail on a
 * value from outside it, so a new component can't bring its own.
 */

const ROOT = join(import.meta.dirname, '../components');

/** Every class in a component's source, with the file it is in */
const classes = readdirSync(ROOT, { recursive: true, encoding: 'utf8' })
  .filter(file => /\.tsx?$/.test(file) && !/\.(stories|test)\.tsx?$/.test(file))
  .flatMap(file =>
    [
      ...readFileSync(join(ROOT, file), 'utf8').matchAll(
        /'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g,
      ),
    ]
      .flatMap(match => (match[1] ?? match[2] ?? match[3]!).split(/\s+/))
      .filter(Boolean)
      // Only the utility, without its variants (`tall:`, `group-active:`,
      // a parent's `*:data-[slot=legend]:`): what follows the last colon
      // outside brackets
      .map(token => ({
        file,
        token,
        utility: token.split(/:(?![^[(]*[\])])/).at(-1)!,
      })),
  );

/**
 * The few places a value from outside the scales is right, and why:
 * the touch parts are sized in CSS pixels for a thumb, not in the stage's
 */
const ALLOWED: Record<string, string> = {
  // The tall bar and its buttons: a thumb's size, the same on every phone
  'controls/controls.styles.ts px-2': 'touch',
  'icon-button/icon-button.styles.ts gap-2': 'touch',
  'icon-button/icon-button.styles.ts px-3': 'touch',
  // Shown instead of the stage, outside its pixels
  'stage/stage.styles.ts gap-2': 'outside the stage',
  'stage/stage.styles.ts p-6': 'outside the stage',
  'stage/stage.styles.ts text-sm': 'outside the stage',
  // Set against the letters: the speaker's mark and a ledger's dots on the baseline
  'line/line.styles.ts mt-[0.4em]': 'on the text',
  'ledger/ledger.styles.ts mb-[0.3em]': 'on the text',
  // Art on the grid: neighbouring window tabs share their ink column
  'tabs/tabs.styles.ts -ml-(--px)': 'art',
  // The darkened inside of a stamp, not a disabled state
  'stamp/stamp.styles.ts opacity-70': 'art',
};

const allowed = ({ file, utility }: { file: string; utility: string }) =>
  `${file.replaceAll('\\', '/')} ${utility}` in ALLOWED;

const SPACING =
  /^-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy])-(.+)$/;

/**
 * A part's own lengths, each made of the stage's pixels: the button's
 * (`--b-*`, of `--bui-px`) and the window tabs' (`--t-*`, the rings in
 * `--px` as the window's, the label's box in `--bui-px`)
 */
const PART_VARS = [
  '(--b-px)',
  '(--b-pad)',
  '(--b-inline)',
  '(--b-x)',
  '(--t-ring)',
  '(--t-over)',
  '(--t-inline)',
];

const spacingOk = (value: string) => {
  if (value === '0' || value === 'auto') return true;
  if (value === '(--bui-px)' || PART_VARS.includes(value)) return true;
  const n = /^\[calc\(var\(--bui-px\)\*(\d+)\)\]$/.exec(value)?.[1];
  return n !== undefined && (SPACE as readonly number[]).includes(Number(n));
};

describe('the kit’s styles', () => {
  it('space everything from the scale, in --bui-px', () => {
    const off = classes.filter(c => {
      const value = SPACING.exec(c.utility)?.[1];
      return value !== undefined && !spacingOk(value) && !allowed(c);
    });
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
      `spacing is calc(var(--bui-px)*n) with n in ${SPACE.join(', ')}`,
    );
  });

  it('count stage pixels in whole pixels, with no CSS pixels added', () => {
    const off = classes.filter(
      c =>
        /var\(--(?:bui-)?px\)\s*\*\s*\d*\.\d/.test(c.token) ||
        /var\(--(?:bui-)?px\)\s*\*\s*[\d.]+\s*[+-]\s*[\d.]+px/.test(c.token),
    );
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
    );
  });

  it('size text from one scale: 0.75em, 0.85em, 1em and 2em', () => {
    const off = classes.filter(c => {
      const size =
        /^text-\[([\d.]+)em\]$/.exec(c.utility)?.[1] ??
        /^text-(xs|sm|base|lg|xl|\dxl)$/.exec(c.utility)?.[1];
      return (
        size !== undefined &&
        !['0.75', '0.85', '1', '2'].includes(size) &&
        !allowed(c)
      );
    });
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
    );
  });

  it('show what is off one way, bui-disabled', () => {
    const off = classes.filter(c => {
      const value = /^opacity-(\d+)$/.exec(c.utility)?.[1];
      // Shown or hidden is not faded
      return (
        value !== undefined && value !== '0' && value !== '100' && !allowed(c)
      );
    });
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
      'a disabled state is bui-disabled, not an opacity of its own',
    );
  });
});
