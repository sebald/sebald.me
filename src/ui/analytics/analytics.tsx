'use client';

import { GoogleAnalytics } from '@next/third-parties/google';

import { ConsentBanner } from './consent-banner';
import { ConsentScript } from './consent-script';

export interface AnalyticsProps {
  gaId: string;
}

export const Analytics = ({ gaId }: AnalyticsProps) => {
  return (
    <>
      <ConsentScript />
      <GoogleAnalytics gaId={gaId} />
      <ConsentBanner />
    </>
  );
};
