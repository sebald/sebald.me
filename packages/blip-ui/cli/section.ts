/**
 * One section of a page: the `##` heading whose text is the name (or starts
 * with it, so `props` finds "Props" and `usage` "Usage and rules") up to the
 * next `##`. Its `###` parts come with it. Headings inside code fences are
 * not headings.
 */

interface Heading {
  line: number;
  level: number;
  text: string;
}

const headings = (lines: readonly string[]): Heading[] => {
  const found: Heading[] = [];
  let fence: string | null = null;
  lines.forEach((line, index) => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (fence === null) fence = marker;
      else if (marker.startsWith(fence)) fence = null;
      return;
    }
    if (fence !== null) return;
    const match = /^(#{2,6})\s+(.+?)\s*$/.exec(line);
    if (match) {
      found.push({ line: index, level: match[1]!.length, text: match[2]! });
    }
  });
  return found;
};

/** The `##` sections' names, in order */
export const sectionNames = (markdown: string) =>
  headings(markdown.split('\n'))
    .filter(heading => heading.level === 2)
    .map(heading => heading.text);

/** The section's markdown, or null when the page has none by that name */
export const sectionOf = (markdown: string, name: string): string | null => {
  const lines = markdown.split('\n');
  const all = headings(lines);
  const wanted = name.toLowerCase();
  const start = all.findIndex(
    heading =>
      heading.level === 2 &&
      (heading.text.toLowerCase() === wanted ||
        heading.text.toLowerCase().startsWith(`${wanted} `)),
  );
  if (start < 0) return null;
  const next = all.slice(start + 1).find(heading => heading.level <= 2);
  return lines
    .slice(all[start]!.line, next?.line ?? lines.length)
    .join('\n')
    .trimEnd();
};
