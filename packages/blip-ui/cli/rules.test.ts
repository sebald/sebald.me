import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { mdxToMarkdown } from './build/convert.ts';
import { parseArgs } from './io.ts';
import { type Rule, reasoningOf, rulesMarkdown } from './rules.ts';
import { run } from './run.ts';

const rule = (id: string, text: string, extra: Partial<Rule> = {}): Rule => ({
  id,
  kind: id[0] as Rule['kind'],
  page: 'dialog',
  text,
  severity: 'warning',
  markers: [],
  ...extra,
});

const RULES: Rule[] = [
  rule('C-DIALOG-1', 'Give every Dialog a Title.', {
    severity: 'error',
    check: 'dialog-title',
    fix: '<Dialog>\n  <Title>Options</Title>\n</Dialog>',
  }),
  rule('C-DIALOG-2', 'Use alertdialog for what can not be undone.', {
    markers: ['review'],
  }),
  rule('P-DIALOG-3', 'Ask only what is needed.', { markers: ['open'] }),
  rule('A-DIALOG-4', 'Return the focus when it closes.', {
    markers: ['review'],
    source: 'https://example.com/apg',
  }),
];

const WHEN_NOT = [{ text: 'A spoken line is a bubble.', use: 'speech-bubble' }];

const lookup = {
  forPage: (page: string) => RULES.filter(entry => entry.page === page),
  whenNotFor: (page: string) => (page === 'dialog' ? WHEN_NOT : []),
  byId: (id: string) => RULES.find(entry => entry.id === id),
};

describe('rulesMarkdown', () => {
  it('lists the rules by kind and leaves out an open one', () => {
    const markdown = rulesMarkdown(RULES);
    assert.match(
      markdown,
      /^\*\*Components\*\*\n\n- \*\*C-DIALOG-1\*\* \(error\) Give every/,
    );
    assert.match(markdown, /\*\*Accessibility\*\*/);
    assert.doesNotMatch(markdown, /P-DIALOG-3/);
  });

  it('names no kind when there is only one list', () => {
    assert.equal(
      rulesMarkdown([RULES[1]!]),
      '- **C-DIALOG-2** [review] Use alertdialog for what can not be undone.',
    );
  });

  it('ends with the when-not list', () => {
    assert.match(
      rulesMarkdown(RULES, WHEN_NOT),
      /\*\*When not\*\*\n\n- A spoken line is a bubble\. \(`blip docs speech-bubble`\)$/,
    );
  });
});

describe('mdxToMarkdown with rules', () => {
  const mdx = `# Dialog

A window.

## Usage

It covers the stage. See <Rule id="C-DIALOG-1" /> for the name.

<Rules for="dialog" />
`;

  it('turns <Rules> into lists and <Rule> into one inline rule', () => {
    const markdown = mdxToMarkdown(mdx, [], '', undefined, lookup);
    assert.match(
      markdown,
      /See \*\*C-DIALOG-1\*\* \(error\) Give every Dialog a Title\. for the name\./,
    );
    assert.match(markdown, /- \*\*C-DIALOG-2\*\* \[review\]/);
    assert.doesNotMatch(markdown, /<Rules?\b/);
  });

  it('fails on a rule that does not exist and on a page without rules', () => {
    assert.throws(
      () => mdxToMarkdown('<Rule id="C-NOPE-1" />', [], '', undefined, lookup),
      /no such rule/,
    );
    assert.throws(
      () => mdxToMarkdown('<Rules for="nope" />', [], '', undefined, lookup),
      /no rules/,
    );
    assert.throws(() => mdxToMarkdown('<Rules for="dialog" />'), /no rules/);
  });

  it('leaves a block inside a code fence alone', () => {
    const fenced = '```mdx\n<Rules for="dialog" />\n```\n';
    assert.equal(mdxToMarkdown(fenced, [], '', undefined, lookup), fenced);
  });
});

describe('mdxToMarkdown with only open rules', () => {
  it('fails rather than leave a gap', () => {
    const open = [rule('P-DIALOG-1', 'Ask.', { markers: ['open'] })];
    assert.throws(
      () =>
        mdxToMarkdown('<Rules for="dialog" />', [], '', undefined, {
          forPage: () => open,
          whenNotFor: () => [],
          byId: () => undefined,
        }),
      /no rules to show/,
    );
  });
});

describe('parseArgs flags of blip rules', () => {
  it('reads --kind (both forms) and --open', () => {
    assert.equal(parseArgs(['rules', '--kind=C']).kind, 'C');
    assert.equal(parseArgs(['rules', '--kind', 'P', '--open']).open, true);
    assert.ok(parseArgs(['rules', '--kind', 'Q']).error);
  });
});

describe('reasoningOf', () => {
  it('is the section that shows the rule, without the rule lists', () => {
    const markdown = mdxToMarkdown(
      '# Dialog\n\nA window.\n\n## Usage\n\nIt covers the stage.\n\n<Rules for="dialog" />\n\n## Input\n\nKeys.\n',
      [],
      '',
      undefined,
      lookup,
    );
    assert.equal(
      reasoningOf(markdown, 'C-DIALOG-1'),
      '## Usage\n\nIt covers the stage.\n',
    );
    assert.equal(reasoningOf(markdown, 'P-DIALOG-3'), null);
  });
});

