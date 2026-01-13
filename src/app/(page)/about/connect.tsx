import { ChatsIcon } from '@phosphor-icons/react/ssr';

export const Connect = () => (
  <div className="flex items-center gap-6 px-16">
    <div className="bg-oatmeal-100 grid size-32 shrink-0 place-items-center self-start rounded-full">
      <ChatsIcon size={64} weight="light" />
    </div>
    <div>
      <div className="font-sans text-3xl leading-tight md:text-4xl">
        <span>Let&apos;s start a</span>{' '}
        <span className="font-semibold">conversation.</span>
      </div>
      <div className="text-muted font-sans text-lg">
        Whether you have a question about my work or simply want to say hello,
        my inbox is open. I look forward to hearing from you.
      </div>
    </div>
  </div>
);
