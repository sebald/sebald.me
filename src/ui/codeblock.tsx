'use client';

import { CheckIcon, CopyIcon } from '@phosphor-icons/react/ssr';
import type { CodeBlockProps } from 'fumadocs-ui/components/codeblock';
import {
  CodeBlock as FumaCodeBlock,
  CodeBlockTabs as FumaCodeBlockTabs,
  CodeBlockTabsList as FumaCodeBlockTabsList,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { type PropsWithChildren, type RefObject, useRef } from 'react';

import { cn, cva } from '@/lib/styles.utils';

import { Button } from './button';

// Styles
// ---------------
const style = {
  codeblock: cva({
    base: [
      'bg-(--shiki-dark-bg) border-[oklch(from_var(--shiki-dark-bg)_calc(l+0.1)_c_h)] rounded-xl border',
      'shadow-none mt-8 mb-0 mx-0', // override fumadocs-ui default
      '*:px-4 pb-6',

      // Title styles
      '[&>div:has(figcaption)]:border-b [&>div:has(figcaption)]:border-[oklch(from_var(--shiki-dark-bg)_calc(l+0.1)_c_h)]',
      '[&>div:has(figcaption)]:py-4',
      '[&_svg]:size-4 [&_figcaption]:text-xs',

      // Code container
      '**:[[role=region]]:pt-6',
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

// Copy Button
// ---------------
interface CopyButtonProps {
  containerRef: RefObject<HTMLElement | null>;
}

const CopyButton = ({ containerRef }: CopyButtonProps) => {
  const [checked, onClick] = useCopyButton(() => {
    const pre = containerRef.current?.getElementsByTagName('pre').item(0);
    if (!pre) return;

    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.nd-copy-ignore').forEach(node => {
      node.replaceWith('\n');
    });

    navigator.clipboard.writeText(clone.textContent ?? '');
  });

  return (
    <Button
      variant="link"
      aria-label={checked ? 'Copied Text' : 'Copy Text'}
      onClick={onClick}
    >
      {checked ? (
        <CheckIcon size={20} weight="bold" />
      ) : (
        <CopyIcon size={20} weight="bold" />
      )}
    </Button>
  );
};

// Component
// ---------------
export const CodeBlock = ({ children, ...props }: CodeBlockProps) => {
  const areaRef = useRef<HTMLElement>(null);

  return (
    <FumaCodeBlock
      {...props}
      ref={areaRef}
      className={style.codeblock()}
      allowCopy={false}
      Actions={() => (
        <div
          className={cn(
            'absolute right-4 z-2',
            !!props.title ? 'top-18' : 'top-6',
          )}
        >
          <CopyButton containerRef={areaRef} />
        </div>
      )}
    >
      <Pre>{children}</Pre>
    </FumaCodeBlock>
  );
};

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
