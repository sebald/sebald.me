import { cva, type VariantProps } from 'cva';

const style = cva({
  base: 'leading-relaxed',
  variants: {
    variant: {
      default: 'text-oatmeal-800',
      muted: 'opacity-60',
    },
    size: {
      caption: 'text-sm',
      body: 'text-base',
      emphasis: 'text-lg',
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
