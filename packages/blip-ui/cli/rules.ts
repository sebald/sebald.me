/**
 * What a rule is, as `rules.json` holds it, and how one is written as text.
 * Pure: the CLI, the pack step and Storybook's blocks all import it.
 */

export type RuleKind = 'C' | 'P' | 'A' | 'T' | 'F' | 'X';

/** The kinds in the order a page lists them, with their names */
export const KINDS = [
  ['C', 'Components'],
  ['P', 'Patterns'],
  ['A', 'Accessibility'],
  ['T', 'Text and content'],
  ['F', 'Foundations'],
  ['X', 'Correctness'],
] as const satisfies readonly (readonly [RuleKind, string])[];

export const isKind = (value: string): value is RuleKind =>
  KINDS.some(([kind]) => kind === value);

export type Marker = 'review' | 'open';

export interface Rule {
  id: string;
  kind: RuleKind;
  page: string;
  text: string;
  severity: 'error' | 'warning';
  check?: string;
  markers: Marker[];
  fix?: string;
  source?: string;
}

export interface WhenNot {
  text: string;
  /** The page to use instead */
  use: string;
}

export interface RulesFile {
  version: string;
  rules: Rule[];
  whenNot: Record<string, WhenNot[]>;
}

/** A rule's number, the last part of its id: `C-DIALOG-2` is 2 */
const numberOf = (id: string) => Number(/-(\d+)$/.exec(id)?.[1] ?? 0);

const kindIndex = (kind: string) =>
  KINDS.findIndex(([candidate]) => candidate === kind);

/** Rules by kind, then by number */
export const sortRules = <T extends Pick<Rule, 'id' | 'kind'>>(rules: T[]) =>
  [...rules].sort(
    (a, b) =>
      kindIndex(a.kind) - kindIndex(b.kind) || numberOf(a.id) - numberOf(b.id),
  );

/** An unanswered question: kept in `rules.json`, never shown to a consumer */
export const isOpen = (rule: Pick<Rule, 'markers'>) =>
  rule.markers.includes('open');

/** `(error)` and `[review]`: what a line says besides the sentence */
export const flags = (rule: Pick<Rule, 'severity' | 'markers'>) =>
  [
    ...(rule.severity === 'error' ? ['(error)'] : []),
    ...rule.markers.map(marker => `[${marker}]`),
  ].join(' ');

/** One rule as an inline markdown line: `**C-DIALOG-1** (error) Give …` */
export const ruleInline = (rule: Rule) =>
  [`**${rule.id}**`, flags(rule), rule.text].filter(Boolean).join(' ');

/** The line of a rule's list item, which `reasoningOf` strips from a section */
export const RULE_ITEM = /^- \*\*[A-Z]-[A-Z0-9-]+-\d+\*\* .*$/;

const WHEN_NOT = 'When not';

/** A when-not entry as a list item: the case, and where to go */
export const whenNotItem = (entry: WhenNot) =>
  `- ${entry.text} (\`blip docs ${entry.use}\`)`;

/**
 * A page's rules as markdown lists by kind, then its when-not list. The
 * kind's name leads each list only when there is more than one list. An open
 * question is left out.
 */
export const rulesMarkdown = (
  rules: readonly Rule[],
  whenNot: readonly WhenNot[] = [],
) => {
  const shown = sortRules(rules.filter(rule => !isOpen(rule)));
  const groups = [
    ...KINDS.map(([kind, label]) => ({
      label,
      items: shown.filter(rule => rule.kind === kind).map(ruleItem),
    })),
    { label: WHEN_NOT, items: whenNot.map(whenNotItem) },
  ].filter(group => group.items.length > 0);
  return groups
    .map(group =>
      [
        ...(groups.length > 1 ? [`**${group.label}**`, ''] : []),
        ...group.items,
      ].join('\n'),
    )
    .join('\n\n');
};

const ruleItem = (rule: Rule) => `- ${ruleInline(rule)}`;

/** The labels `rulesMarkdown` puts over its lists */
const LABEL = new RegExp(
  `^\\*\\*(?:${[...KINDS.map(([, label]) => label), WHEN_NOT].join('|')})\\*\\*$`,
);

/**
 * The `##` section of a page that shows a rule, without the lists of rules in
 * it: the page's reasoning. Null when the page does not show the rule.
 */
export const reasoningOf = (markdown: string, id: string) => {
  const sections = markdown.split(/^(?=##\s)/m);
  const section = sections.find(part => part.includes(`**${id}**`));
  if (!section) return null;
  // The when-not list follows its label, blank line and items
  let inWhenNot = false;
  const kept = section.split('\n').filter(line => {
    if (line === `**${WHEN_NOT}**`) {
      inWhenNot = true;
      return false;
    }
    if (inWhenNot && (line === '' || line.startsWith('- '))) return false;
    inWhenNot = false;
    return !RULE_ITEM.test(line) && !LABEL.test(line);
  });
  return (
    kept
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
};
