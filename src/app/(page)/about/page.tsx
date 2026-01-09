import type { Metadata } from 'next';

import { Headline } from '@/ui/headline';

import { Avatar } from './avatar';

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
      <div className="grid gap-8">
        <div className="grid grid-cols-[minmax(0,40%)_1fr] gap-12">
          <Avatar />
          <div className="prose place-self-end">
            <p className="text-3xl font-semibold">
              Hey there! My name is Sebastian.
            </p>
            <p>
              I am a software architect at Reservix located in Freiburg,
              Germany. My focus is design engineering, allowing me to operate
              right in the middle where code meets user experience. I create
              digital products that are accessible, intuitive, and delightful to
              use.
            </p>
          </div>
        </div>
        <div className="prose">
          <p>
            Design Systems are at the core of my work. To me, design sytems are
            much more than just a UI kit or component library. They are the
            infrastructure that helps teams ship great products smoothly at
            scale. The services and processes within them help bridge the gap
            between design vision and code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
