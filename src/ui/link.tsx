import { cva, type VariantProps } from 'cva';

const style = cva({
  base: [
    'underline',
    'underline-offset-2',
    'decoration-1',
    'transition-colors',
    'focus-visible:focus-ring',
    'focus-visible:outline-none',
  ],
  variants: {
    variant: {
      default: [
        'text-blueberry-600',
        'decoration-blueberry-600/40',
        'hover:text-blueberry-700',
        'hover:decoration-blueberry-700',
      ],
      muted: [
        'text-oatmeal-700',
        'decoration-oatmeal-700/40',
        'hover:text-oatmeal-900',
        'hover:decoration-oatmeal-900',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type LinkVariants = VariantProps<typeof style>;

interface LinkProps extends LinkVariants {
  children: React.ReactNode;
  href: string;
  target?: string;
  rel?: string;
}

export const Link = ({ variant, children, href, target, rel }: LinkProps) => {
  const externalProps =
    target === '_blank'
      ? { target: '_blank', rel: rel || 'noopener noreferrer' }
      : { target, rel };

  return (
    <a href={href} className={style({ variant })} {...externalProps}>
      {children}
    </a>
  );
};
