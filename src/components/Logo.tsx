import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-8 h-8', size }) => {
  return (
    <svg 
      viewBox="0 0 512 512" 
      className={`shrink-0 ${className}`} 
      style={size ? { width: size, height: size } : undefined}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FrailCare Check-in Logo"
    >
      <defs>
        <filter id="logo-drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.16" />
        </filter>
      </defs>

      {/* Chimney on roof right */}
      <path 
        d="M370 140V76C370 69.37 375.37 64 382 64H426C432.63 64 438 69.37 438 76V200L370 140Z" 
        fill="#0c6970"
      />

      {/* Home Frame */}
      <path 
        d="M256 36L48 214C37 223.4 43.6 242 58 242H88V434C88 456.09 105.91 474 128 474H384C406.09 474 424 456.09 424 434V242H454C468.4 242 475 223.4 464 214L256 36Z" 
        fill="#0c6970" 
        stroke="#085258" 
        strokeWidth="10" 
        strokeLinejoin="round"
      />

      {/* Inner Wall Solid Teal */}
      <path 
        d="M256 80L98 216V424C98 439.46 110.54 452 126 452H386C401.46 452 414 439.46 414 424V216L256 80Z" 
        fill="#0f766e" 
      />

      {/* Coral Heart */}
      <path 
        d="M256 405C256 405 120 324 120 236C120 188 158 152 204 152C232 152 248 166 256 177C264 166 280 152 308 152C354 152 392 188 392 236C392 324 256 405 256 405Z" 
        fill="#ff6b6b" 
        filter="url(#logo-drop-shadow)"
      />

      {/* Center White Disc Badge */}
      <circle cx="256" cy="275" r="70" fill="#ffffff" filter="url(#logo-drop-shadow)" />

      {/* Bright Green Checkmark */}
      <path 
        d="M214 274L244 306L304 240" 
        stroke="#10b981" 
        strokeWidth="24" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none"
      />
    </svg>
  );
};
