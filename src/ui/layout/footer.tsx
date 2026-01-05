import { CopyrightIcon } from '@phosphor-icons/react/dist/ssr';

import { ConsentUpdate } from '@/ui/analytics/consent-update';
import { Divider } from '@/ui/divider';
import { Link } from '@/ui/link';

export const Footer = () => (
  <div className="fit-prose pb-12 pt-28">
    <Divider variant="light" />
    <div className="pt-8 text-sm">
      <div className="flex items-center gap-1">
        <CopyrightIcon size={14} /> {new Date().getFullYear()} Sebastian Sebald.
      </div>
      <Link variant="inherit" noUnderline href="/imprint">
        Imprint
      </Link>
      <Link variant="inherit" noUnderline href="/privacy">
        Privacy Policy
      </Link>
      <ConsentUpdate />
    </div>
  </div>
);
