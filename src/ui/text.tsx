import { cva, type VariantProps } from 'cva';

export const style = cva({
  base: 'text-(--color-text,var(--color-oatmeal-800))',
  variants: {
    variant: {
      default: '',
      muted: 'opacity-75',
      faded: 'opacity-60',
    },
    size: {
      caption: 'text-sm',
      body: 'text-base',
      lead: 'text-lg',
    },
    leading: {
      inherit: '',
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'body',
    leading: 'relaxed',
  },
});

type TextVariants = VariantProps<typeof style>;

interface TextProps extends TextVariants {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

export const Text = ({
  variant,
  size,
  leading,
  children,
  as = 'p',
}: TextProps) => {
  const Component = as;
  return (
    <Component className={style({ variant, size, leading })}>
      {children}
    </Component>
  );
};
