import { cva, type VariantProps } from 'cva';

// Styles
// ---------------
export const style = cva({
  base: 'leading-relaxed',
  variants: {
    variant: {
      default: 'text-foreground',
      accent: 'text-mist-100',
      muted: 'text-muted-foreground',
    },
    size: {
      default: '',
      caption: 'text-xs -tracking-wide',
    },
    wrap: {
      default: '',
      balance: 'text-balance',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    wrap: 'default',
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
export const Text = ({
  variant,
  size,
  wrap,
  children,
  as = 'p',
}: TextProps) => {
  const Component = as;
  return (
    <Component className={style({ variant, size, wrap })}>{children}</Component>
  );
};
