import Link from 'fumadocs-core/link';
import type { MDXComponents } from 'mdx/types';

export const getMDXComponents = (
  components?: MDXComponents,
): MDXComponents => ({
  a: ({ children, href }) => (
    // fumadocs-core's <Link> handles internal/external links automatically
    <Link href={href} className="text-blue-600 hover:underline">
      {children}
    </Link>
  ),

  ...components,
});
