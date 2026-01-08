'use client';

import Script from 'next/script';

// Component
// ---------------
export const ConsentScript = () => (
  <Script id="consent-init" strategy="afterInteractive">
    {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        gtag('consent', 'default', {
          'ad_storage': 'denied',
          'analytics_storage': 'denied',
          'ad_user_data': 'denied',
          'ad_personalization': 'denied',
          'wait_for_update': 500
        });

        gtag('js', new Date());
      `}
  </Script>
);
