import assert from 'node:assert/strict';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { checkSidecars, parseSidecar } from './sidecar.ts';
import { buildRulesFile, loadCheckNames, loadSidecars } from './sidecars.ts';

const DIALOG = `page: dialog
rules:
  - id: C-DIALOG-1
    text: Give every Dialog a Title.
    severity: error
    check: dialog-title
    fix: |
      <Dialog><Title>Options</Title></Dialog>
  - id: C-DIALOG-2
    text: Use role="alertdialog" before something that can't be undone.
    markers: [review]
  - id: P-DIALOG-3
    text: Ask first.
    markers: [open]
    source: https://example.com
when-not:
  - text: A line a character says is a SpeechBubble.
    use: speech-bubble
`;

const KNOWN = {
  pages: new Set(['dialog', 'speech-bubble']),
  checks: new Set(['dialog-title']),
};

const sidecar = (yaml: string, file = 'components/dialog/dialog.blip-rules.yaml') =>
  parseSidecar(yaml, file);

describe('parseSidecar', () => {
  it('reads the fields and fills the defaults', () => {
    const parsed = sidecar(DIALOG);
    assert.equal(parsed.page, 'dialog');
    assert.deepEqual(parsed.rules[0], {
      id: 'C-DIALOG-1',
      kind: 'C',
      page: 'dialog',
      text: 'Give every Dialog a Title.',
      severity: 'error',
      markers: [],
      check: 'dialog-title',
      fix: '<Dialog><Title>Options</Title></Dialog>',
    });
    assert.equal(parsed.rules[1]!.severity, 'warning');
    assert.deepEqual(parsed.rules[2]!.markers, ['open']);
    assert.equal(parsed.rules[2]!.source, 'https://example.com');
    assert.deepEqual(parsed.whenNot, [
      { text: 'A line a character says is a SpeechBubble.', use: 'speech-bubble' },
    ]);
  });

  it('refuses a shape that is not a sidecar, naming the file and the rule', () => {
    assert.throws(() => sidecar('rules: []'), /`page` is missing/);
    assert.throws(() => sidecar('page: dialog'), /`rules` is not a list/);
    assert.throws(
      () => sidecar('page: dialog\nrules:\n  - id: C-DIALOG-1\n    text: x\n    nope: 1'),
      /dialog\.blip-rules\.yaml: C-DIALOG-1: unknown field "nope"/,
    );
    assert.throws(
      () => sidecar('page: dialog\nrules:\n  - id: C-DIALOG-1\n    text: x\n    markers: [maybe]'),
      /markers/,
    );
    assert.throws(
      () => sidecar('page: dialog\nrules:\n  - id: C-DIALOG-1\n    text: x\n    severity: fatal'),
      /severity/,
    );
    assert.throws(() => sidecar('page: [unclosed'), /not valid YAML/);
  });
});

