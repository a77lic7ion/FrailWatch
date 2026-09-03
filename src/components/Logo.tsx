import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-8 h-8', size }) => {
  const style = size ? { width: size, height: size } : undefined;
  return (
    <img
      src="/logoelderwatch.png"
      alt="ElderWatch Logo"
      className={`shrink-0 ${className}`}
      style={style}
      draggable={false}
    />
  );
};
