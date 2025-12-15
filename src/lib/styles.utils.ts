import { ClassValue, cx } from 'cva';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(cx(inputs));
