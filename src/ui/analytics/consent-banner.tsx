'use client';

import { useState } from 'react';

import { Button } from '../button';
import { Dialog } from '../dialog';
import { useConsent } from './use-consent';

type ConsentBannerProps = {
  shouldShow: boolean;
};

export const ConsentBanner = ({ shouldShow }: ConsentBannerProps) => {
  const [open, setOpen] = useState(shouldShow);
  const { accept, decline } = useConsent();

  const handleAccept = () => {
    accept();
    setOpen(false);
  };

  const handleDecline = () => {
    decline();
    setOpen(false);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={setOpen}
      modal={false}
      disablePointerDismissal
    >
      <Dialog position="bottom" size="full" layout="inline">
        <Dialog.Title>I&apos;d like to learn from you</Dialog.Title>
        <Dialog.Body>
          I use minimal analytics to understand which articles and ideas
          resonate with you most. It helps me write better content.
        </Dialog.Body>
        <Dialog.Actions>
          <Button onClick={handleDecline}>Decline</Button>
          <Button onClick={handleAccept}>Accept</Button>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>
  );
};
