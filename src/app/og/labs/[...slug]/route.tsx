import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { getPageImage, labsSource } from '@/lib/source';

export const revalidate = false;

export const GET = async (
  _req: Request,
  { params }: RouteContext<'/og/labs/[...slug]'>,
) => {
  const { slug } = await params;
  const page = labsSource.getPage(slug.slice(0, -1));
  if (!page) notFound();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          padding: '60px',
          fontFamily: 'system-ui',
        }}
      >
        <h1
          style={{
            fontSize: '60px',
            fontWeight: 'bold',
            color: '#000',
            marginBottom: '20px',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          {page.data.title}
        </h1>
        <p
          style={{
            fontSize: '32px',
            color: '#666',
            textAlign: 'center',
            maxWidth: '90%',
          }}
        >
          {page.data.description}
        </p>
        <p
          style={{
            fontSize: '20px',
            color: '#999',
            marginTop: '40px',
          }}
        >
          My Blog - Labs
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
};

export const generateStaticParams = () => {
  return labsSource.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }));
};
