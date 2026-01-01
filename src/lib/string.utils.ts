export const truncateAtWord = (text: string, length: number) => {
  if (text.length <= length) return text;

  const lastSpaceIndex = text.substring(0, length).lastIndexOf(' ');
  return text.substring(0, lastSpaceIndex > 0 ? lastSpaceIndex : length) + '…';
};
