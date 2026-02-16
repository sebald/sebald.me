'use client';

import { CookieIcon } from '@phosphor-icons/react/ssr';

import type { DialogTriggerProps } from '@/ui/dialog';
import { Dialog } from '@/ui/dialog';

import { useAnalytics } from './analytics-context';

// Poor mans i18n
// ---------------
const intl = {
  de: {
    title: 'Einwilligung verwalten',
    text: 'Ich nutze Google Analytics, um besser zu verstehen, welche Inhalte für dich relevant sind. Dabei können Daten auch in die USA übertragen werden. Bist du damit einverstanden?',
    accept: 'Ja, einverstanden',
    decline: 'Nein, nur Essenzielle',
  },
  en: {
    title: 'Manage Consent',
    text: 'I use Google Analytics to better understand which content is relevant to you. This may involve transferring data to the USA. Do you agree?',
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
  triggerVariant = 'link',
}: ConsentUpdateProps) => {
  const { accept, decline } = useAnalytics();
  const t = intl[locale];

  return (
    <Dialog.Root>
      <Dialog.Trigger variant={triggerVariant}>{t.title}</Dialog.Trigger>
      <Dialog size="large" showCloseButton>
        <Dialog.Title>
          <CookieIcon weight="bold" />
          {t.title}
        </Dialog.Title>
        <Dialog.Body>{t.text}</Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close variant="primary" onClick={accept}>
            {t.accept}
          </Dialog.Close>
          <Dialog.Close onClick={decline}>{t.decline}</Dialog.Close>
        </Dialog.Actions>
      </Dialog>
    </Dialog.Root>
  );
};
