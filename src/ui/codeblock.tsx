import type { CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import {
  CodeBlock as FumaCodeBlock,
  CodeBlockTabs as FumaCodeBlockTabs,
  CodeBlockTabsList as FumaCodeBlockTabsList,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import type { PropsWithChildren } from 'react';

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

/**
 * Override fumadocs-ui default components for code blocks to adjust styles
 */

export const CodeBlockTabs = ({ children, ...props }: PropsWithChildren) => (
  <FumaCodeBlockTabs {...props} className="border-none">
    {children}
  </FumaCodeBlockTabs>
);

export const CodeBlockTabsList = ({
  children,
  ...props
}: PropsWithChildren) => (
  <FumaCodeBlockTabsList {...props} className="px-0">
    {children}
  </FumaCodeBlockTabsList>
);
