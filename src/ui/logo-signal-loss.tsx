import { LogoIcon } from '@/ui/logo';

// ----------------------------------------------------------------------
// Simulates a corrupt data signal using clips and transforms.
// ----------------------------------------------------------------------
export const GlitchInvader = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
      <div className="relative p-16">
        {/* Base layer */}
        <LogoIcon className="animate-glitch-base text-mist-400 relative z-10 h-auto w-64" />

        {/* Glitch layers (duplicates) */}
        <LogoIcon
          className="animate-glitch-1 absolute top-16 left-16 h-auto w-64 text-rose-500 opacity-80 mix-blend-screen"
          style={{ clipPath: 'inset(10% 0 80% 0)' }}
        />
        <LogoIcon
          className="animate-glitch-2 absolute top-16 left-16 h-auto w-64 text-lime-400 opacity-80 mix-blend-screen"
          style={{ clipPath: 'inset(80% 0 5% 0)' }}
        />

        <style>{`
          @keyframes glitch-anim-1 {
            0% { clip-path: inset(20% 0 80% 0); transform: translate(-10px, 5px) skew(10deg); }
            10% { clip-path: inset(10% 0 10% 0); transform: translate(10px, -5px) skew(-10deg); }
            20% { clip-path: inset(80% 0 5% 0); transform: translate(-5px, 10px) skew(5deg); }
            30% { clip-path: inset(5% 0 90% 0); transform: translate(5px, -10px) skew(-5deg); }
            40% { clip-path: inset(40% 0 40% 0); transform: translate(-10px, 5px) skew(20deg); }
            50% { clip-path: inset(70% 0 10% 0); transform: translate(10px, -5px) skew(-20deg); }
            60% { clip-path: inset(10% 0 60% 0); transform: translate(-5px, 10px) skew(5deg); }
            70% { clip-path: inset(50% 0 30% 0); transform: translate(5px, -10px) skew(-5deg); }
            80% { clip-path: inset(30% 0 50% 0); transform: translate(-2px, 2px) skew(2deg); }
            90% { clip-path: inset(10% 0 20% 0); transform: translate(2px, -2px) skew(-2deg); }
            100% { clip-path: inset(20% 0 80% 0); transform: translate(0, 0) skew(0); }
          }
          @keyframes glitch-flash {
            0%, 90%, 100% { opacity: 1; transform: scale(1); }
            92% { opacity: 0.5; transform: scale(1.05); }
            94% { opacity: 1; transform: scale(0.95); }
            96% { opacity: 0.2; transform: scale(1.1); filter: invert(1); }
            98% { opacity: 1; transform: scale(1); filter: invert(0); }
          }
          .animate-glitch-1 {
            animation: glitch-anim-1 0.4s infinite linear alternate-reverse;
          }
          .animate-glitch-2 {
            animation: glitch-anim-1 0.3s infinite linear alternate;
          }
          .animate-glitch-base {
            animation: glitch-flash 2s infinite steps(1);
          }
        `}</style>
      </div>
      <div className="mt-8 font-mono text-sm tracking-[0.2em] text-rose-200 uppercase opacity-70">
        Signal Loss // Critical
      </div>
    </div>
  );
};
