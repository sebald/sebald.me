'use client';

import Script from 'next/script';

// Props
// ---------------
interface ConsentScriptProps {
  consent: 'granted' | 'denied';
}

// Component
// ---------------
export const ConsentScript = ({ consent }: ConsentScriptProps) => (
  <Script id="consent-init" strategy="afterInteractive">
    {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        
        gtag('consent', 'default', {
          'ad_storage': '${consent}',
          'analytics_storage': '${consent}',
          'ad_user_data': '${consent}',
          'ad_personalization': '${consent}',
          'wait_for_update': 500
        });

        gtag('js', new Date());
      `}
  </Script>
);
