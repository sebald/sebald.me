'use client';

import { useEffect } from 'react';

import { isOutboundUrl, trackEvent } from '@/lib/analytics';

/**
 * Tracks clicks on links that leave the site. A single document listener
 * covers every link (footer, MDX content, …) without turning `Link` into
 * a client component. Mount once, near the root.
 */
export const OutboundLinkTracking = () => {
  useEffect(() => {
    const handle = (event: MouseEvent) => {
      // `auxclick` also fires for right clicks, which don't open the link
      if (event.button > 1) return;

      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const url = new URL(anchor.href);
      if (!isOutboundUrl(url, window.location.origin)) return;

      trackEvent('Outbound Link', { url: url.href });
    };

    // Capture, so links that stop propagation are tracked as well.
    // `auxclick` covers middle clicks (open in new tab).
    document.addEventListener('click', handle, { capture: true });
    document.addEventListener('auxclick', handle, { capture: true });
    return () => {
      document.removeEventListener('click', handle, { capture: true });
      document.removeEventListener('auxclick', handle, { capture: true });
    };
  }, []);

  return null;
};
