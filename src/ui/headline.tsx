import { cva, type VariantProps } from 'cva';

// Styles
// ---------------
export const style = cva({
  base: [
    'flex items-center',
    '[&_svg]:mr-2 [&_svg]:size-[1em]',
    'in-[a:hover]:text-link',
  ],
  variants: {
    level: {
      display:
        'text-4xl md:text-6xl leading-tight -tracking-[0.04em] font-bold',
      '1': 'text-scale-5 leading-tight -tracking-wide font-semibold',
      '2': 'text-scale-4 leading-tight -tracking-wide font-semibold',
      '3': 'text-scale-3 leading-tight -tracking-wide font-semibold',
      '4': 'text-scale-2 leading-snug -tracking-wide font-semibold',
      '5': 'text-scale-1 leading-snug -tracking-wide font-semibold',
      '6': 'text-scale-0 leading-relaxed -tracking-wide font-semibold',
      overline: 'uppercase text-text text-scale--2 tracking-wide font-semibold',
    },
    variant: {
      default: 'text-(--color-headline,var(--color-oatmeal-900))',
      accent:
        'text-transparent bg-clip-text bg-linear-to-br from-blueberry-700 to-blueberry-500',
      muted: 'text-(--color-muted,var(--color-oatmeal-700))',
    },
  },
  compoundVariants: [
    {
      level: 'display',
      className: 'font-sans',
    },
    {
      level: ['1', '2', '3', '4', '5', '6', 'overline'],
      className: 'font-sans',
    },
  ],
  defaultVariants: {
    level: '2',
    variant: 'default',
  },
});

// Props
// ---------------
export interface HeadlineProps extends VariantProps<typeof style> {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  id?: string;
}

// Component
// ---------------
export const Headline = ({
  level = '2',
  variant = 'default',
  children,
  className,
  as,
  id,
}: HeadlineProps) => {
  const Component =
    as ||
    (level === 'display'
      ? 'h1'
      : level === 'overline'
        ? 'h6'
        : (`h${level}` as const));

  return (
    <Component id={id} className={style({ level, variant, className })}>
      {children}
    </Component>
  );
};
