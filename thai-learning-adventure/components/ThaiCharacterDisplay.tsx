
import React from 'react';

interface ThaiCharacterDisplayProps {
  character: string;
  className?: string;
  size?: 'normal' | 'large';
}

const ThaiCharacterDisplay: React.FC<ThaiCharacterDisplayProps> = ({ character, className = '', size = 'normal' }) => {
  const sizeClasses = {
    normal: 'text-6xl sm:text-7xl md:text-8xl',
    large: 'text-7xl sm:text-8xl md:text-9xl'
  }
  return (
    <div 
      className={`font-bold text-sky-600 my-3 sm:my-4 p-3 sm:p-4 bg-white rounded-xl shadow-lg inline-block break-all ${sizeClasses[size]} ${className}`}
      style={{ lineHeight: '1.2' }} // Ensure tall characters fit well
    >
      {character}
    </div>
  );
};

export default ThaiCharacterDisplay;