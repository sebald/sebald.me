import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { shouldShowDrafts } from '@/lib/draft.utils';
import { Inventory } from '@/ui/lab/pushback/inventory/loader';
import { Article } from '@/ui/layout/article';
import { PageToolbar } from '@/ui/page-toolbar';

// Config
// ---------------
export const dynamic = 'force-dynamic';

// Meta
// ---------------
export const metadata: Metadata = {
  title: 'Pushback inventory',
  robots: { index: false, follow: false },
};

// Page
// ---------------
/** The game's inventory: dev and preview deployments only, a 404 in production */
const InventoryPage = () => {
  if (!shouldShowDrafts(process.env)) notFound();
  return (
    <>
      <PageToolbar />
      <Article aria-labelledby="inventory-title">
        <Article.Header>
          <Article.Title id="inventory-title" level="1">
            Pushback inventory
          </Article.Title>
        </Article.Header>
        <Inventory />
      </Article>
    </>
  );
};

export default InventoryPage;
