import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { glidingArt, transitionFaults } from './motion';
import { SPACING } from './pixel';

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

/** The utilities that space or place: padding, margin, gap, and offsets */
const SPACES =
  /^-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end)-(.+)$/;

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

/** A number of stage pixels written out instead of a role */
const RAW = /--bui-px\)\s*\*|^\(--bui-px\)$/;

const spacingOk = (value: string) => {
  if (['0', 'auto', 'full', 'px'].includes(value)) return true;
  if (/^\d+\/\d+$/.test(value)) return true; // a fraction: top-1/2
  if (value in SPACING || PART_VARS.includes(value)) return true;
  // A token (art in `(--px)`, `(--bui-bar)`), or arbitrary: roles by
  // --theme(), art in --px, part variables; never a raw step
  return /^[[(]/.test(value) && !RAW.test(value);
};

describe('the kit’s styles', () => {
  it('space everything by its role, never a number', () => {
    const off = classes.filter(c => {
      const value = SPACES.exec(c.utility)?.[1];
      const spaced = value !== undefined && !spacingOk(value);
      // A part's own length set from a raw step: `[--b-inline:calc(var(--bui-px)*6)]`
      const part = /^\[--[bts]-[\w-]+:/.test(c.utility) && RAW.test(c.utility);
      return (spaced || part) && !allowed(c);
    });
    assert.deepEqual(
      off.map(c => `${c.file}: ${c.token}`),
      [],
      `spacing is a role (${Object.keys(SPACING).join(', ')}): gap-related, p-window, --theme(--spacing-cursor); foundations/spacing.mdx`,
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
  // A stepper's arrows show, in primary, while it has the keys' focus: its focus mark, in place of its field's cursor
  'stepper/stepper.styles.ts focus-visible:text-(--bui-primary)': 'arrows',
  'stepper/stepper.styles.ts group-focus-visible/stepper:opacity-100': 'arrows',
  // A button's cursor, left of it, shows: the menus' mark, on every variant
  'button/button.styles.ts group-focus-visible:opacity-100': 'cursor',
  // An icon button's cursor shows, as a button's
  'icon-button/icon-button.styles.ts group-focus-visible:opacity-100': 'cursor',
  // A picker row's cursor shows, in the primary colour
  // A field's cursor shows while its control has the keys' focus
  'field/field.styles.ts [@media(hover:hover),(pointer:fine)]:group-has-[:focus-visible:not([data-marks-focus])]/field:opacity-100':
    'cursor',
};

/**
 * A variant that reacts to the focus: `focus:`, `focus-visible:`,
 * `group-focus-visible:`, a group's `has-[:focus-visible]`, a named group
 * (`/field`) or Base UI's `data-[focused]`
 */
const FOCUS_VARIANT =
  /(?:^|:|-|\[:?)focus(?:ed|-visible|-within)?\]?(?:\/[\w-]+)?:/;

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
    // (Confirm's is a Dialog, TextField's a Field), or parts each marked
    // by its own name
    const COMPOSED = new Set(['confirm', 'parts', 'text-field']);
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
