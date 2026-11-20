'use client';

import { Game } from '@sebald/pushback';

import { trackPushback } from '@/lib/analytics';

/**
 * The game with its events sent to the site's analytics: a client
 * component, since the page cannot hand a function to one
 */
export const TrackedGame = () => <Game onEvent={trackPushback} />;
