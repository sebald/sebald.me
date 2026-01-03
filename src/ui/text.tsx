import { cva, type VariantProps } from 'cva';

// Styles
// ---------------
export const style = cva({
  base: 'leading-relaxed text-(--color-text,var(--color-oatmeal-800))',
  variants: {
    variant: {
      default: '',
      muted: 'text-muted',
    },
    size: {
      caption: 'text-sm',
      body: 'text-base',
      lead: 'text-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'body',
  },
});

// Props
// ---------------
interface TextProps extends VariantProps<typeof style> {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

// Component
// ---------------
export const Text = ({ variant, size, children, as = 'p' }: TextProps) => {
  const Component = as;
  return <Component className={style({ variant, size })}>{children}</Component>;
};
