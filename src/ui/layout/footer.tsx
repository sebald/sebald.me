import { CopyrightIcon } from '@phosphor-icons/react/dist/ssr';

import { socialLinks } from '@/app.config';
import { ConsentUpdate } from '@/ui/analytics/consent-update';
import { Divider } from '@/ui/divider';
import { GithubIcon } from '@/ui/icon/github-icon';
import { LinkedInIcon } from '@/ui/icon/linkedin-icon';
import { XComIcon } from '@/ui/icon/x-com-icon';
import { Link } from '@/ui/link';

export const Footer = () => (
  <div className="fit-prose pb-4 pt-28 md:pb-6">
    <Divider variant="light" />
    <div className="text-muted grid gap-10 pt-6 text-sm md:gap-2">
      {/* Line 1 */}
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
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

        <div className="flex items-center gap-8">
          <Link
            variant="inherit"
            noUnderline
            href={socialLinks.github}
            target="_blank"
          >
            <GithubIcon size={16} />
          </Link>
          <Link
            variant="inherit"
            noUnderline
            href={socialLinks.linkedin}
            target="_blank"
          >
            <LinkedInIcon size={16} />
          </Link>
          <Link
            variant="inherit"
            noUnderline
            href={socialLinks.x}
            target="_blank"
          >
            <XComIcon size={16} />
          </Link>
        </div>
      </div>

      {/* Line 2 */}
      <div className="flex flex-1 items-center justify-center gap-1 md:justify-start">
        <CopyrightIcon size={14} />
        {new Date().getFullYear()} Sebastian Sebald
      </div>
    </div>
  </div>
);
