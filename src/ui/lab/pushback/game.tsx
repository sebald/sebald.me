'use client';

import dynamic from 'next/dynamic';

import { PALETTE } from './palette';
import { Stage } from './stage';
import { Muted } from './text';

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
          <Muted>Loading…</Muted>
        </Stage.Center>
      </Stage>
    ),
  },
);

/**
 * The game, in the element that goes fullscreen: the stage centred on
 * the dark ground, every screen inside it
 */
export const Game = () => (
  <div
    // The fullscreen element (`fullscreen.ts`)
    data-pushback-root
    className="[&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:overflow-y-auto [&:fullscreen]:bg-(--pb-bg)"
    style={{ ['--pb-bg' as string]: PALETTE.bg }}
  >
    <Pushback />
  </div>
);
