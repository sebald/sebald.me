import { useEffect, useState } from 'react';

// Reveal anyway if a load event goes missing
const REVEAL_TIMEOUT = 3000;

/**
 * Tracks `count` images until each has loaded or failed, so they can be
 * revealed together. Returns whether all have settled and the handler to pass
 * to each image's `onLoad` and `onError`.
 */
export const useImagesSettled = (count: number) => {
  const [pending, setPending] = useState(count);

  useEffect(() => {
    const timeout = setTimeout(() => setPending(0), REVEAL_TIMEOUT);
    return () => clearTimeout(timeout);
  }, []);

  const handleSettled = () => setPending(n => n - 1);
  return [pending <= 0, handleSettled] as const;
};
