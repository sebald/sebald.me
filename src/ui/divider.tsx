import { cva, type VariantProps } from 'cva';

const style = cva({
  base: 'border-0 border-t my-8',
  variants: {
    variant: {
      default: 'border-oatmeal-200',
      bold: 'border-oatmeal-300 border-t-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type DividerVariants = VariantProps<typeof style>;

interface DividerProps extends DividerVariants {}

export const Divider = ({ variant }: DividerProps) => {
  return <hr className={style({ variant })} />;
};
