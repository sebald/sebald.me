// Props
// ---------------
export interface XComIconProps {
  size?: number | string;
  fill?: 'current' | 'brand';
}

// Component
// ---------------
export const XComIcon = ({ size = 24, fill = 'current' }: XComIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 251 256"
  >
    <path
      fill={fill === 'current' ? 'currentColor' : '#000'}
      d="M149.079 108.399L242.33 0h-22.098l-80.97 94.12L74.59 0H0l97.796 142.327L0 256h22.1l85.507-99.395L175.905 256h74.59L149.073 108.399h.006zM118.81 143.58l-9.909-14.172-78.84-112.773h33.943l63.625 91.011 9.909 14.173 82.705 118.3H186.3l-67.49-96.533v-.006z"
    />
  </svg>
);