describe('checkSidecars', () => {
  it('passes a sidecar that follows the rules, with no warnings', () => {
    const { errors, warnings } = checkSidecars([sidecar(DIALOG)], KNOWN);
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, []);
  });

  it('fails on a duplicate id, also across sidecars', () => {
    const twice = DIALOG.replace('C-DIALOG-2', 'C-DIALOG-1');
    assert.match(
      checkSidecars([sidecar(twice)], KNOWN).errors.join('\n'),
      /C-DIALOG-1 is already used/,
    );
    const other = sidecar(
      'page: speech-bubble\nrules:\n  - id: C-DIALOG-1\n    text: x\n    markers: [review]',
      'components/speech-bubble/speech-bubble.blip-rules.yaml',
    );
    const { errors } = checkSidecars([sidecar(DIALOG), other], KNOWN);
    assert.ok(errors.some(error => /C-DIALOG-1 is already used in components\/dialog/.test(error)));
  });

  it('fails on an id that does not match its kind or its page', () => {
    const wrongPage = DIALOG.replace('P-DIALOG-3', 'P-WINDOW-3');
    assert.match(
      checkSidecars([sidecar(wrongPage)], KNOWN).errors.join('\n'),
      /P-WINDOW-3: on the dialog page the id is P-DIALOG-<n>/,
    );
    const wrongKind = DIALOG.replace('P-DIALOG-3', 'Z-DIALOG-3');
    assert.match(
      checkSidecars([sidecar(wrongKind)], KNOWN).errors.join('\n'),
      /"Z" is not a kind/,
    );
    const noNumber = DIALOG.replace('P-DIALOG-3', 'P-DIALOG');
    assert.match(
      checkSidecars([sidecar(noNumber)], KNOWN).errors.join('\n'),
      /an id is <kind>-<PAGE>-<n>/,
    );
  });

  it('lets a page with a dash in its name scope its ids in capitals', () => {
    const bubble = sidecar(
      'page: speech-bubble\nrules:\n  - id: C-SPEECH-BUBBLE-1\n    text: x\n    markers: [review]',
      'components/speech-bubble/speech-bubble.blip-rules.yaml',
    );
    assert.deepEqual(checkSidecars([bubble], KNOWN).errors, []);
  });

  it('takes any topic as the scope of an F or X rule', () => {
    const introduction = sidecar(
      'page: introduction\nrules:\n  - id: F-COLOUR-1\n    text: x\n    markers: [review]',
      'introduction.blip-rules.yaml',
    );
    const known = { ...KNOWN, pages: new Set([...KNOWN.pages, 'introduction']) };
    assert.deepEqual(checkSidecars([introduction], known).errors, []);
  });

  it('fails on a rule with neither a check nor a marker', () => {
    const bare = DIALOG.replace('    markers: [review]\n', '');
    assert.match(
      checkSidecars([sidecar(bare)], KNOWN).errors.join('\n'),
      /C-DIALOG-2 has neither a `check` nor a marker/,
    );
  });

  it('fails on a check with a marker, and on a check without a fix', () => {
    const both = DIALOG.replace(
      '    severity: error\n',
      '    severity: error\n    markers: [review]\n',
    );
    assert.match(
      checkSidecars([sidecar(both)], KNOWN).errors.join('\n'),
      /C-DIALOG-1 has a `check` and a marker/,
    );
    const noFix = DIALOG.replace(/    fix: \|\n.*\n/, '');
    assert.match(
      checkSidecars([sidecar(noFix)], KNOWN).errors.join('\n'),
      /C-DIALOG-1 names a `check` and has no `fix`/,
    );
  });

  it('warns, without failing, on a check that does not exist', () => {
    const { errors, warnings } = checkSidecars([sidecar(DIALOG)], {
      ...KNOWN,
      checks: new Set(),
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, ['components/dialog/dialog.blip-rules.yaml: C-DIALOG-1: no check "dialog-title" yet']);
  });

  it('warns, without failing, on a check no rule names', () => {
    const { errors, warnings } = checkSidecars([sidecar(DIALOG)], {
      ...KNOWN,
      checks: new Set(['dialog-title', 'window-in-window']),
    });
    assert.deepEqual(errors, []);
    assert.deepEqual(warnings, ['check "window-in-window" is named by no rule']);
  });

  it('fails on a page that does not exist, a file that is not its page, and a when-not to no page', () => {
    const { errors } = checkSidecars([sidecar(DIALOG)], {
      ...KNOWN,
      pages: new Set(['dialog']),
    });
    assert.match(errors.join('\n'), /uses "speech-bubble", which is no page/);
    assert.match(
      checkSidecars([sidecar(DIALOG)], { ...KNOWN, pages: new Set() }).errors.join('\n'),
      /no page "dialog" to hold these rules/,
    );
    assert.match(
      checkSidecars([sidecar(DIALOG, 'components/dialog/other.blip-rules.yaml')], KNOWN).errors.join('\n'),
      /does not match the file's name/,
    );
  });
});

describe('the sidecars of src', () => {
  const root = join(import.meta.dirname, '..', '..');
  const sidecars = loadSidecars(join(root, 'src'));

  it('hold to the build rules (only unwritten checks warn)', () => {
    const { errors, warnings } = checkSidecars(sidecars, {
      pages: new Set(['dialog', 'speech-bubble', 'introduction']),
      checks: loadCheckNames(root),
    });
    assert.deepEqual(errors, []);
    assert.ok(warnings.every(warning => /no check "|named by no rule/.test(warning)));
  });

  it('put an [open] rule in rules.json, with the kind and page of each rule', () => {
    const file = buildRulesFile('1.0.0', [sidecar(DIALOG)]);
    assert.equal(file.version, '1.0.0');
    assert.deepEqual(
      file.rules.map(rule => [rule.id, rule.kind, rule.page]),
      [
        ['C-DIALOG-1', 'C', 'dialog'],
        ['C-DIALOG-2', 'C', 'dialog'],
        ['P-DIALOG-3', 'P', 'dialog'],
      ],
    );
    assert.deepEqual(file.rules[2]!.markers, ['open']);
    assert.equal(file.whenNot.dialog?.[0]?.use, 'speech-bubble');
  });

  it('give Dialog its rules', () => {
    const dialog = sidecars.find(sidecar => sidecar.page === 'dialog');
    assert.ok(dialog);
    assert.ok(dialog.rules.some(rule => rule.id === 'C-DIALOG-1'));
  });
});
