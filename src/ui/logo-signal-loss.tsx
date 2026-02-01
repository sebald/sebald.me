import { LogoIcon } from '@/ui/logo';

interface GlitchInvaderProps {
  size?: number;
}

// ----------------------------------------------------------------------
// Simulates a corrupt data signal using clips and transforms.
// ----------------------------------------------------------------------
export const GlitchInvader = ({ size = 32 }: GlitchInvaderProps) => {
  return (
    <div className="relative">
      <LogoIcon
        size={size}
        className="animate-glitch-flash relative z-10 text-mist-400"
      />

      {/* Glitch layers */}
      <LogoIcon
        size={size}
        className="animate-glitch-shift-slow absolute top-0 left-0 text-rose-500 opacity-80 mix-blend-screen"
        style={{ clipPath: 'inset(10% 0 80% 0)' }}
      />
      <LogoIcon
        size={size}
        className="animate-glitch-shift-fast absolute top-0 left-0 text-lime-400 opacity-80 mix-blend-screen"
        style={{ clipPath: 'inset(80% 0 5% 0)' }}
      />
    </div>
  );
};
