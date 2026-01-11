import type { Metadata } from 'next';

import { Headline } from '@/ui/headline';

import { Bio } from './bio';
import { Current } from './current';

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
    <div className="fit-prose grid gap-16 md:gap-24">
      <Headline level="2" variant="accent" as="h1">
        About
      </Headline>
      <Bio />
      <Current />
      <div>get in touch</div>
    </div>
  );
};

export default AboutPage;
