'use client';

import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useId, useMemo, useRef } from 'react';

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

// Pure utility function - defined outside to avoid recreation
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const useGlitch = ({
  active = true,
  minScale = 20,
  maxScale = 150,
  freqX = [0.01, 0.02],
  freqY = [0.01, 0.05],
  holdFrames = 20,
  idleRange = [300, 320],
}: UseGlitchOptions = {}) => {
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

  // Store config in ref to avoid effect dependency issues with array references
  // Updating ref during render is safe and avoids unnecessary useEffect
  const configRef = useRef({
    minScale,
    maxScale,
    freqX,
    freqY,
    holdFrames,
    idleRange,
  });
  configRef.current = {
    minScale,
    maxScale,
    freqX,
    freqY,
    holdFrames,
    idleRange,
  };

  // Stable function reference for resetting distortion
  const resetDistortion = useCallback(() => {
    if (!turbRef.current || !dispRedRef.current || !dispCyanRef.current) return;
    turbRef.current.setAttribute('baseFrequency', '0');
    dispRedRef.current.setAttribute('scale', '0');
    dispCyanRef.current.setAttribute('scale', '0');
  }, []);

  useEffect(() => {
    // If inactive, ensure we are reset and do not start the loop
    if (!active) {
      resetDistortion();
      cancelAnimationFrame(animationRef.current);
      return;
    }

    let waitCount = 0;
    let currentHold = 0;

    const applyDistortion = () => {
      if (!turbRef.current || !dispRedRef.current || !dispCyanRef.current)
        return;

      const config = configRef.current;
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
          const config = configRef.current;
          waitCount = Math.floor(
            random(config.idleRange[0], config.idleRange[1]),
          );
        }

        animationRef.current = requestAnimationFrame(loop);
        return;
      }

      // 3. Trigger Logic (Always triggers after waitCount hits 0)
      applyDistortion();
      currentHold = configRef.current.holdFrames;

      animationRef.current = requestAnimationFrame(loop);
    };

    // Start loop
    animationRef.current = requestAnimationFrame(loop);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationRef.current);
      resetDistortion();
    };
  }, [active, resetDistortion]);

  // Memoize component definitions to prevent recreation on every render
  const Defs = useMemo(() => {
    const Component = () => (
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
    Component.displayName = 'GlitchDefs';
    return Component;
  }, [filterId, turbId, dispRedId, dispCyanId]);

  const Wrapper = useMemo(() => {
    const Component = ({ children }: PropsWithChildren) => (
      <g style={{ filter: `url(#${filterId})` }}>{children}</g>
    );
    Component.displayName = 'GlitchWrapper';
    return Component;
  }, [filterId]);

  return useMemo(() => ({ Defs, Wrapper }), [Defs, Wrapper]);
};
