import { notFound } from 'next/navigation';

import { miscSource } from '@/lib/source';
import { getMDXComponents } from '@/ui/mdx';

export const CodeExamples = () => {
  const page = miscSource.getPage(['code-examples']);
  if (!page) notFound();

  const MDX = page.data.body;

  return <MDX components={getMDXComponents()} />;
};
