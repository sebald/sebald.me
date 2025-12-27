import { cva, type VariantProps } from 'cva';

const style = cva({
  base: 'text-oatmeal-900',
  variants: {
    size: {
      sm: 'text-sm leading-relaxed',
      base: 'text-base leading-relaxed',
      lg: 'text-lg leading-relaxed',
      xl: 'text-xl leading-relaxed',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    variant: {
      default: '',
      muted: 'text-oatmeal-600',
      lead: 'text-xl leading-relaxed font-normal',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    variant: 'default',
  },
});

type TextVariants = VariantProps<typeof style>;

interface TextProps extends TextVariants {
  children: React.ReactNode;
  as?: 'p' | 'span' | 'div';
}

export const Text = ({
  size,
  weight,
  variant,
  children,
  as = 'p',
}: TextProps) => {
  const Component = as;
  return (
    <Component className={style({ size, weight, variant })}>
      {children}
    </Component>
  );
};
