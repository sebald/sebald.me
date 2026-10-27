import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Sandbox } from '@/ui/lab/pushback/dev/sandbox';
import { Article } from '@/ui/layout/article';
import { PageToolbar } from '@/ui/page-toolbar';

// Config
// ---------------
export const dynamic = 'force-dynamic';

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Pushback workbench',
  robots: { index: false, follow: false },
};

// Page
// ---------------
/** The workbench: dev only, a 404 in production */
const WorkbenchPage = () => {
  if (process.env.NODE_ENV === 'production') notFound();
  return (
    <>
      <PageToolbar />
      <Article aria-labelledby="workbench-title">
        <Article.Header>
          <Article.Title id="workbench-title" level="1">
            Pushback workbench
          </Article.Title>
        </Article.Header>
        <Sandbox />
      </Article>
    </>
  );
};

export default WorkbenchPage;
