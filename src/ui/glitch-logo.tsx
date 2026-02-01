'use client';

import React, { useEffect, useId, useRef } from 'react';

interface GlitchLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  /** Controls whether the glitch animation is running */
  active?: boolean;
}

export const GlitchLogo: React.FC<GlitchLogoProps> = ({
  className = '',
  width = 60,
  height = 80,
  active = true,
}) => {
  // Generate a unique ID so multiple instances of this component don't conflict
  const id = useId().replace(/:/g, '');
  const filterId = `shred-filter-${id}`;
  const turbId = `shred-turb-${id}`;
  const dispRedId = `shred-disp-red-${id}`;
  const dispCyanId = `shred-disp-cyan-${id}`;

  // Refs for direct DOM manipulation (performance optimization)
  const turbRef = useRef<SVGFETurbulenceElement>(null);
  const dispRedRef = useRef<SVGFEDisplacementMapElement>(null);
  const dispCyanRef = useRef<SVGFEDisplacementMapElement>(null);
  const animationRef = useRef<number>(0);

  // Helper to reset SVG filter attributes to zero (no distortion)
  const resetDistortion = () => {
    if (!turbRef.current || !dispRedRef.current || !dispCyanRef.current) return;
    turbRef.current.setAttribute('baseFrequency', '0');
    dispRedRef.current.setAttribute('scale', '0');
    dispCyanRef.current.setAttribute('scale', '0');
  };

  useEffect(() => {
    // If inactive, ensure we are reset and do not start the loop
    if (!active) {
      resetDistortion();
      cancelAnimationFrame(animationRef.current);
      return;
    }

    // Configuration specifically tuned for the "Shred" effect
    // 60 frames ≈ 1 second
    const config = {
      minScale: 20,
      maxScale: 150,
      freqX: [0.01, 0.02], // Low X freq
      freqY: [0.01, 0.05], // Very low Y freq = Thick horizontal bands
      holdFrames: 20, // Burst duration (~0.3s)
      // Delay between glitches: 300 frames ≈ 5 seconds at 60Hz
      idleRange: [300, 320],
    };

    let waitCount = 0;
    let currentHold = 0;

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const applyDistortion = () => {
      if (!turbRef.current || !dispRedRef.current || !dispCyanRef.current)
        return;

      const freqX = random(config.freqX[0], config.freqX[1]);
      const freqY = random(config.freqY[0], config.freqY[1]);
      const intensity = random(config.minScale, config.maxScale);

      turbRef.current.setAttribute('baseFrequency', `${freqX} ${freqY}`);
      turbRef.current.setAttribute(
        'seed',
        Math.floor(random(0, 100)).toString(),
      );

      // Split RGB channels in opposite directions
      dispRedRef.current.setAttribute('scale', intensity.toString());
      dispCyanRef.current.setAttribute('scale', (-intensity).toString());
    };

    const loop = () => {
      // 1. Handle Pause/Cooldown State
      if (waitCount > 0) {
        waitCount--;
        resetDistortion();
        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      // 2. Handle Active Burst State
      if (currentHold > 0) {
        currentHold--;

        // Continuous animation during the burst (shredding effect)
        applyDistortion();

        // If hold just finished, calculate next pause duration
        if (currentHold === 0) {
          waitCount = Math.floor(
            random(config.idleRange[0], config.idleRange[1]),
          );
        }

        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      // 3. Trigger Logic (Always triggers after waitCount hits 0)
      applyDistortion();
      currentHold = config.holdFrames;

      animationRef.current = requestAnimationFrame(loop);
    };

    // Start loop
    animationRef.current = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      resetDistortion();
    };
  }, [active]); // Re-run effect when active prop changes

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 156.8 206.1"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* 1. Generate Noise */}
            <feTurbulence
              ref={turbRef}
              id={turbId}
              type="fractalNoise"
              baseFrequency="0"
              numOctaves="1"
              result="noise"
            />

            {/* 2. Isolate Red Channel */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0 
                      0 0 0 0 0 
                      0 0 0 0 0 
                      0 0 0 1 0"
              result="redLayer"
            />

            {/* 3. Isolate Cyan Channel (Green + Blue) */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0 
                      0 1 0 0 0 
                      0 0 1 0 0 
                      0 0 0 1 0"
              result="cyanLayer"
            />

            {/* 4. Displace Red */}
            <feDisplacementMap
              ref={dispRedRef}
              id={dispRedId}
              in="redLayer"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="redGlitched"
            />

            {/* 5. Displace Cyan */}
            <feDisplacementMap
              ref={dispCyanRef}
              id={dispCyanId}
              in="cyanLayer"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="cyanGlitched"
            />

            {/* 6. Recombine with Screen Blend */}
            <feBlend in="redGlitched" in2="cyanGlitched" mode="screen" />
          </filter>
        </defs>

        <g style={{ filter: `url(#${filterId})` }}>
          {/* Your Custom Path */}
          <path
            d="M72 203v-4h-6l-1-10v-10h7v-40H61v13h-9v-13h-6l-1 13v14h7v13h-7v7H32v-7h-6v-13h6v-27h-6v-7h-7v-14H0v-13h19V86H0V73h19V53H0V39h19v-6h7v-7h7v-6l4-1h2V0h13v19h20V0h13v19h20V0h13v19a160 160 0 006 0v7h7v7h6v6h20v14h-20v10l1 10h19v13h-20v10l1 9h19v13h-10l-10 1v13h-6v7h-13v14h6v6l1 10v4h-20v-20h6v-7h-6v-7H85v40h7v19l-1 1h-6v7H72zm6-10v-7h-6v13h6zm40-71v-3h6V76h-6v36h-7v6h-6l-7 1v6h20zM39 86V46h6l1-3v-4h46v-6H39v6h-7v47h7z"
            fill="#ffffff"
          />
        </g>
      </svg>
    </div>
  );
};
