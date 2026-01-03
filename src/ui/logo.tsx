import Link from 'fumadocs-core/link';

import { cn } from '@/lib/styles.utils';

export const Dot = () => (
  <div className="bg-blueberry-600 relative inline-block size-[0.25em] origin-bottom animate-[jumping-square_12s_infinite] rounded-none" />
);

interface LogoProps {
  className?: string;
  href?: string;
}

export const Logo = ({ className, href = '/' }: LogoProps) => {
  const Component = href ? Link : 'div';

  return (
    <Component
      href={href}
      className={cn(
        'text-oatmeal-950 @navigation:text-4xl flex items-baseline gap-[3px] font-sans text-3xl font-extrabold tracking-tighter',
        className,
      )}
    >
      sebald
      <Dot />
    </Component>
  );
};
