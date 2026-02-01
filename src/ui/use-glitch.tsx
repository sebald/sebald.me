'use client';

import type { PropsWithChildren } from 'react';
import { useEffect, useId, useRef } from 'react';

interface UseGlitchOptions {
  /** Controls whether the glitch animation is running */
  active?: boolean;
  /** Minimum displacement scale */
  minScale?: number;
  /** Maximum displacement scale */
  maxScale?: number;
  /** X frequency range [min, max] */
  freqX?: [number, number];
  /** Y frequency range [min, max] */
  freqY?: [number, number];
  /** Duration of glitch burst in frames */
  holdFrames?: number;
  /** Idle time between glitches in frames [min, max] */
  idleRange?: [number, number];
}

export const useGlitch = ({
  active = true,
  minScale = 20,
  maxScale = 150,
  freqX = [0.01, 0.02],
  freqY = [0.01, 0.05],
  holdFrames = 20,
  idleRange = [300, 320],
}: UseGlitchOptions = {}) => {
  // Generate a unique ID so multiple instances don't conflict
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
      minScale,
      maxScale,
      freqX,
      freqY,
      holdFrames,
      idleRange,
    };

    let waitCount = 0;
    let currentHold = 0;

    const random = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const applyDistortion = () => {
      if (!turbRef.current || !dispRedRef.current || !dispCyanRef.current)
        return;

      const freqXVal = random(config.freqX[0], config.freqX[1]);
      const freqYVal = random(config.freqY[0], config.freqY[1]);
      const intensity = random(config.minScale, config.maxScale);

      turbRef.current.setAttribute('baseFrequency', `${freqXVal} ${freqYVal}`);
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
  }, [active, minScale, maxScale, freqX, freqY, holdFrames, idleRange]);

  const Defs = () => (
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
  );

  const Wrapper = ({ children }: PropsWithChildren) => (
    <g style={{ filter: `url(#${filterId})` }}>{children}</g>
  );

  return { Defs, Wrapper };
};
