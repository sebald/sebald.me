import type { VariantProps } from '@/lib/styles.utils';
import { cva } from '@/lib/styles.utils';

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
      // Repeat `leading-*`: tailwind-merge drops it when `text-xs` follows
      caption: 'text-xs leading-relaxed -tracking-wide',
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
  className?: string;
}

// Component
// ---------------
export const Text = ({
  variant,
  size,
  wrap,
  children,
  as = 'p',
  className,
}: TextProps) => {
  const Component = as;
  return (
    <Component className={style({ variant, size, wrap, className })}>
      {children}
    </Component>
  );
};
