/**
 * Ranking for `blip search` and the closest-name guess of `blip docs`. No
 * dependency: a page is scored over its title, summary, headings and text.
 */

export interface SearchPage {
  id: string;
  kind: string;
  title: string;
  summary: string;
  headings: string[];
  text: string;
}

export interface SearchExport {
  name: string;
  /** The page it is on, or null */
  page: string | null;
  kind: string;
}

export interface SearchExample {
  id: string;
  page: string;
  title: string;
  summary: string;
}

export interface Hit {
  type: 'page' | 'export' | 'example';
  id: string;
  kind: string;
  /** One line about it */
  line: string;
  /** The command that opens it */
  command: string;
  score: number;
}

/** Words that say nothing about what is looked for */
const STOP = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'before',
  'by',
  'can',
  'do',
  'for',
  'from',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'use',
  'what',
  'when',
  'with',
]);

/** `deleting`, `deleted`, `deletes` and `delete` meet at `delet` */
export const stem = (word: string) => {
  if (word.length <= 3) return word;
  if (word.length === 4) return word.replace(/s$/, '');
  return word.replace(/(ing|ed|es|s|e)$/, '');
};

/** Lowercase words of a text, camelCase split, stemmed */
export const words = (text: string) =>
  text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.map(stem) ?? [];

/** The words of a query that carry meaning */
export const queryTerms = (query: string) => {
  const all = query.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const kept = all.filter(word => !STOP.has(word));
  return [...new Set((kept.length > 0 ? kept : all).map(stem))];
};

/** The first sentence of a summary, short enough for a list */
export const oneLine = (summary: string, max = 100) => {
  const first = /^.*?[.!?](?=\s|$)/.exec(summary)?.[0] ?? summary;
  const text = first.replace(/[`*_]/g, '');
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
};

const count = (haystack: string[], term: string) =>
  haystack.reduce((n, word) => n + (word === term ? 1 : 0), 0);

const scorePage = (page: SearchPage, terms: string[]) => {
  const title = new Set([...words(page.title), ...words(page.id)]);
  const summary = new Set(words(page.summary));
  const headings = new Set(page.headings.flatMap(words));
  const text = words(page.text);
  return terms.reduce(
    (score, term) =>
      score +
      (title.has(term) ? 10 : 0) +
      (summary.has(term) ? 4 : 0) +
      (headings.has(term) ? 3 : 0) +
      Math.min(count(text, term), 5),
    0,
  );
};

const scoreExport = (entry: SearchExport, terms: string[]) => {
  const name = new Set(words(entry.name));
  return terms.reduce((score, term) => score + (name.has(term) ? 8 : 0), 0);
};

/** An example scores by its id and title, a little by what it says it shows */
const scoreExample = (example: SearchExample, terms: string[]) => {
  const title = new Set([...words(example.title), ...words(example.id)]);
  const summary = new Set(words(example.summary));
  return terms.reduce(
    (score, term) =>
      score + (title.has(term) ? 6 : 0) + (summary.has(term) ? 2 : 0),
    0,
  );
};

/**
 * Pages, exports and examples for a query, best first. A page wins a tie with
 * an example and an example with an export; an export that only repeats its
 * page's title is left out.
 */
export const search = (
  query: string,
  pages: readonly SearchPage[],
  exports: readonly SearchExport[],
  limit = 8,
  examples: readonly SearchExample[] = [],
): Hit[] => {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const hits: Hit[] = [];
  for (const page of pages) {
    const score = scorePage(page, terms);
    if (score > 0) {
      hits.push({
        type: 'page',
        id: page.id,
        kind: page.kind,
        line: oneLine(page.summary),
        command: `blip docs ${page.id}`,
        score,
      });
    }
  }
  for (const entry of exports) {
    if (entry.kind === 'type' || entry.page === null) continue;
    const page = pages.find(page => page.id === entry.page);
    if (page && page.title.toLowerCase() === entry.name.toLowerCase()) continue;
    const score = scoreExport(entry, terms);
    if (score > 0) {
      hits.push({
        type: 'export',
        id: entry.name,
        kind: entry.kind,
        line: `${entry.kind} on the ${entry.page} page`,
        command: `blip docs ${entry.name}`,
        score,
      });
    }
  }

  for (const example of examples) {
    const score = scoreExample(example, terms);
    if (score > 0) {
      hits.push({
        type: 'example',
        id: example.id,
        kind: 'example',
        line: oneLine(example.summary || example.title),
        command: `blip examples ${example.id}`,
        score,
      });
    }
  }

  // A page wins a tie with an example, an example with an export
  const rank = { page: 0, example: 1, export: 2 };
  return hits
    .map((hit, index) => ({ hit, index }))
    .sort(
      (a, b) =>
        b.hit.score - a.hit.score ||
        rank[a.hit.type] - rank[b.hit.type] ||
        a.index - b.index,
    )
    .slice(0, limit)
    .map(({ hit }) => hit);
};

/** Edit distance between two strings */
export const distance = (a: string, b: string) => {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        previous[j]! + 1,
        row[j - 1]! + 1,
        previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = row;
  }
  return previous[b.length]!;
};

/**
 * The page nearest to a name that is none: by edit distance to a page id or
 * an export's name, a name that contains it or is contained counting as near.
 */
export const closestPage = (
  name: string,
  pages: readonly { id: string }[],
  exports: readonly SearchExport[],
): string | null => {
  const wanted = name.toLowerCase();
  const candidates = [
    ...pages.map(page => ({ label: page.id, page: page.id })),
    ...exports.flatMap(entry =>
      entry.page ? [{ label: entry.name, page: entry.page }] : [],
    ),
  ];
  let best: { page: string; cost: number } | null = null;
  for (const { label, page } of candidates) {
    const other = label.toLowerCase().replaceAll('-', '');
    const near = other.includes(wanted) || wanted.includes(other);
    const cost = near
      ? Math.abs(other.length - wanted.length) / 2
      : distance(wanted.replaceAll('-', ''), other);
    if (!best || cost < best.cost) best = { page, cost };
  }
  // Too far from every name to be a misspelling of one
  return best && best.cost <= Math.max(3, wanted.length / 2) ? best.page : null;
};
