import { cva, type VariantProps } from 'cva';

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

type TextVariants = VariantProps<typeof style>;

interface TextProps extends TextVariants {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

export const Text = ({ variant, size, children, as = 'p' }: TextProps) => {
  const Component = as;
  return <Component className={style({ variant, size })}>{children}</Component>;
};
