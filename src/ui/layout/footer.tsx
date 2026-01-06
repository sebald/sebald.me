import {
  CopyrightIcon,
  CubeIcon,
  FileTextIcon,
  RssIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { PropsWithChildren } from 'react';

import { socialLinks } from '@/app.config';
import { cn } from '@/lib/styles.utils';
import { ConsentUpdate } from '@/ui/analytics/consent-update';
import { Divider } from '@/ui/divider';
import { GithubIcon } from '@/ui/icon/github-icon';
import { LinkedInIcon } from '@/ui/icon/linkedin-icon';
import { XComIcon } from '@/ui/icon/x-com-icon';
import { Link } from '@/ui/link';

const Headline = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => (
  <h6
    className={cn(
      'text-black-400 font-sans text-xs font-bold uppercase leading-none',
      className,
    )}
  >
    {children}
  </h6>
);

const Social = () => (
  <div className="col-start-2 row-start-1 flex items-start gap-8 md:col-auto md:row-auto">
    <Link
      aria-label="Sebastian's GitHub Profile"
      variant="inherit"
      noUnderline
      href={socialLinks.github}
      target="_blank"
    >
      <GithubIcon size={24} />
    </Link>
    <Link
      aria-label="Sebastian's LinkedIn Profile"
      variant="inherit"
      noUnderline
      href={socialLinks.linkedin}
      target="_blank"
    >
      <LinkedInIcon size={24} />
    </Link>
    <Link
      aria-label="Sebastian's X Profile"
      variant="inherit"
      noUnderline
      href={socialLinks.x}
      target="_blank"
    >
      <XComIcon size={24} />
    </Link>
  </div>
);

const Links = () => (
  <div className="flex flex-col gap-2">
    <Headline>Links</Headline>
    <Link
      aria-label="View site content formatted for LLMs"
      variant="inherit"
      noUnderline
      href="/llms.txt"
    >
      <FileTextIcon size={16} />
      llms.txt
    </Link>
    <Link
      aria-label="View RSS feed"
      variant="inherit"
      noUnderline
      href="/rss.xml"
    >
      <RssIcon size={16} />
      RSS Feed
    </Link>
    <Link
      aria-label="View inventory"
      variant="inherit"
      noUnderline
      href="/inventory"
    >
      <CubeIcon size={16} />
      Inventory
    </Link>
  </div>
);

const Legal = () => (
  <div className="col-span-2 flex justify-between md:col-span-1 md:flex-col md:gap-2">
    <Headline className="hidden md:block">Legal</Headline>
    <Link variant="inherit" noUnderline href="/imprint">
      Imprint
    </Link>
    <span className="text-muted text-sm md:hidden">·</span>
    <Link variant="inherit" noUnderline href="/privacy">
      Privacy Policy
    </Link>
    <span className="text-muted text-sm md:hidden">·</span>
    <ConsentUpdate />
  </div>
);

// Component
// ---------------
export const Footer = () => (
  <div className="fit-prose text-muted px-4 pb-8 pt-28 md:px-0">
    <Divider variant="light" />
    <div className="grid grid-cols-[1fr_max-content] gap-y-10 pt-10 text-sm md:grid-cols-[max-content_1fr_max-content] md:gap-x-24">
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
