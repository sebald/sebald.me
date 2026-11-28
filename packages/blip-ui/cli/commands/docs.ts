import type { Docs } from '../docs-dir.ts';
import { recordEvent } from '../events.ts';
import type { Io, Parsed } from '../io.ts';
import { isOpen, reasoningOf } from '../rules.ts';
import type { Rule } from '../rules.ts';
import { closestPage } from '../search.ts';
import { sectionNames, sectionOf } from '../section.ts';

/** `C-DIALOG-1`: what a rule id looks like */
const RULE_ID = /^[a-z]-[a-z][a-z0-9-]*-\d+$/i;

/** A rule as text: the rule, its page's reasoning, its fix */
const ruleText = (rule: Rule, docs: Docs) => {
  const markdown = docs.pages.some(page => page.id === rule.page)
    ? docs.markdown(rule.page)
    : '';
  const reasoning =
    reasoningOf(markdown, rule.id) ??
    docs.pages.find(page => page.id === rule.page)?.summary ??
    null;
  const parts = [
    `${rule.id}  ${rule.severity}  ${rule.page}`,
    rule.text,
    ...(isOpen(rule)
      ? ['An open question: not enforced, and not in blip rules.']
      : rule.markers.includes('review')
        ? ['No tool checks this one; the reviewer judges it.']
        : []),
  ];
  const sections = [parts.join('\n')];
  if (reasoning)
    sections.push(`Why, from the ${rule.page} page\n${reasoning.trim()}`);
  if (rule.fix) sections.push(`Fix\n${rule.fix}`);
  const more = [
    ...(rule.source ? [`Source: ${rule.source}`] : []),
    ...(docs.pages.some(page => page.id === rule.page)
      ? [`The page: blip docs ${rule.page}`]
      : []),
  ];
  if (more.length > 0) sections.push(more.join('\n'));
  return sections.join('\n\n');
};

export const docsCommand = (docs: Docs, args: Parsed, io: Io) => {
  const name = args.positionals[0];
  if (!name || args.positionals.length > 1) {
    io.err(
      'blip docs takes one page, export or rule: blip docs <page | export | rule-id> [--section <name>]',
    );
    return 2;
  }
  const wanted = name.toLowerCase();
  if (RULE_ID.test(name)) {
    const rule = docs.rules.find(rule => rule.id.toLowerCase() === wanted);
    recordEvent(io.cwd, io.env, {
      event: 'lookup',
      command: 'docs',
      arguments: [name],
      results: rule ? [rule.id] : [],
    });
    if (rule) {
      io.out(
        args.json
          ? JSON.stringify({
              ...rule,
              reasoning:
                reasoningOf(
                  docs.pages.some(page => page.id === rule.page)
                    ? docs.markdown(rule.page)
                    : '',
                  rule.id,
                ) ?? null,
            })
          : ruleText(rule, docs),
      );
      return 0;
    }
    const message = `No rule "${name}". blip rules lists them.`;
    if (args.json) io.out(JSON.stringify({ error: message, closest: null }));
    else io.err(message);
    return 2;
  }
  const page =
    docs.manifest.pages.find(page => page.id === wanted)?.id ??
    docs.exports.find(entry => entry.name.toLowerCase() === wanted)?.page ??
    null;
  recordEvent(io.cwd, io.env, {
    event: 'lookup',
    command: 'docs',
    arguments: [name],
    results: page ? [page] : [],
  });
  if (page) {
    const whole = docs.markdown(page);
    const section = args.section;
    const markdown = section ? sectionOf(whole, section) : whole;
    if (markdown === null) {
      const names = sectionNames(whole);
      const message = `The ${page} page has no "${section}" section. Its sections: ${names.join(', ') || 'none'}.`;
      if (args.json)
        io.out(JSON.stringify({ error: message, sections: names }));
      else io.err(message);
      return 2;
    }
    io.out(
      args.json
        ? JSON.stringify({
            id: page,
            ...(section ? { section } : {}),
            markdown,
          })
        : markdown.trimEnd(),
    );
    return 0;
  }
  const bare = docs.exports.some(entry => entry.name.toLowerCase() === wanted);
  if (bare) {
    const message = `"${name}" is exported, but documented on no page.`;
    if (args.json) io.out(JSON.stringify({ error: message, closest: null }));
    else io.err(message);
    return 2;
  }
  const closest = closestPage(name, docs.pages, docs.exports);
  const hint = closest
    ? ` The closest page is ${closest}: blip docs ${closest}`
    : '';
  if (args.json)
    io.out(JSON.stringify({ error: `No page or export "${name}"`, closest }));
  else io.err(`No page or export "${name}".${hint}`);
  return 2;
};
