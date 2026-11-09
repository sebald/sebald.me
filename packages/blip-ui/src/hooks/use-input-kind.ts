'use client';

import { useEffect, useState } from 'react';

export type InputKind = 'keys' | 'touch';

/**
 * What the player last used, keys or touch, so the legends name the
 * right thing. Starts from the pointer media query and follows the last
 * input from then on (a touch laptop can be both).
 */
export const useInputKind = (): InputKind => {
  const [kind, setKind] = useState<InputKind>(() =>
    typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
      ? 'touch'
      : 'keys',
  );
  useEffect(() => {
    const onKey = () => setKind('keys');
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'touch') setKind('touch');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, []);
  return kind;
};
