import type { CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import {
  CodeBlock as FumaCodeBlock,
  CodeBlockTabs as FumaCodeBlockTabs,
  CodeBlockTabsList as FumaCodeBlockTabsList,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import type { PropsWithChildren } from 'react';

import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
const style = {
  codeblock: cva({
    base: [
      'bg-oatmeal-100/50 border-oatmeal-200/50 rounded-xl border',
      'shadow-none', // override fumadocs-ui default
      '[&>div:has(figcaption)]:border-oatmeal-200/50',
    ],
  }),
  codeblockTabs: cva({
    base: ['border-none'],
  }),
  codeblockTabsList: cva({
    base: [
      'px-0 pb-1 space-x-1',
      // Add style to fumadocs tab buttons
      '[&_button]:text-oatmeal-900/50 [&_button]:text-sm',
      '[&_button]:px-4 [&_button]:py-1.5 [&_button]:rounded-lg',
      '[&_button]:cursor-pointer',
      '[&_button]:aria-selected:text-oatmeal-900 [&_button]:aria-selected:bg-oatmeal-800/10',
      '[&_button]:hover:text-oatmeal-900',
    ],
  }),
};

// Component
// ---------------
export const CodeBlock = ({ children, ...props }: CodeBlockProps) => (
  <FumaCodeBlock {...props} className={style.codeblock()}>
    <Pre>{children}</Pre>
  </FumaCodeBlock>
);

/**
 * Override fumadocs-ui default components for code blocks to adjust styles
 */
export const CodeBlockTabs = ({ children, ...props }: PropsWithChildren) => (
  <FumaCodeBlockTabs {...props} className={style.codeblockTabs()}>
    {children}
  </FumaCodeBlockTabs>
);

export const CodeBlockTabsList = ({
  children,
  ...props
}: PropsWithChildren) => (
  <FumaCodeBlockTabsList {...props} className={style.codeblockTabsList()}>
    {children}
  </FumaCodeBlockTabsList>
);
