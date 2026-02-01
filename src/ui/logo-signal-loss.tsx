import React from 'react';

/**
 * Common Props Interface
 */
interface InvaderProps {
  className?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

/**
 * Base SVG Component
 */
const BaseInvader: React.FC<InvaderProps> = ({
  className = '',
  fill = 'currentColor',
  stroke = 'none',
  strokeWidth = 0,
  style = {},
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 156.8 206.1"
      className={className}
      style={style}
      role="img"
      aria-label="Pixel Art Character"
    >
      <path
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        d="M72 203v-4h-6l-1-10v-10h7v-40H61v13h-9v-13h-6l-1 13v14h7v13h-7v7H32v-7h-6v-13h6v-27h-6v-7h-7v-14H0v-13h19V86H0V73h19V53H0V39h19v-6h7v-7h7v-6l4-1h2V0h13v19h20V0h13v19h20V0h13v19a160 160 0 006 0v7h7v7h6v6h20v14h-20v10l1 10h19v13h-20v10l1 9h19v13h-10l-10 1v13h-6v7h-13v14h6v6l1 10v4h-20v-20h6v-7h-6v-7H85v40h7v19l-1 1h-6v7H72zm6-10v-7h-6v13h6zm40-71v-3h6V76h-6v36h-7v6h-6l-7 1v6h20zM39 86V46h6l1-3v-4h46v-6H39v6h-7v47h7z"
      />
    </svg>
  );
};

// ----------------------------------------------------------------------
// Simulates a corrupt data signal using clips and transforms.
// ----------------------------------------------------------------------
export const GlitchInvader: React.FC = () => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-neutral-900">
      <div className="relative p-16">
        {/* Base layer */}
        <BaseInvader className="animate-glitch-base relative z-10 h-auto w-64 text-rose-500" />

        {/* Glitch layers (duplicates) */}
        <BaseInvader
          className="animate-glitch-1 absolute top-16 left-16 h-auto w-64 text-blue-500 opacity-80 mix-blend-screen"
          style={{ clipPath: 'inset(10% 0 80% 0)' }}
        />
        <BaseInvader
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
