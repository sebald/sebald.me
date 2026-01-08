'use client';

import { CookieIcon } from '@phosphor-icons/react/ssr';

import { Button } from '@/ui/button';
import { Dialog } from '@/ui/dialog';

import { useAnalytics } from './analytics-context';

export const ConsentBanner = () => {
  const { accept, decline, hasChoice, hasLoaded } = useAnalytics();

  const handleAccept = () => {
    accept();
  };

  const handleDecline = () => {
    decline();
  };

  // Don't render on server to avoid hydration mismatch
  if (!hasLoaded) return null;

  // Only show if user hasn't made a choice yet
  if (hasChoice) return null;

  return (
    <Dialog.Root open={true} modal={false} disablePointerDismissal>
      <Dialog position="bottom" size="full" layout="inline">
        <Dialog.Title>
          <CookieIcon size={32} weight="duotone" />
          I&apos;d like to learn from you
        </Dialog.Title>
        <Dialog.Body>
          I use minimal analytics to understand which articles and ideas
          resonate with you most. It helps me write better content.
        </Dialog.Body>
        <Dialog.Actions>
          <Button onClick={handleAccept}>Accept</Button>
          <Button variant="ghost" onClick={handleDecline}>
            Decline
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>
  );
};
