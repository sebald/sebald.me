import { cva } from 'cva';

const style = cva({
  base: [
    'font-mono text-sm',
    'bg-oatmeal-100 text-oatmeal-900',
    'px-1.5 py-0.5',
    'rounded border border-oatmeal-200',
  ],
});

interface CodeProps {
  children: React.ReactNode;
}

export const Code = ({ children }: CodeProps) => (
  <code className={style()}>{children}</code>
);
