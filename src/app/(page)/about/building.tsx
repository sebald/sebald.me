import Image from 'next/image';

import { Headline } from '@/ui/headline';

import mariggoldLogo from './images/marigold-logo.svg';

export const Building = () => (
  <div>
    <Headline level="3" as="h2">
      Today
    </Headline>
    <div className="grid grid-cols-2 items-center justify-between gap-4">
      <Image
        className="rounded-3xl"
        src={mariggoldLogo}
        alt="Marigold components"
      />
    </div>
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
        agnostic architecture allows us to incrementally modernize our landscape
        regardless of the underlying technology.
      </p>
    </div>
  </div>
);
