import { GoogleAnalytics } from '@next/third-parties/google';
import { cookies } from 'next/headers';

import { COOKIE_NAME, DEFAULT_CONSENT } from './config';
import { ConsentBanner } from './consent-banner';
import { ConsentScript } from './consent-script';

export interface AnalyticsProps {
  gaId: string;
}

export const Analytics = async ({ gaId }: AnalyticsProps) => {
  const cookieStore = await cookies();
  const consentCookie = cookieStore.get(COOKIE_NAME);
  const hasCookie = !!consentCookie;

  const consent =
    consentCookie?.value === 'granted' ? 'granted' : DEFAULT_CONSENT;

  return (
    <>
      <ConsentScript consent={consent} />
      <GoogleAnalytics gaId={gaId} />
      <ConsentBanner shouldShow={!hasCookie} />
    </>
  );
};
