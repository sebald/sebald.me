import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { notesSource, pageImage } from '@/lib/source';
import { Note } from '@/ui/layout/note';
import { getMDXComponents } from '@/ui/mdx';

// Config
// ---------------
export const generateStaticParams = async () => notesSource.generateParams();

// Meta
// ---------------
export const generateMetadata = async (
  props: PageProps<'/notes/[...slug]'>,
): Promise<Metadata> => {
  const params = await props.params;
  const page = notesSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: pageImage(page).url,
    },
  };
};

// Page
// ---------------
const Page = async (props: PageProps<'/notes/[...slug]'>) => {
  const params = await props.params;
  const page = notesSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;
  const titleId = `note-${page.slugs.join('-')}`;

  return (
    <Note aria-labelledby={titleId} className="gap-12 md:gap-24">
      <Note.Header>
        <Note.Title id={titleId}>{page.data.title}</Note.Title>
        <Note.Meta date={page.data.date} topics={page.data.topics} />
        <Note.Actions>
          <Note.MarkdownLink
            aria-label={`View "${page.data.title}" as markdown`}
            href={`${page.url}.md`}
          />
        </Note.Actions>
      </Note.Header>
      <Note.Content>
        <MDX components={getMDXComponents()} />
      </Note.Content>
    </Note>
  );
};

export default Page;
