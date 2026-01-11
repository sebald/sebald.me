import Image from 'next/image';

import { Headline } from '@/ui/headline';

export const Building = () => (
  <div>
    <Headline level="3" as="h2">
      Today
    </Headline>
    <div>
      <Image src="" alt="Marigold components" />
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
        moving forward together. Marigold is utilized throughout the entire
        software department, spanning from our public ticket marketplace to our
        internal core software.
      </p>
      <p>
        We ensured that Marigold is not limited to our modern React
        applications. We built it to be universally applicable, allowing us to
        incrementally update our entire software landscape no matter how old the
        underlying technology might be.
      </p>
    </div>
  </div>
);
