import type { Metadata } from 'next';

import { navItems } from '@/app.config';
import { Headline } from '@/ui/headline';

import { Bio } from './bio';
import { Connect } from './connect';
import { Work } from './work';

// Config
// ---------------
export const revalidate = false;
const page = navItems.find(item => item.href === '/about')!;

// Meta
// ---------------
export const metadata: Metadata = {
  title: page.title,
  description: page.description,
};

// Page
// ---------------
const AboutPage = () => {
  return (
    <div className="fit-prose grid gap-16">
      <Headline level="4" variant="muted" as="h1">
        {page.title}
      </Headline>
      <div className="grid gap-40">
        <Bio />
        <Work />
        <Connect />
      </div>
    </div>
  );
};

export default AboutPage;
