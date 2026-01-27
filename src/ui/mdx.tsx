import defaultComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { ConsentUpdate } from '@/ui/analytics/consent-update';
import { Blockquote } from '@/ui/blockquote';
import { CodeBlock, CodeBlockTabs, CodeBlockTabsList } from '@/ui/codeblock';
import { Headline } from '@/ui/headline';
import { Image } from '@/ui/image';
import { Link } from '@/ui/link';

export const getMDXComponents = (
  components?: MDXComponents,
): MDXComponents => ({
  ...defaultComponents,
  a: ({ children, href }) => <Link href={href}>{children}</Link>,
  blockquote: ({ children, cite, ...props }) => (
    <Blockquote cite={cite} {...props}>
      {children}
    </Blockquote>
  ),
  h1: ({ children, ...props }) => (
    <Headline level="1" {...props}>
      {children}
    </Headline>
  ),
  h2: ({ children, ...props }) => (
    <Headline level="2" {...props}>
      {children}
    </Headline>
  ),
  h3: ({ children, ...props }) => (
    <Headline level="3" {...props}>
      {children}
    </Headline>
  ),
  h4: ({ children, ...props }) => (
    <Headline level="4" {...props}>
      {children}
    </Headline>
  ),
  h5: ({ children, ...props }) => (
    <Headline level="5" {...props}>
      {children}
    </Headline>
  ),
  h6: ({ children, ...props }) => (
    <Headline level="6" {...props}>
      {children}
    </Headline>
  ),

  // Support captions
  img: Image,

  // Override to adjust styling
  pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
  CodeBlockTabs,
  CodeBlockTabsList,

  ConsentUpdate,

  ...components,
});
