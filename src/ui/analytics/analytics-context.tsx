'use client';

import { getCookie, setCookie } from 'cookies-next';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useSyncExternalStore,
} from 'react';

import { CONSENT_DURATION, COOKIE_NAME, DEFAULT_CONSENT } from './config';

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
  const value = getCookie(COOKIE_NAME);
  return typeof value === 'string' ? value : undefined;
};

const getServerSnapshot = () => undefined;

// Context
// ---------------
export interface AnalyticsContextValue {
  consent: ConsentStatus;
  hasLoaded: boolean;
  hasChoice: boolean;
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

  const hasLoaded = true; // SyncExternalStore handles the loading state implicitly
  const hasChoice = cookieValue !== undefined;
  const consent = cookieValue === 'granted' ? 'granted' : DEFAULT_CONSENT;

  const updateConsent = (consent: ConsentStatus) => {
    setCookie(COOKIE_NAME, consent, {
      maxAge: CONSENT_DURATION,
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
        hasLoaded,
        hasChoice,
        accept: () => updateConsent('granted'),
        decline: () => updateConsent('denied'),
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};
