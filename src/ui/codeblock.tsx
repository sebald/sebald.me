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
      'bg-(--shiki-dark-bg) border-[oklch(from_var(--shiki-dark-bg)_calc(l+0.05)_c_h)] rounded-xl border',
      'shadow-none mt-8 mb-0 mx-0', // override fumadocs-ui default
      'px-4 py-6',
      '[&>div:has(figcaption)]:border-mist-800/50',
    ],
  }),
  codeblockTabs: cva({
    base: ['border-none'],
  }),
  codeblockTabsList: cva({
    base: [
      'px-0 pb-1 space-x-1',
      // Add style to fumadocs tab buttons
      '[&_button]:text-mist-400 [&_button]:text-sm',
      '[&_button]:px-4 [&_button]:py-1.5 [&_button]:rounded-lg',
      '[&_button]:cursor-pointer',
      '[&_button]:aria-selected:text-mist-100 [&_button]:aria-selected:bg-mist-800/30',
      '[&_button]:hover:text-mist-200',
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
