import { cva } from 'cva';

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
}

// Component
// ---------------
export const Blockquote = ({
  children,
  cite,
  attribution,
}: BlockquoteProps) => {
  return (
    <blockquote className={style.quote()} cite={cite}>
      <div>{children}</div>
      {attribution && <cite className={style.cite()}>— {attribution}</cite>}
    </blockquote>
  );
};
