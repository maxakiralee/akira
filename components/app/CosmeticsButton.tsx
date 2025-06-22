'use client';

import React from 'react';

interface CosmeticsButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const CosmeticsButton: React.FC<CosmeticsButtonProps> = ({ isOpen, onToggle }) => {
  const handleClick = () => {
    onToggle();
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`
          w-16 h-16 rounded-full cursor-pointer transition-all duration-200
          flex items-center justify-center
          ${isOpen 
            ? 'bg-blue-100 border-2 border-blue-400 scale-110' 
            : 'bg-slate-100/80 hover:bg-slate-200/80 border border-slate-300'
          }
          backdrop-blur-sm shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]
          hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]
        `}
        title="Cosmetics"
      >
        {/* Hangar Icon */}
        <svg 
          className="w-8 h-8 text-slate-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 21h18M4 18h16V8a2 2 0 00-2-2H6a2 2 0 00-2 2v10zM8 18v-6h8v6M12 6V4M10 4h4" 
          />
        </svg>
      </div>
    </div>
  );
};

export default CosmeticsButton; 