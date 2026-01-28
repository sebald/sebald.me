import { notFound } from 'next/navigation';

import { miscSource } from '@/lib/source';
import { getMDXComponents } from '@/ui/mdx';

// Page
// ---------------
const Page = async (props: PageProps<'/[...slug]'>) => {
  const params = await props.params;
  const page = miscSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return <MDX components={getMDXComponents()} />;
};

export default Page;
