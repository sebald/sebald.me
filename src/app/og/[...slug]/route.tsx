import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';

import { miscSource, notesSource, pageImage } from '@/lib/source';

export const revalidate = false;

const NOTES_DIR = resolve(process.cwd(), 'content/notes');
const MISC_DIR = resolve(process.cwd(), 'content/misc');

const Logo = ({ size = 40 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 780.055 1025.027"
    width={size}
    height={size * (1025.027 / 780.055)}
    style={{ flexShrink: 0 }}
  >
    <path
      d="m439.125 1097.553-.274-16.75-14.5-.13c-7.975-.073-15.175-.185-16-.25-1.309-.105-1.527-6.497-1.711-50.12l-.211-50h32.922v-34l-.48-65.215.53-67.785-.275-16.25-.275-16.25-16.25-.275-36.25-.275v66.05h-45v-66.05l-16.25.275-16.25.275-.257 66.25-.257 66.25h33.014v67h-16.563c-15.175 0-16.548.146-16.385 1.75.098.962.126 8.612.063 17l-.115 15.25h-65v-34h-32v-66.951l16.25-.274 16.25-.275-.19-66-.19-66-16.06-.275-16.06-.275v-34.9l-16.25-.275-16.25-.275-.264-33.291-.263-33.29-47.737.127-47.736.127v-64.673l47.75-.26 47.75-.26v-96.98H82.323l.264-32.25.264-32.25 48.123-.26 48.122-.26-.293-4.74c-.16-2.607-.328-24.878-.372-49.49l-.08-44.75h-96v-66.981l48.151-.26 48.152-.26-.083-14.5c-.045-7.974.138-15.275.408-16.224.433-1.524 2.323-1.757 16.181-2l15.69-.275.275-16.75.274-16.75h32.704l-.075-15.468c-.041-8.508.2-15.744.537-16.08.824-.825 8.072-1.302 21.026-1.384l10.74-.068.26-47.75.26-47.75h64l.26 47.75.259 47.75 2.49.1c1.37.055 3.615.1 4.99.1s22.3-.045 46.5-.1l44-.1V89.275l32.75.264 32.75.264.26 47.73.26 47.732 48.087.269c26.447.148 48.488.02 48.98-.284.499-.309 1.009-21.53 1.154-48l.26-47.447 30.982-.13c17.04-.071 31.552.09 32.25.357 1 .384 1.268 10.52 1.268 47.88v47.393l2.25.116c1.237.063 7.425.196 13.75.295 6.325.098 12.737.27 14.25.384l2.75.205v32h32v34h32l.144 9.75c.079 5.362.192 12.675.25 16.25l.106 6.5 48.25.26 48.25.259V352.284l-48.086.26-48.086.259.064 48c.035 26.4.074 48.558.086 49.24.017.966 10.591 1.298 47.772 1.5l47.75.26.264 32.25.263 32.25h-96.534l.324 48.237c.179 26.531.442 48.355.585 48.498.143.143 21.598.374 47.679.512l47.419.253V678.424l-48 .19-48 .189v66l-16.25.275-16.25.274v34.951h-65v68h33l.065 33.75c.036 18.562.148 40.914.25 49.67l.185 15.92-47 .127c-25.85.069-48.013-.06-49.25-.287l-2.25-.414v-98.766h33v-35h-33v-33h-.987L570.1 780.2l-32.75.102h-32v199.95l16.25.275 16.25.275v43.5c0 23.925-.148 46.476-.33 50.114l-.329 6.615-15.92-.114-15.921-.115v33.5h-65.952zm32.901-50-.175-32.75-16.25-.275-16.25-.275v66.05h32.85zm196.325-351.737v-16.513l4.75-.117c2.612-.064 9.925-.177 16.25-.25l11.5-.133v-210l-16.25-.275-16.25-.275v178.05H635.4l-.274 16.109-.275 16.108-32.39.142-32.39.14-.247 16c-.135 8.8-.088 16.27.106 16.6.194.329 22.417.672 49.386.762l49.035.165zm-393.25-180.453c.991-.048 1.25-20.436 1.25-98.444v-98.383l14.75-.07c8.112-.038 15.537-.091 16.5-.117 1.594-.042 1.75-1.516 1.75-16.546v-16.5H538.4l-.274-16.25-.275-16.25h-262l-.128 15c-.071 8.25-.183 15.562-.25 16.25-.092.943-4.054 1.25-16.122 1.25h-16v229.93l10.25.285c8.664.24 14.082.202 21.5-.155z"
      fill="#4d5e7a"
      transform="translate(-82.323 -89.275)"
    />
  </svg>
);

const isDefaultSlug = (slug: string[]) =>
  slug.length === 1 && slug[0] === 'default.png';

/** Strip `.png` from the last segment to get page slugs */
const toPageSlugs = (slug: string[]) => [
  ...slug.slice(0, -1),
  slug.at(-1)!.replace(/\.png$/, ''),
];

/** Try to read a custom og.png from the page's content directory */
const getCustomOgImage = async (pagePath: string, baseDir: string) => {
  const ogPath = join(baseDir, dirname(pagePath), 'og.png');
  try {
    return await readFile(ogPath);
  } catch {
    return null;
  }
};

export const GET = async (
  _req: Request,
  { params }: RouteContext<'/og/[...slug]'>,
) => {
  const { slug } = await params;

  // Default OG image (logo only)
  if (isDefaultSlug(slug)) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#10141d',
          fontFamily: 'monospace',
        }}
      >
        <Logo size={120} />
      </div>,
      { width: 1200, height: 630 },
    );
  }

  // Try notes first, then misc
  const pageSlugs = toPageSlugs(slug);
  const notePage = notesSource.getPage(pageSlugs);
  const page = notePage ?? miscSource.getPage(pageSlugs);
  if (!page) notFound();

  // Serve custom og.png if it exists in the content directory
  const customImage = await getCustomOgImage(
    page.path,
    notePage ? NOTES_DIR : MISC_DIR,
  );
  if (customImage) {
    return new Response(customImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

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
      <Logo />
    </div>,
    { width: 1200, height: 630 },
  );
};

export const generateStaticParams = () => {
  const noteParams = notesSource.getPages().map(page => ({
    slug: pageImage(page).segments,
  }));
  const miscParams = miscSource.getPages().map(page => ({
    slug: pageImage(page).segments,
  }));

  return [{ slug: ['default.png'] }, ...noteParams, ...miscParams];
};
