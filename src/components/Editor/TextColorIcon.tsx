import React from 'react';

interface TextColorIconProps {
  className?: string;
  color?: string | null;
}

const TextColorIcon: React.FC<TextColorIconProps> = ({ className, color }) => {
  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <span className="font-semibold text-lg leading-none">A</span>
      <div 
        className="w-full h-0.5 mt-0.5"
        style={{ backgroundColor: color || '#000000' }} 
      />
    </div>
  );
};

export default TextColorIcon; 