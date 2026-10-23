import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
export const style = cva({
  base: [
    'flex items-center',
    'text-accent-foreground',
    '[&_svg]:mr-[1ch] [&_svg]:size-[1.25em]',
  ],
  // Fira Code is wide, so no positive tracking. Three steps above the 16px
  // body (20, 24 and 28/32px), one size smaller on phones for the top two.
  variants: {
    level: {
      '1': 'text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.01em] md:text-[2rem]',
      '2': 'text-xl leading-[1.3] font-semibold md:text-2xl',
      '3': 'text-lg leading-[1.35] font-semibold md:text-xl',
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
