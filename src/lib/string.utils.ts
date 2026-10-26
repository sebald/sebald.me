export const truncateAtWord = (text: string, length: number) => {
  if (text.length <= length) return text;

  const lastSpaceIndex = text.substring(0, length).lastIndexOf(' ');
  return text.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : length) + '…';
};

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

/**
 * Seconds as `m:ss`, or `h:mm:ss` from one hour up.
 */
export const formatDuration = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds) || 0);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
};
