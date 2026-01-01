import { cva, type VariantProps } from 'cva';

export const style = cva({
  base: [
    'flex items-center',
    'font-sans font-bold text-(--color-headline,var(--color-oatmeal-900))',
    '[&_svg]:mr-2 [&_svg]:size-[1em]',
  ],
  variants: {
    level: {
      display: [
        'typescale-6 leading-tight -tracking-[0.04em]',
        'text-transparent bg-clip-text bg-linear-to-br from-blueberry-700 to-blueberry-500',
      ],
      '1': 'typescale-5 leading-tight -tracking-wide',
      '2': 'typescale-4 leading-snug -tracking-wide',
      '3': 'typescale-3 leading-snug -tracking-wide',
      '4': 'typescale-2 leading-relaxed -tracking-wide',
      '5': 'typescale-1 leading-relaxed -tracking-wide',
      '6': 'typescale-0 leading-relaxed -tracking-wide',
    },
  },
  defaultVariants: {
    level: '2',
  },
});

export interface HeadlineProps extends VariantProps<typeof style> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  id?: string;
}

export const Headline = ({ level = '2', children, as, id }: HeadlineProps) => {
  const Component = as || level === 'display' ? 'h1' : (`h${level}` as const);
  return (
    <Component id={id} className={style({ level })}>
      {children}
    </Component>
  );
};
