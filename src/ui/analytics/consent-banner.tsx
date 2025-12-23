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
      <Dialog>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <Dialog.Title>We value your privacy</Dialog.Title>
            <Dialog.Description>
              We use cookies to analyze traffic and improve your experience.
            </Dialog.Description>
          </div>

          <Dialog.Actions>
            <Button onClick={handleDecline}>Decline</Button>
            <Button onClick={handleAccept}>Accept</Button>
          </Dialog.Actions>
        </div>
      </Dialog>
    </Dialog.Root>
  );
};
