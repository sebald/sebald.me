'use client';

import type { PropsWithChildren } from 'react';

import { Headline } from '@/ui/headline';
import { Text } from '@/ui/text';

import { BurstDemo } from './burst-demo';
import { Cast, CharacterPlayground } from './character-playground';
import { GhostDemo } from './ghost-demo';
import { HudDemo } from './hud-demo';
import { Sandbox } from './sandbox';
import { SceneViewer } from './scene-viewer';
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
 * The game's inventory: every piece on its own, with controls, the way
 * the site's inventory shows its components. Dev only.
 */
export const Inventory = () => (
  <div className="grid gap-24">
    <Section
      title="Character"
      blurb="One duellist from its sheet. Idle breathes, talk alternates the mouth while typing, taunt steps toward the opponent (further on a mic drop), flinch steps back with a flash."
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
      blurb="The names, the momentum pips, the composure strip and the shared scale with its marker, every number on a control."
    >
      <HudDemo />
    </Section>
    <Section
      title="Window"
      blurb="The quiet window with a line typing, and with the opponent's phrase, the prompt and the picker. The legend at the bottom names the keys, or the tap after a touch."
    >
      <WindowDemo />
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
