import {
  CopyrightIcon,
  CubeIcon,
  FileTextIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  RssIcon,
  SquareIcon,
  XLogoIcon,
} from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';

import { socialLinks } from '@/app.config';
import { ConsentUpdate } from '@/ui/analytics/consent-update';
import { Divider } from '@/ui/divider';
import { Link } from '@/ui/link';

const Headline = ({ children }: PropsWithChildren) => (
  <h6 className="text-mist-300 hidden font-sans text-xs font-bold uppercase md:block">
    {children}
  </h6>
);

const Social = () => (
  <div className="col-start-2 row-start-1 flex items-start gap-8 md:col-auto md:row-auto md:gap-10">
    <Link
      aria-label="Sebastian's GitHub Profile"
      variant="inherit"
      href={socialLinks.github}
      target="_blank"
    >
      <GithubLogoIcon size={28} />
    </Link>
    <Link
      aria-label="Sebastian's LinkedIn Profile"
      variant="inherit"
      href={socialLinks.linkedin}
      target="_blank"
    >
      <LinkedinLogoIcon size={28} />
    </Link>
    <Link
      aria-label="Sebastian's X Profile"
      variant="inherit"
      href={socialLinks.x}
      target="_blank"
    >
      <XLogoIcon size={28} />
    </Link>
  </div>
);

const Links = () => (
  <div className="flex flex-col gap-2.5">
    <Headline>Links</Headline>
    <Link
      aria-label="View site content formatted for LLMs"
      variant="inherit"
      href="/llms.txt"
    >
      <FileTextIcon size={16} />
      llms.txt
    </Link>
    <Link aria-label="View RSS feed" variant="inherit" href="/rss.xml">
      <RssIcon size={16} />
      RSS Feed
    </Link>
    <Link aria-label="View inventory" variant="inherit" href="/inventory">
      <CubeIcon size={16} />
      Inventory
    </Link>
  </div>
);

const Legal = () => (
  <div className="col-span-2 flex items-center justify-center gap-2 md:col-span-1 md:flex-col md:items-start md:justify-start md:gap-2.5">
    <Headline>Legal</Headline>
    <Link variant="inherit" href="/imprint">
      Imprint
    </Link>
    <SquareIcon size={5} weight="fill" className="text-mist-600 md:hidden" />
    <Link variant="inherit" href="/privacy">
      Privacy Policy
    </Link>
    <SquareIcon size={5} weight="fill" className="text-mist-600 md:hidden" />
    <ConsentUpdate />
  </div>
);

// Component
// ---------------
export const Footer = () => (
  <div className="w-content text-mist-400 mx-auto pt-36 pb-8">
    <Divider />
    <div className="grid grid-cols-[1fr_max-content] gap-y-12 pt-10 text-sm md:grid-cols-[max-content_1fr_max-content] md:gap-x-24">
      <Links />
      <Legal />
      <Social />
    </div>
    <div className="flex items-center justify-center gap-1 pt-4 text-sm md:justify-start md:pt-8">
      <CopyrightIcon size={14} />
      {new Date().getFullYear()} Sebastian Sebald
    </div>
  </div>
);
