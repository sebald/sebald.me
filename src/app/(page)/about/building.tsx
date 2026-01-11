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
        Currently, I am working primarily on Marigold, the design system at
        Reservix I helped to establish. We are undertaking the massive task of
        updating a design language that has served us for over a decade.
      </p>
      <p>
        We are modernizing not just the look and feel of our platform but also
        the way we build it. My team and I actively advocate for modern
        engineering standards and mentor our colleagues to ensure we are all
        moving forward together.
      </p>
      <p>
        Marigold is utilized throughout the entire software department, spanning
        from our public ticket marketplace to our core ticketing software. We
        made sure that are not limited to modern React applications. We built a
        system which is universally applicable, allowing us to incrementally
        update our entire software landscape no matter how old the underlying
        technology might be.
      </p>
    </div>
  </div>
);
