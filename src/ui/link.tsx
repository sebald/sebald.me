import { cva, type VariantProps } from 'cva';
import FumaLink from 'fumadocs-core/link';
import type { LinkProps as FumaLinkProps } from 'fumadocs-core/link';

const style = cva({
  base: [
    'group/link',
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
    },
    noUnderline: {
      false: ['underline underline-offset-4 decoration-1'],
      true: ['no-underline underline-offset-4 decoration-1', 'hover:underline'],
    },
  },
  defaultVariants: {
    variant: 'default',
    noUnderline: false,
  },
});

export interface LinkProps
  extends VariantProps<typeof style>,
    Omit<FumaLinkProps, 'className' | 'style'> {}

export const Link = ({
  variant,
  noUnderline,
  children,
  href,
  target,
  rel,
}: LinkProps) => {
  const externalProps =
    target === '_blank'
      ? { target: '_blank', rel: rel || 'noopener noreferrer' }
      : { target, rel };

  return (
    <FumaLink
      href={href}
      className={style({ variant, noUnderline })}
      {...externalProps}
    >
      {children}
    </FumaLink>
  );
};
