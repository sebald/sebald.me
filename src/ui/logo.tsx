import Link from 'fumadocs-core/link';

export const Dot = () => (
  <div className="bg-blueberry-500 relative inline-block size-[0.25em] origin-bottom animate-[jumping-square_12s_infinite] rounded-none" />
);

interface LogoProps {
  href?: string;
}

export const Logo = ({ href = '/' }: LogoProps) => {
  const Component = href ? Link : 'div';

  return (
    <Component
      href={href}
      className="text-oatmeal-950 flex items-baseline gap-[3px] font-sans text-4xl font-extrabold tracking-tighter"
    >
      sebald
      <Dot />
    </Component>
  );
};
