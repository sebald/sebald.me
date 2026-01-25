import { cva, type VariantProps } from 'cva';

// Styles
// ---------------
export const style = cva({
  base: 'leading-relaxed text-foreground',
  variants: {
    variant: {
      default: '',
      muted: 'text-muted-foreground',
    },
    size: {
      default: '',
      caption: 'text-xs -tracking-wide',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
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
