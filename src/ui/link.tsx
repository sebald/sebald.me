import { cva, type VariantProps } from 'cva';
import type { Route } from 'next';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';

// Styles
// ---------------
export const styles = cva({
  base: [
    'group/link ensure-hitbox',
    'inline-flex items-center gap-1.5',
    'transition-colors focus-visible:focus-ring focus-visible:outline-none',
  ],
  variants: {
    variant: {
      default: [
        'text-link decoration-link/40',
        'hover:text-link-hover hover:decoration-link-hover',
      ],
      muted: [
        'text-muted decoration-muted/40',
        'hover:text-oatmeal-900 hover:decoration-oatmeal-900',
      ],
      inherit: [
        'text-inherit decoration-inherit',
        'hover:text-link-hover hover:decoration-link-hover',
      ],
      ghost: [
        'text-current text-sm',
        'h-11 px-8 rounded-full',
        'bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.15)]',
        'hover:bg-[oklch(from_var(--color-text,var(--color-oatmeal-500))_l_c_h/0.1)]',
        'active:scale-[0.97] transition-all duration-200',
      ],
    },
    noUnderline: {
      false: ['underline underline-offset-4 decoration-1'],
      true: ['no-underline'],
    },
  },
  defaultVariants: {
    variant: 'default',
    noUnderline: false,
  },
});

// Props
// ---------------
export interface LinkProps
  extends VariantProps<typeof styles>,
    Omit<NextLinkProps<'a'>, 'style' | 'href'> {
  href: NextLinkProps<'a'>['href'] | string;
}

// Component
// ---------------
export const Link = ({
  variant,
  noUnderline,
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
      className={styles({ variant, noUnderline })}
      {...props}
      {...externalProps}
    >
      {children}
    </Component>
  );
};