/** A docs folder with a dialog page, its rules and a speech-bubble page */
const setup = () => {
  const root = mkdtempSync(join(tmpdir(), 'blip-rules-'));
  const docsDir = join(root, 'docs');
  mkdirSync(join(docsDir, 'pages'), { recursive: true });
  const pages = [
    ['dialog', 'Dialog', 'A window over the stage.'],
    ['speech-bubble', 'SpeechBubble', 'A line a character says.'],
  ] as const;
  const markdown = mdxToMarkdown(
    '# Dialog\n\nA window over the stage.\n\n## Usage\n\nIt covers the stage.\n\n<Rules for="dialog" />\n',
    [],
    '',
    undefined,
    lookup,
  );
  writeFileSync(join(docsDir, 'pages', 'dialog.md'), markdown);
  writeFileSync(
    join(docsDir, 'pages', 'speech-bubble.md'),
    '# SpeechBubble\n\nA line a character says.\n',
  );
  writeFileSync(
    join(docsDir, 'manifest.json'),
    JSON.stringify({
      version: '0.0.0',
      pages: pages.map(([id, title, summary]) => ({
        id,
        kind: 'component',
        title,
        summary,
        file: `pages/${id}.md`,
        exports: [title],
        rules: id === 'dialog' ? RULES.map(entry => entry.id) : [],
        examples: [],
      })),
      exports: {
        Dialog: { page: 'dialog', kind: 'component' },
        SpeechBubble: { page: 'speech-bubble', kind: 'component' },
      },
      examples: [],
    }),
  );
  writeFileSync(
    join(docsDir, 'rules.json'),
    JSON.stringify({
      version: '0.0.0',
      rules: RULES,
      whenNot: { dialog: WHEN_NOT },
    }),
  );
  const cwd = join(root, 'project');
  mkdirSync(cwd);
  return { docsDir, cwd };
};

const call = (argv: string[]) => {
  const { docsDir, cwd } = setup();
  const out: string[] = [];
  const err: string[] = [];
  const code = run(argv, {
    docsDir,
    cwd,
    env: { BLIP_EVENTS: 'off' },
    out: text => out.push(text),
    err: text => err.push(text),
  });
  return { code, out: out.join('\n'), err: err.join('\n') };
};

describe('blip rules', () => {
  it("lists a page's rules with their markers, and none that is open", () => {
    const { code, out } = call(['rules', 'dialog']);
    assert.equal(code, 0);
    assert.match(out, /^C-DIALOG-1 {2}Give every Dialog a Title\. \(error\)$/m);
    assert.match(out, /^C-DIALOG-2 {2}.* \[review\]$/m);
    assert.doesNotMatch(out, /P-DIALOG-3/);
  });

  it('lists an open rule only with --open', () => {
    const { out } = call(['rules', 'dialog', '--open']);
    assert.match(out, /^P-DIALOG-3 {2}Ask only what is needed\. \[open\]$/m);
  });

  it('filters by kind and lists every page without one', () => {
    const kind = call(['rules', 'dialog', '--kind', 'A']).out;
    assert.match(kind, /A-DIALOG-4/);
    assert.doesNotMatch(kind, /C-DIALOG/);
    assert.match(call(['rules']).out, /C-DIALOG-1/);
    assert.equal(
      call(['rules', 'speech-bubble']).out,
      'No rules on the speech-bubble page yet.',
    );
  });

  it('exits 2 for an unknown page or kind', () => {
    const page = call(['rules', 'dialgo']);
    assert.equal(page.code, 2);
    assert.match(page.err, /closest page is dialog/);
    assert.equal(call(['rules', '--kind', 'Q']).code, 2);
  });

  it('answers in JSON, open rules still out', () => {
    const { rules } = JSON.parse(call(['rules', '--json']).out) as {
      rules: { id: string; page: string }[];
    };
    assert.deepEqual(
      rules.map(entry => entry.id),
      ['C-DIALOG-1', 'C-DIALOG-2', 'A-DIALOG-4'],
    );
  });
});

describe('blip docs <rule-id>', () => {
  it("prints the rule, the page's reasoning and the fix", () => {
    const { code, out } = call(['docs', 'C-DIALOG-1']);
    assert.equal(code, 0);
    assert.match(
      out,
      /^C-DIALOG-1 {2}error {2}dialog\nGive every Dialog a Title\./,
    );
    assert.match(
      out,
      /Why, from the dialog page\n## Usage\n\nIt covers the stage\./,
    );
    assert.match(out, /Fix\n<Dialog>\n {2}<Title>Options<\/Title>\n<\/Dialog>/);
    assert.match(out, /The page: blip docs dialog/);
  });

  it('takes the id in any case and says what a [review] rule is', () => {
    const { out } = call(['docs', 'c-dialog-2']);
    assert.match(out, /^C-DIALOG-2/);
    assert.match(out, /the reviewer judges it/);
    assert.doesNotMatch(out, /\nFix\n/);
  });

  it('prints an open rule too, marked, with the page summary as its reason', () => {
    const { code, out } = call(['docs', 'P-DIALOG-3']);
    assert.equal(code, 0);
    assert.match(out, /An open question/);
    assert.match(out, /A window over the stage\./);
  });

  it('exits 2 for a rule that does not exist', () => {
    const { code, err } = call(['docs', 'C-DIALOG-9']);
    assert.equal(code, 2);
    assert.match(err, /No rule "C-DIALOG-9"/);
  });
});

describe('blip search with rules', () => {
  it('finds a rule by its words, and never an open one', () => {
    const found = JSON.parse(call(['search', 'alertdialog', '--json']).out) as {
      hits: { type: string; id: string; command: string }[];
    };
    const hit = found.hits.find(entry => entry.type === 'rule');
    assert.equal(hit?.id, 'C-DIALOG-2');
    assert.equal(hit?.command, 'blip docs C-DIALOG-2');
    const open = JSON.parse(call(['search', 'needed', '--json']).out) as {
      hits: { id: string }[];
    };
    assert.ok(!open.hits.some(entry => entry.id === 'P-DIALOG-3'));
  });
});
