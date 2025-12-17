import { setCookie } from 'cookies-next';

import { CONSENT_DURATION, COOKIE_NAME } from './config';

export const useConsent = () => {
  const updateConsent = (consent: 'granted' | 'denied') => {
    setCookie(COOKIE_NAME, consent, { maxAge: CONSENT_DURATION });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: consent,
        analytics_storage: consent,
        ad_user_data: consent,
        ad_personalization: consent,
      });
    }
  };

  return {
    accept: () => updateConsent('granted'),
    decline: () => updateConsent('denied'),
  };
};
