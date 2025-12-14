import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export const getMDXComponents = (components?: MDXComponents): MDXComponents => ({
    a: ({ children, href }) => {
      const isExternal = href?.startsWith('http');
      return isExternal ? (
        <a href={href} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href || '#'} className="text-blue-600 hover:underline">
          {children}
        </Link>
      );
    },
    ...components,
  });
