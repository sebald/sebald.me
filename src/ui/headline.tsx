import { cva, type VariantProps } from 'cva';

// Styles
// ---------------
export const style = cva({
  base: [
    'flex items-center',
    'text-accent-foreground tracking-wide',
    '[&_svg]:mr-[1ch] [&_svg]:size-[1.25em]',
  ],
  variants: {
    level: {
      '1': 'text-2xl font-semibold',
      '2': 'text-lg font-semibold',
      '3': 'text-base font-semibold',
      '4': 'text-base font-medium',
      '5': 'text-base font-medium',
      '6': 'text-sm font-semibold',
    },
  },
  defaultVariants: {
    level: '2',
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
  children,
  className,
  as,
  id,
}: HeadlineProps) => {
  const Component = as ?? `h${level}`;

  return (
    <Component id={id} className={style({ level, className })}>
      {children}
    </Component>
  );
};
