/**
 * The notes around the current one in a list sorted newest first: `older`
 * is the one after it, `newer` the one before it.
 */
export const neighbours = <T extends { url: string }>(
  sorted: T[],
  url: string,
) => {
  const index = sorted.findIndex(note => note.url === url);
  if (index === -1) return { newer: undefined, older: undefined };

  return {
    newer: index > 0 ? sorted[index - 1] : undefined,
    older: sorted[index + 1],
  };
};
