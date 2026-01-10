import type { Metadata } from 'next';

import { Headline } from '@/ui/headline';

import { Intro } from './intro';

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
      <Intro />
    </div>
  );
};

export default AboutPage;
