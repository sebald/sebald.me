'use client';

import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

/**
 * The UI's sounds by what happened, not by how they sound: the game
 * decides what plays (or nothing, by default).
 * - `move`: the cursor moved, a value stepped
 * - `confirm`: something was picked
 * - `back`: stepping back, Escape, Cancel
 * - `bump`: a disabled item was picked
 * - `tick`, `ping`: a clock's seconds, and its warning
 */
export type FeedbackEvent =
  | 'move'
  | 'confirm'
  | 'back'
  | 'bump'
  | 'tick'
  | 'ping';

export type Feedback = (event: FeedbackEvent) => void;

const FeedbackContext = createContext<Feedback>(() => {});

/** Play a UI sound, if the game around gave the kit a way to */
export const useFeedback = () => useContext(FeedbackContext);

/** How the game plays the kit's UI sounds */
export const FeedbackProvider = ({
  play,
  children,
}: PropsWithChildren<{ play: Feedback }>) => (
  <FeedbackContext.Provider value={play}>{children}</FeedbackContext.Provider>
);
