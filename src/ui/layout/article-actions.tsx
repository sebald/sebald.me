'use client';

import { LinkSimpleIcon, MarkdownLogoIcon } from '@phosphor-icons/react/ssr';

import { Article } from './article';

// CopyLinkItem
// ---------------
export const CopyLinkItem = () => {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <Article.ActionsItem onClick={copyLink}>
      <LinkSimpleIcon size={16} />
      Copy link
    </Article.ActionsItem>
  );
};

// CopyMarkdownLinkItem
// ---------------
interface CopyMarkdownLinkItemProps {
  href: string;
}

export const CopyMarkdownLinkItem = ({ href }: CopyMarkdownLinkItemProps) => {
  const copyAsMarkdown = () => {
    const fullUrl = new URL(href, window.location.origin).href;
    navigator.clipboard.writeText(fullUrl);
  };

  return (
    <Article.ActionsItem onClick={copyAsMarkdown}>
      <MarkdownLogoIcon size={16} />
      Copy markdown link
    </Article.ActionsItem>
  );
};
