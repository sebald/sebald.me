import { cva, type VariantProps } from 'cva';

export const style = cva({
  base: [
    'flex items-center',
    'font-sans font-bold -tracking-wide leading-tight text-(--color-headline,var(--color-oatmeal-900))',
    '[&_svg]:mr-2 [&_svg]:size-[1em]',
  ],
  variants: {
    level: {
      '1': 'typescale-5',
      '2': 'typescale-4',
      '3': 'typescale-3',
      '4': 'typescale-2',
      '5': 'typescale-1',
      '6': 'typescale-0',
    },
  },
  defaultVariants: {
    level: '1',
  },
});

export interface HeadlineProps extends VariantProps<typeof style> {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Headline = ({ level = '1', children, as }: HeadlineProps) => {
  const Component = as || (`h${level}` as const);
  return <Component className={style({ level })}>{children}</Component>;
};
