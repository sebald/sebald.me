import defaultComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { Blockquote } from './ui/blockquote';
import { Headline } from './ui/headline';
import { Link } from './ui/link';

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
    <Headline level="1" as="h1" {...props}>
      {children}
    </Headline>
  ),
  h2: ({ children, ...props }) => (
    <Headline level="2" as="h2" {...props}>
      {children}
    </Headline>
  ),
  h3: ({ children, ...props }) => (
    <Headline level="3" as="h3" {...props}>
      {children}
    </Headline>
  ),
  h4: ({ children, ...props }) => (
    <Headline level="4" as="h4" {...props}>
      {children}
    </Headline>
  ),
  h5: ({ children, ...props }) => (
    <Headline level="5" as="h5" {...props}>
      {children}
    </Headline>
  ),
  h6: ({ children, ...props }) => (
    <Headline level="6" as="h6" {...props}>
      {children}
    </Headline>
  ),

  ...components,
});
