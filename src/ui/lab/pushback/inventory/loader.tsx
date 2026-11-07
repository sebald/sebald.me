'use client';

import dynamic from 'next/dynamic';

// Canvases, clocks and `matchMedia` everywhere: client only, like the game
export const Inventory = dynamic(
  () => import('./inventory').then(module => module.Inventory),
  { ssr: false, loading: () => <p className="font-mono">Loading…</p> },
);
