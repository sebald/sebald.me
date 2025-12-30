import type { CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import {
  CodeBlock as FumaCodeBlock,
  Pre,
} from 'fumadocs-ui/components/codeblock';

import { cva } from '@/lib/styles.utils';

const style = {
  codeblock: cva({
    base: [
      'bg-oatmeal-100/50 border-oatmeal-300 rounded-xl border',
      'shadow-none',
    ],
  }),
};

export const CodeBlock = ({ children, ...props }: CodeBlockProps) => (
  <FumaCodeBlock {...props} className={style.codeblock()}>
    <Pre>{children}</Pre>
  </FumaCodeBlock>
);
