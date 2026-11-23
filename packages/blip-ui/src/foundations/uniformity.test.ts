import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { glidingArt, transitionFaults } from './motion';
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
  .filter(
    file =>
      /\.tsx?$/.test(file) &&
      !/\.(stories|test)\.tsx?$/.test(file) &&
      !file.includes('/examples/'),
  )
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
  // The screen's: the bottom clears the bar, the top the title
  '(--s-bottom)',
  '(--s-top)',
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

  it('move a UI element smoothly: named properties, the kit’s curve, 300 ms at most', () => {
    assert.deepEqual(
      readdirSync(ROOT, { recursive: true, encoding: 'utf8' })
        .filter(
          file => /\.tsx?$/.test(file) && !/\.(stories|test)\.tsx?$/.test(file),
        )
        .flatMap(file =>
          transitionFaults(readFileSync(join(ROOT, file), 'utf8')).map(
            fault => `${file}: ${fault}`,
          ),
        ),
      [],
    );
  });

  it('move art like a sprite: keyframes in steps', () => {
    assert.deepEqual(
      glidingArt(readFileSync(join(ROOT, '../styles.css'), 'utf8')),
      [],
    );
  });

  it('draw shapes on the pixel grid, never a slanted clip the browser blends', () => {
    const slanted = classes
      .filter(({ token }) => /clip-path:polygon\(/.test(token))
      .map(({ file, token }) => `${file}: ${token}`);
    assert.deepEqual(slanted, []);
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

  it('stack the layers over a screen by the tokens, --bui-layer-*', () => {
    // `z-1` lifts a part over its neighbours inside it (the open tab)
    const off = classes.filter(c => {
      const value = /^-?z-(.+)$/.exec(c.utility)?.[1];
      return (
        value !== undefined &&
        value !== '1' &&
        !/^\(--bui-layer-[a-z]+\)$/.test(value)
      );
    });
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
      'a layer over the screen is z-(--bui-layer-note|controls|dialog)',
    );
  });
});

/**
 * Focus is one mark (`foundations/focus.mdx`): `bui-focus` or
 * `bui-focus-line`, or one of the few lines below that each control's
 * row in that table names. A style under a focus variant outside them
 * (an outline of its own, a ring, a fill) fails here.
 */
const FOCUS_ALLOWED: Record<string, string> = {
  // A field's underline: its colour and thickness turn, nothing moves
  'text-field/text-field.styles.ts focus:[--ul:var(--bui-primary)]':
    'underline',
  'text-field/text-field.styles.ts focus:[--ul-n:2]': 'underline',
  // A button's cursor, left of it, shows: the menus' mark, on every variant
  'button/button.styles.ts focus-visible:before:opacity-100': 'cursor',
  // An icon button's mark sits on the ink
  'icon-button/icon-button.styles.ts bg-(--bui-ink)': 'ink',
  // A picker row's cursor shows, in the primary colour
};

const FOCUS_VARIANT = /(?:^|:)(?:group-)?focus(?:-visible|-within)?:/;

describe('the kit’s focus', () => {
  const focused = classes.filter(c => FOCUS_VARIANT.test(c.token));

  it('looks one way: the mark, or a line the table names', () => {
    const off = focused.filter(
      c =>
        !['bui-focus', 'bui-focus-line', 'outline-none'].includes(c.utility) &&
        !(`${c.file.replaceAll('\\', '/')} ${c.utility}` in FOCUS_ALLOWED) &&
        !(`${c.file.replaceAll('\\', '/')} ${c.token}` in FOCUS_ALLOWED),
    );
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
      'focus is bui-focus or bui-focus-line, inside the box (foundations/focus.mdx)',
    );
  });

  it('is never an outline outside the box', () => {
    const grows = classes.filter(c =>
      /^(?:outline-(?:offset-)?\d|outline-solid|-?outline-offset)/.test(
        c.utility,
      ),
    );
    assert.deepEqual(
      grows.map(c => `${c.file}: ${c.token}`),
      [],
    );
  });

  it('has a row in the focus table for every control that shows it', () => {
    const page = readFileSync(join(import.meta.dirname, 'focus.mdx'), 'utf8');
    const missing = [
      ...new Set(
        focused
          // A control's name is its folder's, in Pascal case
          .map(c =>
            c.file
              .split('/')[0]!
              .replace(/(^|-)(\w)/g, (_, __, letter: string) =>
                letter.toUpperCase(),
              ),
          ),
      ),
    ].filter(name => !page.includes(`| \`${name}\``));
    assert.deepEqual(missing, [], 'add the control to the table');
  });
});

describe('the kit’s components', () => {
  it('mark their root with their name, so a parent can place them', () => {
    // Whose root is another of the kit's components, marked by that one
    // (Confirm's is a Dialog), or parts each marked by its own name
    const COMPOSED = new Set(['confirm', 'parts']);
    const unmarked = readdirSync(ROOT).filter(
      name =>
        !COMPOSED.has(name) &&
        !readFileSync(join(ROOT, name, `${name}.tsx`), 'utf8').includes(
          `data-slot="${name}"`,
        ),
    );
    assert.deepEqual(unmarked, [], 'each root has data-slot="<component>"');
  });
});
