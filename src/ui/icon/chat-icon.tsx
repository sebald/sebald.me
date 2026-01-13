interface ChatIconProps {
  size?: number | string;
}

export const ChatIcon: React.FC<ChatIconProps> = ({ size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={size}
      height={size}
    >
      <path
        d="M71.58,144,32,176V48a8,8,0,0,1,8-8H168a8,8,0,0,1,8,8v88a8,8,0,0,1-8,8Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        className="transition-transform duration-300 ease-out group-hover:-translate-x-2 group-hover:-translate-y-2"
      />
      <path
        d="M80,144v40a8,8,0,0,0,8,8h96.42L224,224V96a8,8,0,0,0-8-8H176"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
        className="transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:translate-y-1"
      />
    </svg>
  );
};
