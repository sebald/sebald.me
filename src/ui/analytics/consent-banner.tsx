'use client';

import { Button } from '@base-ui/react/button';
import { Dialog } from '@base-ui/react/dialog';
import { useState } from 'react';

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
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
      <Dialog.Portal>
        <Dialog.Popup className="animate-in slide-in-from-bottom-full fixed right-0 bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] duration-300 outline-none">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <Dialog.Title className="text-base font-bold text-gray-900">
                We value your privacy
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-gray-600">
                We use cookies to analyze traffic and improve your experience.
              </Dialog.Description>
            </div>

            <div className="flex shrink-0 gap-3">
              <Button
                onClick={handleDecline}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              >
                Decline
              </Button>
              <Button
                onClick={handleAccept}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:ring-2 focus:ring-gray-900 focus:outline-none"
              >
                Accept
              </Button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
