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
import { Divider } from '@/ui/divider';
import { Link } from '@/ui/link';

// Visually hidden on mobile, but kept for assistive technology
const Headline = ({ children }: PropsWithChildren) => (
  <h2 className="sr-only font-sans text-xs font-bold text-mist-300 uppercase md:not-sr-only">
    {children}
  </h2>
);

const Social = () => (
  <div className="col-start-2 row-start-1 -mt-2 flex items-start gap-6 md:col-auto md:row-auto md:mt-0 md:gap-10">
    <Link
      aria-label="Sebastian's GitHub Profile"
      variant="inherit"
      href={socialLinks.github}
      target="_blank"
      className="size-11 justify-center"
    >
      <GithubLogoIcon size={28} aria-hidden />
    </Link>
    <Link
      aria-label="Sebastian's LinkedIn Profile"
      variant="inherit"
      href={socialLinks.linkedin}
      target="_blank"
      className="size-11 justify-center"
    >
      <LinkedinLogoIcon size={28} aria-hidden />
    </Link>
    <Link
      aria-label="Sebastian's X Profile"
      variant="inherit"
      href={socialLinks.x}
      target="_blank"
      className="size-11 justify-center"
    >
      <XLogoIcon size={28} aria-hidden />
    </Link>
  </div>
);

const Links = () => (
  <div className="flex flex-col gap-1 md:gap-2.5">
    <Headline>Links</Headline>
    <Link variant="inherit" className="py-2 md:py-0" href="/llms.txt">
      <FileTextIcon size={16} aria-hidden />
      llms.txt
    </Link>
    <Link variant="inherit" className="py-2 md:py-0" href="/rss.xml">
      <RssIcon size={16} aria-hidden />
      RSS Feed
    </Link>
    <Link variant="inherit" className="py-2 md:py-0" href="/inventory">
      <CubeIcon size={16} aria-hidden />
      Inventory
    </Link>
  </div>
);

const Legal = () => (
  <div className="col-span-2 flex items-center justify-center gap-2 md:col-span-1 md:flex-col md:items-start md:justify-start md:gap-2.5">
    <Headline>Legal</Headline>
    <Link variant="inherit" className="py-2 md:py-0" href="/imprint">
      Imprint
    </Link>
    <SquareIcon
      size={5}
      weight="fill"
      className="text-mist-600 md:hidden"
      aria-hidden
    />
    <Link variant="inherit" className="py-2 md:py-0" href="/privacy">
      Privacy Policy
    </Link>
  </div>
);

// Component
// ---------------
export const Footer = () => (
  <footer className="mx-auto w-content pt-36 pb-8 text-mist-400">
    <Divider />
    <div className="grid grid-cols-[1fr_max-content] gap-y-12 pt-10 text-sm md:grid-cols-[max-content_1fr_max-content] md:gap-x-24">
      <Links />
      <Legal />
      <Social />
    </div>
    <div className="flex items-center justify-center gap-1 pt-4 text-sm md:justify-start md:pt-8">
      <CopyrightIcon size={14} aria-hidden />
      {new Date().getFullYear()} Sebastian Sebald
    </div>
  </footer>
);
