'use client';

import { FileMdIcon, LinkSimpleIcon } from '@phosphor-icons/react/ssr';

import { Article } from './article';

// CopyLinkItem
// ---------------
export const CopyLinkItem = () => {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Article.ActionsItem onClick={copyLink}>
      <LinkSimpleIcon weight="bold" />
      Copy URL
    </Article.ActionsItem>
  );
};
