'use client';

import { getCookie, setCookie } from 'cookies-next';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useSyncExternalStore,
} from 'react';

// Types
// ---------------
export type ConsentStatus = 'granted' | 'denied';

// Store (external)
// ---------------
const subscribe = (callback: () => void) => {
  window.addEventListener('consent-change', callback);
  return () => window.removeEventListener('consent-change', callback);
};

const getSnapshot = () => {
  const value = getCookie('cookie_consent');
  return typeof value === 'string' ? value : undefined;
};

const getServerSnapshot = () => undefined;

// Context
// ---------------
export interface AnalyticsContextValue {
  consent: ConsentStatus;
  hasMadeChoice: boolean;
  accept: () => void;
  decline: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context)
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  return context;
};

// Provider
// ---------------
export const AnalyticsProvider = ({ children }: PropsWithChildren) => {
  const cookieValue = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Indicates whether the user has previously made a consent decision
  const hasMadeChoice = cookieValue !== undefined;
  const consent = cookieValue === 'granted' ? 'granted' : 'denied';

  const updateConsent = (consent: ConsentStatus) => {
    setCookie('cookie_consent', consent, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      try {
        window.gtag('consent', 'update', {
          ad_storage: consent,
          analytics_storage: consent,
          ad_user_data: consent,
          ad_personalization: consent,
        });
      } catch (error) {
        console.error('Failed to update gtag consent:', error);
      }
    }

    // Notify the store
    window.dispatchEvent(new Event('consent-change'));
  };

  return (
    <AnalyticsContext.Provider
      value={{
        consent,
        hasMadeChoice,
        accept: () => updateConsent('granted'),
        decline: () => updateConsent('denied'),
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
