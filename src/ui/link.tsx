import { cva, type VariantProps } from 'cva';
import type { Route } from 'next';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';

// Styles
// ---------------
export const styles = cva({
  base: [
    'inline-flex items-center gap-1.5',
    'transition-all duration-150',
    'focus-visible:focus-ring focus-visible:outline-none',
  ],
  variants: {
    variant: {
      default: [
        'text-link font-medium',
        'underline decoration-link/15 underline-offset-3',
        'hover:decoration-link/75',
      ],
      inherit: [
        'text-inherit decoration-inherit',
        'hover:text-link hover:decoration-link',
      ],
      icon: [
        'justify-center no-underline',
        'size-12 rounded-full',
        'bg-mist-800 text-mist-500',
        'hover:bg-mist-500/50 hover:text-mist-50',
        '[&_svg]:size-5',
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
