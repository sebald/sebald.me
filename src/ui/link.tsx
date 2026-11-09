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
    'outline-none focus-visible:ui-focus',
  ],
  variants: {
    variant: {
      // Text links hang into the margin, so the text lines up, not the padding
      default: [
        'px-1 -mx-1 rounded-lg',
        'text-link font-medium',
        'underline decoration-link/15 underline-offset-3',
        'hover:decoration-link/75',
      ],
      inherit: [
        'px-1 -mx-1 rounded-lg',
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
      // Only focus and transition, for links styled by what they wrap (cards)
      plain: '',
    },
    size: {
      // The size of the text around it
      default: '',
      // The caption size (`Text size="caption"`), for a link set apart
      // from running text, like the one below an entry on the home page.
      // Its hit area reaches past the text (an invisible layer, so the
      // layout and the spacing around it stay as they are)
      small: [
        'relative text-[0.8125rem] md:text-xs [&_svg]:size-3',
        "after:absolute after:-inset-x-2 after:-inset-y-2.5 after:content-['']",
      ],
    },
  },
  defaultVariants: { variant: 'default', size: 'default' },
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
  size,
  children,
  href,
  target,
  rel,
  className,
  ...props
}: LinkProps) => {
  const Component =
    typeof href === 'string' && /^(https?:|\/\/|mailto:)/.test(href)
      ? 'a'
      : NextLink;

  const externalProps =
    target === '_blank'
      ? { target: '_blank', rel: rel || 'noopener noreferrer' }
      : { target, rel };

  return (
    <Component
      {...props}
      {...externalProps}
      href={href as Route}
      className={styles({ variant, size, className })}
    >
      {children}
    </Component>
  );
};
