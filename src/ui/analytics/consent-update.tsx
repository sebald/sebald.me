'use client';

import { HandshakeIcon } from '@phosphor-icons/react/ssr';

import type { DialogTriggerProps } from '@/ui/dialog';
import { Dialog } from '@/ui/dialog';

import { useConsent } from './use-consent';

// Poor mans i18n
// ---------------
const intl = {
  de: {
    title: 'Einwilligung verwalten',
    body: 'Ich nutze Google Analytics, um besser zu verstehen, welche Inhalte für dich relevant sind. Dabei können Daten auch in die USA übertragen werden. Bist du damit einverstanden?',
    accept: 'Ja, einverstanden',
    decline: 'Nein, nur Essenzielle',
  },
  en: {
    title: 'Manage consent',
    body: 'I use Google Analytics to better understand which content is relevant to you. This may involve transferring data to the USA. Do you consent to this?',
    accept: 'Yes, I agree',
    decline: 'No, essential only',
  },
} as const;

// Props
// ---------------
export interface ConsentUpdateProps {
  locale?: keyof typeof intl;
  triggerVariant?: DialogTriggerProps['variant'];
}

// Component
// ---------------
export const ConsentUpdate = ({
  locale = 'en',
  triggerVariant = 'inherit',
}: ConsentUpdateProps) => {
  const { accept, decline } = useConsent();
  const t = intl[locale];

  // TODO: Reload page after consent update.

  return (
    <Dialog.Root>
      <Dialog.Trigger variant={triggerVariant}>{t.title}</Dialog.Trigger>
      <Dialog size="large">
        <Dialog.Title>
          <HandshakeIcon size={32} weight="duotone" />
          {t.title}
        </Dialog.Title>
        <Dialog.Body>{t.body}</Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close variant="ghost" onClick={decline}>
            {t.decline}
          </Dialog.Close>
          <Dialog.Close variant="light" onClick={accept}>
            {t.accept}
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>
  );
};
