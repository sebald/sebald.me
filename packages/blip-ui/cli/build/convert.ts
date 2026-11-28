/**
 * MDX to markdown by text substitution, not an MDX compile (spec 2.3). The
 * pages use three Storybook blocks (`Meta`, `Canvas`, `Controls`), imports
 * and Storybook links outside their code fences, and nothing else.
 */

import { type Rule, type WhenNot, ruleInline, rulesMarkdown } from '../rules.ts';

/** A Storybook docs link, such as `[IconButton](?path=/docs/components-iconbutton--docs)` */
const STORYBOOK_LINK =
  /\[([^\]]+)\]\(\?path=\/docs\/([a-z0-9-]+?)--[a-z0-9-]+\)/g;

/** The blocks that exist only for Storybook, each on a line of its own */
const BLOCK = /^<(?:Meta|Canvas)\b[^>]*\/>\s*$/;

/** Storybook's props table, which the build replaces with the real one */
const CONTROLS = /^<Controls\b[^>]*\/>\s*$/;

/** `<Canvas of={DialogStories.Default} />`: the stories' namespace and the story */
const CANVAS = /^<Canvas\s+of=\{(\w+)\.(\w+)\}\s*\/>\s*$/;

/** A page's rules, `<Rules for="dialog" />` on a line of its own */
const RULES_BLOCK = /^<Rules\s+for="([^"]+)"\s*\/>\s*$/;

/** One rule inline, `<Rule id="C-DIALOG-1" />` */
const RULE_INLINE = /<Rule\s+id="([^"]+)"\s*\/>/g;

/** The rules the blocks `<Rules>` and `<Rule>` print */
export interface RulesLookup {
  forPage: (page: string) => Rule[];
  whenNotFor: (page: string) => WhenNot[];
  byId: (id: string) => Rule | undefined;
}

/** The page a Storybook slug (`components-iconbutton`) points at, if it is shipped */
export const pageForSlug = (slug: string, ids: readonly string[]) => {
  // A title of words keeps its dashes (`guides-menus-and-forms`), one in
  // camel case loses them (`components-iconbutton`); of those spelled out,
  // the longest page that ends it: `menus-and-forms`, not `forms`
  const spelled = ids
    .filter(id => slug === id || slug.endsWith(`-${id}`))
    .sort((a, b) => b.length - a.length)[0];
  if (spelled) return spelled;
  const last = slug.split('-').pop() ?? slug;
  return ids.find(id => id.replaceAll('-', '') === last);
};

/**
 * The page as markdown. `ids` are the shipped pages, so a Storybook link can
 * become the command that opens its page (or just its text, when the page is
 * not shipped). A `<Canvas>` becomes `canvas`'s answer for its story (the
 * source of the example the story renders) and is dropped when there is none.
 */
export const mdxToMarkdown = (
  mdx: string,
  ids: readonly string[] = [],
  /** What `<Controls />` becomes (the props table), or goes before the first `##` of a page without one */
  controls = '',
  /** What a `<Canvas>` becomes: the markdown for a story's example, or nothing */
  canvas?: (namespace: string, story: string) => string | undefined,
  rules: RulesLookup = { forPage: () => [], whenNotFor: () => [], byId: () => undefined },
) => {
  const out: string[] = [];
  let fence: string | null = null;
  let skipping = false;
  let placed = false;
  let firstSection = -1;

  for (const line of mdx.replaceAll('\r\n', '\n').split('\n')) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker;
      else if (marker.startsWith(fence)) fence = null;
      out.push(line);
      continue;
    }
    if (fence !== null) {
      out.push(line);
      continue;
    }

    // An import runs until the line that names its module
    if (skipping) {
      skipping = !/\bfrom\s+['"][^'"]+['"]/.test(line);
      continue;
    }
    if (/^import\b/.test(line)) {
      skipping = !/\bfrom\s+['"][^'"]+['"]|^import\s+['"]/.test(line);
      continue;
    }
    const shown = CANVAS.exec(line);
    if (shown && canvas) {
      const example = canvas(shown[1]!, shown[2]!);
      if (example) out.push(example);
      continue;
    }
    if (BLOCK.test(line)) continue;
    if (CONTROLS.test(line)) {
      if (controls && !placed) out.push(controls);
      placed = true;
      continue;
    }
    if (/^##\s/.test(line) && firstSection < 0) firstSection = out.length;

    const forPage = RULES_BLOCK.exec(line)?.[1];
    if (forPage !== undefined) {
      const list = rules.forPage(forPage);
      const block = rulesMarkdown(list, rules.whenNotFor(forPage));
      if (block === '')
        throw new Error(
          `<Rules for="${forPage}" />: the page has no rules to show`,
        );
      out.push(block);
      continue;
    }

    out.push(
      line
        .replace(RULE_INLINE, (_, id: string) => {
          const rule = rules.byId(id);
          if (!rule) throw new Error(`<Rule id="${id}" />: no such rule`);
          return ruleInline(rule);
        })
        .replace(STORYBOOK_LINK, (_, text: string, slug: string) => {
          const id = pageForSlug(slug, ids);
          return id ? `${text} (\`blip docs ${id}\`)` : text;
        }),
    );
  }

  // A page with no `<Controls />` still gets its table, before its first section
  if (controls && !placed) {
    out.splice(firstSection < 0 ? out.length : firstSection, 0, controls, '');
  }

  // Dropping a block leaves its blank lines behind
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
};

/** The first heading's text, which names the page */
export const titleOf = (markdown: string) =>
  /^#\s+(.+)$/m.exec(markdown)?.[1]?.trim() ?? '';

/** The first paragraph after the title, on one line */
export const summaryOf = (markdown: string) => {
  const start = markdown.search(/^#\s+/m);
  if (start < 0) return '';
  const paragraph = markdown
    .slice(start)
    .split('\n')
    .slice(1)
    .join('\n')
    .split(/\n{2,}/)
    .map(block => block.trim())
    .find(block => block && !/^(#|```|[-*|]|\d+\.)/.test(block));
  return (paragraph ?? '').replace(/\s*\n\s*/g, ' ');
};

/** `##` headings and below, in order */
export const headingsOf = (markdown: string) =>
  [...markdown.matchAll(/^##+\s+(.+)$/gm)].map(match => match[1]!.trim());
