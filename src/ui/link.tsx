import type { Route } from 'next';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';

import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
export const styles = cva({
  base: [
    'inline-flex items-center gap-1.5',
    'transition-all duration-150',
    'px-1 -mx-1 outline-none focus-visible:ui-focus',
  ],
  variants: {
    variant: {
      default: [
        'rounded-lg',
        'text-link font-medium',
        'underline decoration-link/15 underline-offset-3',
        'hover:decoration-link/75',
      ],
      inherit: [
        'rounded-lg',
        'text-inherit decoration-inherit',
        'hover:text-link hover:decoration-link',
      ],
      icon: [
        'justify-center no-underline',
        'size-11 rounded-full',
        'bg-mist-800 text-mist-400',
        'hover:bg-mist-500/50 hover:text-mist-50',
        '[&_svg]:size-4.5',
      ],
    },
  },
  defaultVariants: { variant: 'default' },
});

// Props
// ---------------
export interface LinkProps
  extends
    VariantProps<typeof styles>,
    Omit<NextLinkProps<'a'>, 'style' | 'href'> {
  href: NextLinkProps<'a'>['href'] | string;
}

// Component
// ---------------
export const Link = ({
  variant,
  children,
  href,
  target,
  rel,
  className,
  ...props
}: LinkProps) => {
  const Component =
    typeof href === 'string' && /^(https?:|\/\/)/.test(href) ? 'a' : NextLink;

  const externalProps =
    target === '_blank'
      ? { target: '_blank', rel: rel || 'noopener noreferrer' }
      : { target, rel };

  return (
    <Component
      {...props}
      {...externalProps}
      href={href as Route}
      className={styles({ variant, className })}
    >
      {children}
    </Component>
  );
};
