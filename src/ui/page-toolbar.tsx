import { HouseSimpleIcon } from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';
import { Link } from '@/ui/link';

// Styles
// ---------------
const styles = {
  root: cva({
    base: [
      'grid items-center pt-10 pb-10 w-full md:pt-32 md:pb-20',
      'grid-cols-[auto_1fr]',
      '[grid-template-areas:"back_actions"]',
    ],
  }),
  back: cva({
    base: ['[grid-area:back]', 'flex'],
  }),
  actions: cva({
    base: ['[grid-area:actions]', 'justify-self-end', 'flex gap-4'],
  }),
};

// PageToolbar
// ---------------
export const PageToolbar = ({ children }: PropsWithChildren) => (
  <nav aria-label="Article navigation" className={styles.root()}>
    <div className={styles.back()}>
      <Link href="/" variant="icon" aria-label="Back to home">
        <HouseSimpleIcon weight="bold" aria-hidden />
      </Link>
    </div>
    {children && <div className={styles.actions()}>{children}</div>}
  </nav>
);
