import { cva, type VariantProps } from 'cva';

// Styles
// ---------------
export const style = cva({
  base: [
    'flex items-center',
    'font-sans font-bold',
    '[&_svg]:mr-2 [&_svg]:size-[1em]',
    'in-[a:hover]:text-link',
  ],
  variants: {
    level: {
      display: 'text-4xl md:text-6xl leading-tight -tracking-[0.04em]',
      '1': 'typescale-5 leading-tight -tracking-wide',
      '2': 'typescale-4 leading-tight -tracking-wide',
      '3': 'typescale-3 leading-tight -tracking-wide',
      '4': 'typescale-2 leading-snug -tracking-wide',
      '5': 'typescale-1 leading-snug -tracking-wide',
      '6': 'typescale-0 leading-relaxed -tracking-wide',
      overline: 'uppercase text-text text-xs tracking-wider',
    },
    variant: {
      default: 'text-(--color-headline,var(--color-oatmeal-900))',
      accent:
        'text-transparent bg-clip-text bg-linear-to-br from-blueberry-700 to-blueberry-500',
      muted: 'text-(--color-muted,var(--color-oatmeal-700))',
    },
  },
  defaultVariants: {
    level: '2',
    variant: 'default',
  },
});

// Props
// ---------------
export interface HeadlineProps extends VariantProps<typeof style> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  id?: string;
}

// Component
// ---------------
export const Headline = ({
  level = '2',
  variant = 'default',
  children,
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
    <Component id={id} className={style({ level, variant })}>
      {children}
    </Component>
  );
};
