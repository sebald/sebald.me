import { HouseSimpleIcon } from '@phosphor-icons/react/ssr';
import type { PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';
import { Link } from '@/ui/link';

// Styles
// ---------------
const styles = {
  root: cva({
    base: [
      'grid items-center pt-32 pb-20 w-full',
      'grid-cols-[auto_1fr]',
      '[grid-template-areas:"back_actions"]',
    ],
  }),
  back: cva({
    base: ['[grid-area:back]'],
  }),
  actions: cva({
    base: ['[grid-area:actions]', 'justify-self-end'],
  }),
};

// PageToolbar
// ---------------
export const PageToolbar = ({ children }: PropsWithChildren) => (
  <nav aria-label="Article navigation" className={styles.root()}>
    <div className={styles.back()}>
      <Link href="/" variant="icon" aria-label="Back to home">
        <HouseSimpleIcon weight="bold" />
      </Link>
    </div>
    {children && <div className={styles.actions()}>{children}</div>}
  </nav>
);
