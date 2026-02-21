'use client';

import { CookieIcon } from '@phosphor-icons/react/ssr';

import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';

import { useAnalytics } from './analytics-context';

export const ConsentBanner = () => {
  const { accept, decline, hasMadeChoice } = useAnalytics();

  // Don't render on server to avoid hydration mismatch
  if (typeof window === 'undefined') return null;

  // Only show if user hasn't made a choice yet
  if (hasMadeChoice) return null;

  return (
    <Dialog.Root open={true} modal={false} disablePointerDismissal>
      <Dialog position="bottom" size="xlarge" layout="inline">
        <Dialog.Title>
          <CookieIcon weight="bold" />
          About cookies on this site
        </Dialog.Title>
        <Dialog.Body>
          I use cookies to see how you use the site and what you enjoy reading.
          This helps me understand what to write about.
        </Dialog.Body>
        <Dialog.Actions>
          <Button variant="primary" onClick={accept}>
            Accept
          </Button>
          <Button onClick={decline}>Decline</Button>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>
  );
};
