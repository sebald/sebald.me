import {
  EnvelopeSimpleIcon,
  LinkedinLogoIcon,
} from '@phosphor-icons/react/ssr';

import { socialLinks } from '@/app.config';
import { Headline } from '@/ui/headline';
import { ChatIcon } from '@/ui/icon/chat-icon';
import { Link } from '@/ui/link';

export const Connect = () => (
  <div className="group flex items-center gap-10 px-16">
    <div className="bg-oatmeal-100 text-oatmeal-700 grid size-28 shrink-0 place-items-center self-center rounded-full">
      <ChatIcon size={60} />
    </div>
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Headline level="3" as="h2">
          Let&apos;s start a conversation.
        </Headline>
        <div className="text-muted font-sans text-lg">
          Whether you have a question about my work or simply want to say hello,
          my inbox is open. I look forward to hearing from you.
        </div>
      </div>
      <div className="flex gap-16 text-base">
        <Link
          variant="inherit"
          noUnderline
          href="mailto:sebastian.sebald+me@gmail.com"
        >
          <EnvelopeSimpleIcon size={20} /> E-Mail
        </Link>
        <Link
          variant="inherit"
          noUnderline
          href={socialLinks.linkedin}
          target="_blank"
        >
          <LinkedinLogoIcon size={20} /> LinkedIn
        </Link>
      </div>
    </div>
  </div>
);
