import type { Metadata } from 'next';

import { Headline } from '@/ui/headline';

// Config
// ---------------
export const revalidate = false;

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'About',
  description: 'About page',
};

// Page
// ---------------
const AboutPage = () => {
  return (
    <div className="fit-prose grid gap-12 md:gap-16">
      <Headline level="2" variant="accent" as="h1">
        About
      </Headline>
      <div className="prose">
        <p>
          Hey, my name is Sebastian. I am a Software Architect at Reservix
          located in Freiburg, Germany. My focus is Design Engineering, allowing
          me to operate right in the middle where code meets user experience. I
          create digital products that are accessible, intuitive, and delightful
          to use.
        </p>
        <p>
          The core of my work is Design Systems. To me, they are much more than
          just a UI kit or component library. They are the infrastructure that
          helps the team ship great products smoothly. The services and
          processes within them help bridge the gap between design vision and
          code.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;
