import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { notesSource, pageImage } from '@/lib/source';

export const revalidate = false;

export const GET = async (
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) => {
  const { slug } = await params;
  const page = notesSource.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#10141d',
        padding: '60px 80px',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#e5ecf1',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {page.data.title}
        </h1>
        <p
          style={{
            fontSize: '28px',
            color: '#4d5e7a',
            lineHeight: 1.5,
            marginTop: '24px',
          }}
        >
          {page.data.description}
        </p>
      </div>
      <p
        style={{
          fontSize: '22px',
          color: '#4d5e7a',
          margin: 0,
        }}
      >
        sebald.me
      </p>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
};

export const generateStaticParams = () => {
  return notesSource.getPages().map(page => ({
    lang: page.locale,
    slug: pageImage(page).segments,
  }));
};
