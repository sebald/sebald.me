import { cva, type VariantProps } from 'cva';

const style = cva({
  base: 'font-sans font-bold leading-tight -tracking-wide text-oatmeal-900',
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

type HeadlineVariants = VariantProps<typeof style>;

interface HeadlineProps extends HeadlineVariants {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Headline = ({ level = '1', children, as }: HeadlineProps) => {
  const Component = as || (`h${level}` as const);
  return <Component className={style({ level })}>{children}</Component>;
};
