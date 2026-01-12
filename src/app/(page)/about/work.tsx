import Image from 'next/image';

import { Headline } from '@/ui/headline';
import { Link } from '@/ui/link';

import marigold from './images/marigold.svg';

export const Work = () => (
  <div className="grid gap-8">
    <Headline level="3" as="h2">
      Current Role
    </Headline>
    <Image className="w-52 md:w-72" src={marigold} alt="Marigold Logo" />
    <div className="prose">
      <p>
        My current focus is{' '}
        <Link href="https://www.marigold-ui.io/">Marigold</Link>, the design
        system at Reservix that I helped establish. We are updating a design
        language that has served us for over a decade.
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
