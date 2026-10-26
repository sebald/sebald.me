import { ImageResponse } from 'next/og';

import { Logo } from '@/lib/og';

// Config
// ---------------
export const revalidate = false;

// Cover art of the podcast feed. Apple wants a square of 1400 to 3000px.
const SIZE = 3000;

// Route
// ---------------
export const GET = () =>
  new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10141d',
      }}
    >
      <Logo size={1200} />
    </div>,
    { width: SIZE, height: SIZE },
  );
