import type { PropsWithChildren } from 'react';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';
import { Link } from '@/ui/link';

// Styles
// ---------------
export const styles = cva({
  base: [],
  variants: {
    variant: {
      panel: 'ui-panel',
      // No glass, a plain fill like the secondary button
      flat: 'rounded-2xl bg-mist-500/15',
    },
    inset: {
      none: '',
      tight: 'p-2',
      snug: 'p-4',
      normal: 'p-6',
      relaxed: 'p-8',
    },
    // Set by `href`, the whole card is the link
    interactive: {
      true: ['group block', 'transition-colors duration-150'],
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'panel', interactive: true, className: 'hover:bg-mist-500/10' },
    { variant: 'flat', interactive: true, className: 'hover:bg-mist-500/25' },
  ],
  defaultVariants: {
    variant: 'panel',
    inset: 'normal',
    interactive: false,
  },
});

// Props
// ---------------
export interface CardProps
  extends PropsWithChildren, Omit<VariantProps<typeof styles>, 'interactive'> {
  /** Turns the whole card into a link */
  href?: string;
  target?: string;
  className?: string;
}

// Component
// ---------------
export const Card = ({
  children,
  variant,
  inset,
  href,
  target,
  className,
}: CardProps) => {
  if (!href) {
    return (
      <div className={styles({ variant, inset, className })}>{children}</div>
    );
  }

  return (
    <Link
      href={href}
      target={target}
      variant="plain"
      className={styles({ variant, inset, interactive: true, className })}
    >
      {children}
    </Link>
  );
};
