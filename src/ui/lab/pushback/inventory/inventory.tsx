'use client';

import type { PropsWithChildren } from 'react';

import { Headline } from '@/ui/headline';
import { Text } from '@/ui/text';

import { BurstDemo } from './burst-demo';
import { Cast, CharacterPlayground } from './character-playground';
import { DemoDemo } from './demo-demo';
import { PaletteDemo, PickerDemo, StampDemo, TextDemo } from './foundations';
import { GhostDemo } from './ghost-demo';
import { HudDemo } from './hud-demo';
import { LedgerDemo } from './ledger-demo';
import { ResultDemo } from './result-demo';
import { Sandbox } from './sandbox';
import { SceneViewer } from './scene-viewer';
import { TimerDemo } from './timer-demo';
import { WindowDemo } from './window-demo';

const Section = ({
  title,
  blurb,
  children,
}: PropsWithChildren<{ title: string; blurb: string }>) => (
  <section className="grid gap-4">
    <div className="grid gap-1">
      <Headline level="2">{title}</Headline>
      <Text>{blurb}</Text>
    </div>
    {children}
  </section>
);

/**
 * The game's inventory: the style guide first (the palette, the
 * letters, the window and the picker every screen is built from), then
 * every piece on its own with controls, the way the site's inventory
 * shows its components. Dev and preview only.
 */
export const Inventory = () => (
  <div className="grid gap-24">
    <Section
      title="Palette"
      blurb="Every colour of the chrome and the letters, from one list (palette.ts): the canvas reads the hex, the DOM the CSS variable the stage sets. The sprites and the rooms keep their own."
    >
      <PaletteDemo />
    </Section>
    <Section
      title="Text"
      blurb="The letters by role (text.tsx): headings, body, the muted line for prompts and hints, the loud one that blinks, and a line of dialogue with its speaker's mark. Sizes are the caller's, in em."
    >
      <TextDemo />
    </Section>
    <Section
      title="Picker"
      blurb="The list the player moves through: the cursor, the loud item in gold, items the ghost has dimmed, a disabled one the cursor still stops on, a description box beside the window saying why. In a short window it scrolls on a rail (see Window)."
    >
      <PickerDemo />
    </Section>
    <Section
      title="Stamp"
      blurb="A rubber stamp in pixels (stamp.tsx), one component for every word: SHIPPED on a role the Stakeholder signed off (the select screen), DONE on a colleague beaten and FLAWLESS in gold on one beaten without losing an exchange (the roster). Tilted in steps between letters, worn on the frame, darkened inside so it reads over a face. At the end of a duel it lands large between the duellists (SlamStamp), turned on the stage's grid: DONE, FLAWLESS, or REJECTED on a loss."
    >
      <StampDemo />
    </Section>
    <Section
      title="Ledger"
      blurb="Numbers in rows with a dot leader from the label to the value, and the meter: a pool's boxes, lit as far as it is collected."
    >
      <LedgerDemo />
    </Section>
    <Section
      title="Window"
      blurb="The quiet window with a line typing; with the opponent's phrase, the prompt and the counters; with the hand and a closer on offer; and with ten options in a short window, where the list scrolls on its rail. The legend at the bottom names the keys, or the tap after a touch."
    >
      <WindowDemo />
    </Section>
    <Section
      title="Timer"
      blurb="The silence bar (silence-timer.tsx): a row that grows in at the top of the dialogue window while the player picks a counter, a … bubble and a line burning back from both ends, its ends faded in dither steps. Gold while a counter still counts as fast, a flash when that half is gone, ember after it, red and blinking for the last quarter while the bubble's dots go out. Play it or hold it with the slider."
    >
      <TimerDemo />
    </Section>
    <Section
      title="Character"
      blurb="One duellist from its sheet. Idle breathes, talk alternates the mouth while typing, taunt steps toward the opponent (further on a mic drop), flinch steps back with a flash and flickers for a second."
    >
      <CharacterPlayground />
    </Section>
    <Section title="Cast" blurb="Everyone, idle, with the props they carry.">
      <Cast />
    </Section>
    <Section
      title="Ghost"
      blurb="The predecessor's ghost: hovering, pointing from the second whisper on, in and out of its black hole."
    >
      <GhostDemo />
    </Section>
    <Section
      title="Mic drop"
      blurb="The burst that goes off between the duellists: pulsing while the phrase is thrown, popped when it is countered."
    >
      <BurstDemo />
    </Section>
    <Section
      title="Bars"
      blurb="The names, the momentum pips and the shared scale as a beam clash, every number on a control."
    >
      <HudDemo />
    </Section>
    <Section
      title="Demo"
      blurb="The attract mode as the title plays it after twenty seconds: the AI on both sides under the arcade stamp. Next demo, or any key, starts another."
    >
      <DemoDemo />
    </Section>
    <Section
      title="Result"
      blurb="The end of a run as a status screen: the face, the numbers with dot leaders, the glossary by pool."
    >
      <ResultDemo />
    </Section>
    <Section
      title="Scenes"
      blurb="The four rooms with the stands and the clear band as guides."
    >
      <SceneViewer />
    </Section>
    <Section
      title="Duel"
      blurb="The whole duel screen at a fixed scale, started in any state."
    >
      <Sandbox />
    </Section>
  </div>
);
