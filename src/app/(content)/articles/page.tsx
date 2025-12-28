import Link from 'fumadocs-core/link';

import { articlesSource } from '@/lib/source';

const ArticlesIndex = async () => {
  const pages = articlesSource.getPages().sort((a, b) => {
    const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
    const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div>
      <h1 className="mb-8 text-4xl font-bold">Articles</h1>
      <div className="space-y-6">
        {pages.map((page) => (
          <article
            key={page.url}
            className="border-b border-gray-200 pb-6 last:border-b-0"
          >
            <Link href={page.url} className="group">
              <h2 className="mb-2 text-2xl font-bold transition-colors group-hover:text-blue-600">
                {page.data.title}
              </h2>
            </Link>
            <p className="mb-3 text-gray-600">{page.data.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex gap-4">
                {page.data.date && (
                  <span>{new Date(page.data.date).toLocaleDateString()}</span>
                )}
              </div>
              {page.data.draft && (
                <span className="font-semibold text-orange-600">Draft</span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ArticlesIndex;
