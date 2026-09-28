import { cva } from '@/lib/styles.utils';

// Styles
// ---------------
const style = {
  quote: cva({
    base: ['border-l-4 border-mist-600', 'pl-4 py-3', 'text-mist-400 italic'],
  }),
  cite: cva({
    base: ['block mt-3', 'text-sm not-italic text-mist-500'],
  }),
};

// Props
// ---------------
interface BlockquoteProps {
  children: React.ReactNode;
  cite?: string;
  attribution?: React.ReactNode;
  className?: string;
}

// Component
// ---------------
export const Blockquote = ({
  children,
  cite,
  attribution,
  className,
}: BlockquoteProps) => {
  const quote = (
    <blockquote
      className={attribution ? undefined : style.quote({ className })}
      cite={cite}
    >
      <div>{children}</div>
    </blockquote>
  );

  if (!attribution) return quote;

  // The attribution isn't part of the quote, so it belongs outside of
  // <blockquote>. The figure carries the quote styles to keep one border.
  return (
    <figure className={style.quote({ className })}>
      {quote}
      <figcaption className={style.cite()}>— {attribution}</figcaption>
    </figure>
  );
};
