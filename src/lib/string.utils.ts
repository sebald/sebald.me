export const truncateAtWord = (text: string, length: number) => {
  if (text.length <= length) return text;

  const lastSpaceIndex = text.substring(0, length).lastIndexOf(' ');
  return text.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : length) + '…';
};

export const toKebabCase = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

/**
 * Minutes it takes to read a markdown text, rounded up. Code blocks don't
 * count.
 */
export const readingTime = (markdown: string, wordsPerMinute: number = 230) => {
  const words = markdown
    .replace(/```[\s\S]*?```/g, '')
    .split(/\s+/)
    .filter(word => /\w/.test(word)).length;

  return Math.max(1, Math.ceil(words / wordsPerMinute));
};
