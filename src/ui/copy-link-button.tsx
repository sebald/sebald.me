'use client';

import { CheckIcon, LinkIcon } from '@phosphor-icons/react';
import { useState } from 'react';

import { cva } from '@/lib/styles.utils';

const styles = {
  action: cva({
    base: [
      'flex items-center justify-center',
      'size-12 rounded-full',
      'bg-mist-800 text-mist-500',
      'hover:bg-mist-500/50 hover:text-mist-50',
      'transition-all duration-150',
      '[&_svg]:size-5',
    ],
  }),
};

export const CopyLinkButton = () => {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={styles.action()}
      aria-label={copied ? 'Link copied' : 'Copy link to clipboard'}
    >
      {copied ? <CheckIcon weight="bold" /> : <LinkIcon weight="bold" />}
    </button>
  );
};
