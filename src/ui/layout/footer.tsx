import {
  CopyrightIcon,
  CubeIcon,
  MarkdownLogoIcon,
  RssIcon,
} from '@phosphor-icons/react/dist/ssr';
import type { PropsWithChildren } from 'react';

import { socialLinks } from '@/app.config';
import { ConsentUpdate } from '@/ui/analytics/consent-update';
import { Divider } from '@/ui/divider';
import { GithubIcon } from '@/ui/icon/github-icon';
import { LinkedInIcon } from '@/ui/icon/linkedin-icon';
import { XComIcon } from '@/ui/icon/x-com-icon';
import { Link } from '@/ui/link';

const Legal = () => (
  <div className="flex items-center gap-2">
    <Link variant="inherit" noUnderline href="/imprint">
      Imprint
    </Link>
    <span className="text-muted text-sm">·</span>
    <Link variant="inherit" noUnderline href="/privacy">
      Privacy Policy
    </Link>
    <span className="text-muted text-sm">·</span>
    <ConsentUpdate />
  </div>
);

const Social = () => (
  <div className="flex items-center gap-8">
    <Link
      aria-label="Me on X GitHub"
      variant="inherit"
      noUnderline
      href={socialLinks.github}
      target="_blank"
    >
      <GithubIcon size={20} />
    </Link>
    <Link
      aria-label="Me on LinkedIn"
      variant="inherit"
      noUnderline
      href={socialLinks.linkedin}
      target="_blank"
    >
      <LinkedInIcon size={20} />
    </Link>
    <Link
      aria-label="Me on X (formerly Twitter)"
      variant="inherit"
      noUnderline
      href={socialLinks.x}
      target="_blank"
    >
      <XComIcon size={20} />
    </Link>
  </div>
);

const Links = () => (
  <div className="flex items-center gap-6">
    <Link
      aria-label="View all content formatted for LLMs"
      variant="inherit"
      noUnderline
      href="/llms.txt"
    >
      <MarkdownLogoIcon size={16} />
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

const Copyright = () => (
  <div className="flex items-center justify-center gap-1 md:justify-start">
    <CopyrightIcon size={14} />
    {new Date().getFullYear()} Sebastian Sebald
  </div>
);

// Component
// ---------------
export const Footer = () => (
  <div className="fit-prose pb-4 pt-28 md:pb-6">
    <Divider variant="light" />
    <div className="text-muted grid gap-10 pt-6 text-sm">
      <div className="flex justify-between">
        <Links />
        <Social />
      </div>
      <div className="flex justify-between">
        <Legal />
        <Copyright />
      </div>
    </div>
  </div>
);
