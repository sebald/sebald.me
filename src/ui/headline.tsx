import { cva, type VariantProps } from 'cva';

const style = cva({
  base: 'font-sans font-bold leading-tight -tracking-wide',
  variants: {
    level: {
      h1: 'text-[calc(var(--headline-base-size)*pow(1.25,5))]',
      h2: 'text-[calc(var(--headline-base-size)*pow(1.25,4))]',
      h3: 'text-[calc(var(--headline-base-size)*pow(1.25,3))]',
      h4: 'text-[calc(var(--headline-base-size)*pow(1.25,2))]',
      h5: 'text-[calc(var(--headline-base-size)*1.25)]',
      h6: 'text-[var(--headline-base-size)]',
    },
  },
  defaultVariants: {
    level: 'h1',
  },
});

type HeadlineVariants = VariantProps<typeof style>;

interface HeadlineProps extends HeadlineVariants {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Headline = ({
  level = 'h1',
  children,
  className,
  style: inlineStyle,
}: HeadlineProps) => {
  const Component = level || 'h1';
  return (
    <Component
      className={style({ level, className })}
      style={
        {
          '--headline-base-size': '20px',
          ...inlineStyle,
        } as React.CSSProperties
      }
    >
      {children}
    </Component>
  );
};
