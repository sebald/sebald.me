import Image from 'next/image';

import { Card } from '@/ui/card';
import { Headline } from '@/ui/headline';

import marigoldComponents from './images/marigold-components.webp';
import marigoldLogo from './images/marigold-logo.svg';

export const Current = () => (
  <div className="grid gap-4">
    <Headline level="3" as="h2">
      Current Role
    </Headline>
    <div className="grid grid-cols-[1fr_max-content] items-start gap-6">
      <div className="prose">
        <p>
          My current focus is Marigold, the design system at Reservix that I
          helped establish. We are updating a design language that has served us
          for over a decade.
        </p>
        <p>
          We are modernizing not just the look and feel of our platform but also
          the way we build it. My team and I actively advocate for modern
          engineering standards and mentor our colleagues to ensure we all move
          forward together.
        </p>
        <p>
          Marigold spans our entire product suite, from the marketplace to our
          core ticketing software. Although focused on React, its technology
          agnostic architecture allows us to incrementally modernize our
          landscape regardless of the underlying technology.
        </p>
      </div>
      <div className="grid items-start gap-4">
        <Card variant="clear" inset="tight">
          <Image
            className="rounded-3xl"
            src={marigoldLogo}
            alt="Marigold components"
          />
        </Card>
        <Card variant="clear" inset="none">
          <div className="rounded-4xl aspect-video w-96 overflow-hidden">
            <Image
              src={marigoldComponents}
              blurDataURL={marigoldComponents.blurDataURL}
              className="w-[1000px]"
              alt="Marigold components"
            />
          </div>
        </Card>
      </div>
    </div>
  </div>
);
