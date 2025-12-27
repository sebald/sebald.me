import type { ClassValue, CVA } from 'cva';
import { cva as _cva, cx } from 'cva';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));

export type { VariantProps } from 'cva';

export const cva: CVA = (options) => {
  const cvaClassName = _cva(options);
  return (props) => twMerge(cvaClassName(props));
};
