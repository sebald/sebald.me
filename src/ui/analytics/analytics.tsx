'use client';

import { GoogleAnalytics } from '@next/third-parties/google';

import { DEFAULT_CONSENT } from './config';
import { ConsentBanner } from './consent-banner';
import { ConsentScript } from './consent-script';

export interface AnalyticsProps {
  gaId: string;
}

export const Analytics = ({ gaId }: AnalyticsProps) => {
  return (
    <>
      <ConsentScript consent={DEFAULT_CONSENT as 'granted' | 'denied'} />
      <GoogleAnalytics gaId={gaId} />
      <ConsentBanner />
    </>
  );
};
