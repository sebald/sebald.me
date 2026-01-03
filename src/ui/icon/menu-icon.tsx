import { useEffect, useRef } from 'react';

import { cn } from '@/lib/styles.utils';

/**
 * Animates the icon with a subtle pop effect when the popup opens or closes.
 * Uses the Web Animations API for precise control over timing and easing,
 * and to trigger animations based on popup state changes.
 */
const usePopupAnimation = () => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;

    const triggerElement = svg.parentElement;
    if (!triggerElement) return;

    const observer = new MutationObserver(() => {
      svg.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.4)' },
          { transform: 'scale(1)' },
        ],
        {
          duration: 500,
          easing: 'cubic-bezier(0.87, 0, 0.13, 1)',
          fill: 'forwards',
        },
      );
    });

    observer.observe(triggerElement, {
      attributes: true,
      attributeFilter: ['data-popup-open'],
    });

    return () => observer.disconnect();
  }, []);

  return ref;
};

// Props
// ---------------
export interface MenuIconProps {
  size?: number;
}

// Component
// ---------------
export const MenuIcon = ({ size = 16 }: MenuIconProps) => {
  const ref = usePopupAnimation();

  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      height={size}
      width={size}
    >
      <line
        x1="40"
        y1="64"
        x2="216"
        y2="64"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        className={cn(
          'transform-fill origin-center transition-all duration-300 ease-in-out',
          'in-data-popup-open:translate-y-16 in-data-popup-open:rotate-45',
        )}
      />
      <line
        x1="40"
        y1="128"
        x2="216"
        y2="128"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        className={cn(
          'transform-fill origin-center transition-all duration-300 ease-in-out',
          'in-data-popup-open:opacity-0',
        )}
      />
      <line
        x1="40"
        y1="192"
        x2="216"
        y2="192"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        className={cn(
          'transform-fill origin-center transition-all duration-300 ease-in-out',
          'in-data-popup-open:-translate-y-16 in-data-popup-open:-rotate-45',
        )}
      />
    </svg>
  );
};
