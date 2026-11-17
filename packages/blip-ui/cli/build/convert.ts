/**
 * MDX to markdown by text substitution, not an MDX compile (spec 2.3). The
 * pages use three Storybook blocks (`Meta`, `Canvas`, `Controls`), imports
 * and Storybook links outside their code fences, and nothing else.
 */

/** A Storybook docs link, such as `[IconButton](?path=/docs/components-iconbutton--docs)` */
const STORYBOOK_LINK =
  /\[([^\]]+)\]\(\?path=\/docs\/([a-z0-9-]+?)--[a-z0-9-]+\)/g;

/** The blocks that exist only for Storybook, each on a line of its own */
const BLOCK = /^<(?:Meta|Canvas|Controls)\b[^>]*\/>\s*$/;

/** The page a Storybook slug (`components-iconbutton`) points at, if it is shipped */
export const pageForSlug = (slug: string, ids: readonly string[]) => {
  const last = slug.split('-').pop() ?? slug;
  return ids.find(id => id.replaceAll('-', '') === last);
};

/**
 * The page as markdown. `ids` are the shipped pages, so a Storybook link can
 * become the command that opens its page (or just its text, when the page is
 * not shipped).
 */
export const mdxToMarkdown = (mdx: string, ids: readonly string[] = []) => {
  const out: string[] = [];
  let fence: string | null = null;
  let skipping = false;

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
    if (BLOCK.test(line)) continue;

    out.push(
      line.replace(STORYBOOK_LINK, (_, text: string, slug: string) => {
        const id = pageForSlug(slug, ids);
        return id ? `${text} (\`blip docs ${id}\`)` : text;
      }),
    );
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
