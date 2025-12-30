import type { CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import {
  CodeBlock as FumaCodeBlock,
  Pre,
} from 'fumadocs-ui/components/codeblock';

import { cva } from '@/lib/styles.utils';

const style = {
  codeblock: cva({
    base: [
      'bg-oatmeal-100/50 border-oatmeal-200/50 rounded-xl border',
      'shadow-none', // override fumadocs-ui default
      '[&>div:has(figcaption)]:border-oatmeal-200/50',
    ],
  }),
};

export const CodeBlock = ({ children, ...props }: CodeBlockProps) => (
  <FumaCodeBlock {...props} className={style.codeblock()}>
    <Pre>{children}</Pre>
  </FumaCodeBlock>
);
