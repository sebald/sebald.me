import { cva, type VariantProps } from 'cva';
import type { Route } from 'next';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';

// Styles
// ---------------
export const styles = cva({
  base: [
    'inline-flex items-center gap-1.5',
    'text-mist-50 font-medium whitespace-nowrap',
    'focus-visible:focus-ring outline-none',
  ],
  variants: {
    variant: {
      default: [
        'text-link decoration-link/40',
        'hover:text-link-hover hover:decoration-link-hover',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
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
      href={href as Route}
      className={styles({ variant })}
      {...props}
      {...externalProps}
    >
      {children}
    </Component>
  );
};
