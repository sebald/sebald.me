'use client';

import { Announcer, FeedbackProvider, Text } from '@sebald/blip-ui';
import dynamic from 'next/dynamic';
import { useRef } from 'react';

import type { PushbackEvent } from '../lib/events';
import { PALETTE } from './palette';
import { Stage } from './stage';
import { TrackingProvider } from './tracking';
import { feedback } from './use-sound';

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
          <Text>Loading…</Text>
        </Stage.Center>
      </Stage>
    ),
  },
);

export interface GameProps {
  /**
   * Called at the moments worth counting (`PushbackEvent`): a run
   * started or finished, a duel started, ended or left, … The same
   * events bubble up from the game's root as `PUSHBACK_EVENT`.
   */
  onEvent?: (event: PushbackEvent) => void;
}

/**
 * The game, in the element that goes fullscreen: the stage centred on
 * the dark ground, every screen inside it, Blip UI's parts sounding as
 * the game does and speaking through one live region
 */
export const Game = ({ onEvent }: GameProps) => {
  const root = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={root}
      // The element that goes fullscreen (Blip UI's `toggleFullscreen`)
      data-fullscreen-root
      className="[&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:overflow-y-auto [&:fullscreen]:bg-(--pb-bg)"
      style={{ ['--pb-bg' as string]: PALETTE.bg }}
    >
      <TrackingProvider onEvent={onEvent} target={root}>
        <FeedbackProvider play={feedback}>
          {/* One live region for every screen: each renders its own stage,
              and a screen speaks from outside it (the duel's narration) */}
          <Announcer>
            <Pushback />
          </Announcer>
        </FeedbackProvider>
      </TrackingProvider>
    </div>
  );
};
