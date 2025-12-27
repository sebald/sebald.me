import { cva, type VariantProps } from 'cva';

const inlineStyle = cva({
  base: [
    'font-mono',
    'text-sm',
    'bg-oatmeal-100',
    'text-oatmeal-900',
    'px-1.5',
    'py-0.5',
    'rounded',
    'border',
    'border-oatmeal-200',
  ],
});

const preStyle = cva({
  base: [
    'font-mono',
    'text-sm',
    'bg-oatmeal-900',
    'text-oatmeal-50',
    'p-4',
    'rounded-lg',
    'overflow-x-auto',
    'my-6',
    'border',
    'border-oatmeal-800',
  ],
});

interface CodeProps {
  children: React.ReactNode;
}

export const Code = ({ children }: CodeProps) => {
  return <code className={inlineStyle()}>{children}</code>;
};

interface PreProps {
  children: React.ReactNode;
}

export const Pre = ({ children }: PreProps) => {
  return <pre className={preStyle()}>{children}</pre>;
};
