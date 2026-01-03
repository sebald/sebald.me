import { cva } from 'cva';

// Styles
// ---------------
const style = cva({
  base: [
    'border-l-4 border-oatmeal-300',
    'pl-4 py-2 my-6',
    'text-oatmeal-700 italic',
  ],
});

const citationStyle = cva({
  base: ['block mt-2', 'text-sm text-oatmeal-600', 'not-italic'],
});

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
    <blockquote className={style()} cite={cite}>
      <div>{children}</div>
      {attribution && <cite className={citationStyle()}>— {attribution}</cite>}
    </blockquote>
  );
};
