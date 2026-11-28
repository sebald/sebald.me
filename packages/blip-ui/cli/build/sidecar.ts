/**
 * The sidecar of a page, `<page>.blip-rules.yaml` (spec 2.2): parsed into
 * rules and held to the build's rules. No file access, so Storybook's blocks
 * parse the same way the pack step does.
 */
import { parse } from 'yaml';

import { type Marker, type Rule, type WhenNot, isKind } from '../rules.ts';

export interface Sidecar {
  /** The file it was read from, for messages */
  file: string;
  page: string;
  rules: Rule[];
  whenNot: WhenNot[];
}

const RULE_FIELDS = new Set([
  'id',
  'text',
  'severity',
  'check',
  'markers',
  'fix',
  'source',
]);

const MARKERS = new Set<string>(['review', 'open']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** `<kind>-<SCOPE>-<n>`, with the scope in capitals (digits and dashes too) */
const ID = /^([A-Z])-([A-Z][A-Z0-9]*(?:-[A-Z][A-Z0-9]*)*)-(\d+)$/;

/** `speech-bubble` is `SPEECH-BUBBLE` in an id */
export const scopeOf = (page: string) => page.toUpperCase();

/**
 * Parses one sidecar. Throws an `Error` that names the file (and the rule)
 * when the YAML is not the shape of spec 2.2; the rules about ids and
 * checks are `checkSidecars`'.
 */
export const parseSidecar = (text: string, file: string): Sidecar => {
  const fail = (message: string): never => {
    throw new Error(`${file}: ${message}`);
  };
  let data: unknown;
  try {
    data = parse(text);
  } catch (error) {
    return fail(`not valid YAML (${(error as Error).message.split('\n')[0]})`);
  }
  if (!isRecord(data))
    return fail('expected a mapping with `page` and `rules`');
  for (const key of Object.keys(data)) {
    if (!['page', 'rules', 'when-not'].includes(key))
      fail(`unknown key "${key}" (a sidecar has page, rules, when-not)`);
  }
  const page = data.page;
  if (typeof page !== 'string' || !page) return fail('`page` is missing');
  if (!Array.isArray(data.rules)) return fail('`rules` is not a list');

  const rules = (data.rules as unknown[]).map((raw, index): Rule => {
    if (!isRecord(raw)) return fail(`rule ${index + 1} is not a mapping`);
    const id = typeof raw.id === 'string' ? raw.id : `rule ${index + 1}`;
    const bad = (message: string): never => fail(`${id}: ${message}`);
    for (const key of Object.keys(raw)) {
      if (!RULE_FIELDS.has(key)) bad(`unknown field "${key}"`);
    }
    if (typeof raw.id !== 'string') return bad('`id` is missing');
    if (typeof raw.text !== 'string' || !raw.text.trim())
      return bad('`text` is missing');
    if (
      raw.severity !== undefined &&
      raw.severity !== 'error' &&
      raw.severity !== 'warning'
    )
      bad('`severity` is `error` or `warning`');
    for (const key of ['check', 'fix', 'source'] as const) {
      if (raw[key] !== undefined && typeof raw[key] !== 'string')
        bad(`\`${key}\` is a string`);
    }
    const markers = raw.markers ?? [];
    if (
      !Array.isArray(markers) ||
      markers.some(marker => typeof marker !== 'string' || !MARKERS.has(marker))
    )
      bad('`markers` is a list of `review` and `open`');
    const kind = raw.id[0] ?? '';
    return {
      id: raw.id,
      // An id of no kind is an error of `checkSidecars`
      kind: isKind(kind) ? kind : 'X',
      page,
      text: raw.text.trim(),
      severity: raw.severity === 'error' ? 'error' : 'warning',
      markers: markers as Marker[],
      ...(typeof raw.check === 'string' && { check: raw.check }),
      ...(typeof raw.fix === 'string' && { fix: raw.fix.trimEnd() }),
      ...(typeof raw.source === 'string' && { source: raw.source }),
    };
  });

  const rawWhenNot = data['when-not'] ?? [];
  if (!Array.isArray(rawWhenNot)) return fail('`when-not` is not a list');
  const whenNot = (rawWhenNot as unknown[]).map((raw): WhenNot => {
    if (
      !isRecord(raw) ||
      typeof raw.text !== 'string' ||
      typeof raw.use !== 'string' ||
      Object.keys(raw).some(key => key !== 'text' && key !== 'use')
    )
      return fail('a `when-not` entry has `text` and `use`, a page id');
    return { text: raw.text.trim(), use: raw.use };
  });

  return { file, page, rules, whenNot };
};

export interface Findings {
  /** Fail the build */
  errors: string[];
  /** Printed, do not fail it: a check that does not exist yet */
  warnings: string[];
}

export interface Known {
  /** Ids of the pages that are shipped */
  pages: ReadonlySet<string>;
  /** Names of the checks in `cli/validate/checks/` */
  checks: ReadonlySet<string>;
}

/**
 * The build's rules over every sidecar. Errors: a duplicate id, an id that
 * does not match its kind and page, a rule with neither `check` nor a marker
 * (or with both), a `check` without a `fix`, a page or a `use` that does not
 * exist. Warnings: a `check` that does not exist, a check no rule names.
 */
export const checkSidecars = (
  sidecars: readonly Sidecar[],
  known: Known,
): Findings => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seen = new Map<string, string>();
  const pagesSeen = new Map<string, string>();
  const named = new Set<string>();

  for (const sidecar of sidecars) {
    const { file, page } = sidecar;
    if (file.split('/').pop() !== `${page}.blip-rules.yaml`)
      errors.push(`${file}: \`page: ${page}\` does not match the file's name`);
    const other = pagesSeen.get(page);
    if (other) errors.push(`${file}: page "${page}" already has ${other}`);
    pagesSeen.set(page, file);
    // The correctness rules have no page
    if (!known.pages.has(page) && sidecar.rules.some(rule => rule.kind !== 'X'))
      errors.push(`${file}: no page "${page}" to hold these rules`);

    for (const rule of sidecar.rules) {
      const where = `${file}: ${rule.id}`;
      const first = seen.get(rule.id);
      if (first) errors.push(`${where} is already used in ${first}`);
      else seen.set(rule.id, file);

      const match = ID.exec(rule.id);
      if (!match) {
        errors.push(`${where}: an id is <kind>-<PAGE>-<n>, such as C-DIALOG-1`);
      } else {
        const [, kind, scope] = match;
        if (!isKind(kind!))
          errors.push(`${where}: "${kind}" is not a kind (C, P, A, T, F, X)`);
        // F and X are about no one page: their scope names the topic
        else if (kind !== 'F' && kind !== 'X' && scope !== scopeOf(page))
          errors.push(
            `${where}: on the ${page} page the id is ${kind}-${scopeOf(page)}-<n>`,
          );
      }

      if (!rule.check && rule.markers.length === 0)
        errors.push(`${where} has neither a \`check\` nor a marker`);
      if (rule.check && rule.markers.length > 0)
        errors.push(
          `${where} has a \`check\` and a marker: a marked rule has no check`,
        );
      if (rule.check && !rule.fix)
        errors.push(`${where} names a \`check\` and has no \`fix\``);
      if (rule.check) {
        named.add(rule.check);
        if (!known.checks.has(rule.check))
          warnings.push(`${where}: no check "${rule.check}" yet`);
      }
    }

    for (const entry of sidecar.whenNot) {
      if (!known.pages.has(entry.use))
        errors.push(
          `${file}: when-not "${entry.text}" uses "${entry.use}", which is no page`,
        );
    }
  }

  for (const check of [...known.checks].sort()) {
    if (!named.has(check))
      warnings.push(`check "${check}" is named by no rule`);
  }
  return { errors, warnings };
};
