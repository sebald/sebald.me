import { cva, type VariantProps } from 'cva';

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
      false: ['underline underline-offset-2 decoration-1'],
      true: ['no-underline'],
    },
  },
  defaultVariants: {
    variant: 'default',
    noUnderline: false,
  },
});

type LinkVariants = VariantProps<typeof style>;

interface LinkProps extends LinkVariants {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
}

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
    <a
      href={href}
      className={style({ variant, noUnderline })}
      {...externalProps}
    >
      {children}
    </a>
  );
};
