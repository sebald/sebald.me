'use client';

import dynamic from 'next/dynamic';

import { Stage } from './stage';

// The game reads `localStorage` and `matchMedia` on mount and later draws
// into a canvas, none of which exists on the server, so it is client-only.
// `ssr: false` is only allowed in a Client Component, hence this wrapper.
const Pushback = dynamic(
  () => import('./pushback').then(module => module.Pushback),
  {
    ssr: false,
    loading: () => (
      <Stage>
        <Stage.Center>
          <Stage.Muted>Loading…</Stage.Muted>
        </Stage.Center>
      </Stage>
    ),
  },
);

export const Game = () => <Pushback />;
