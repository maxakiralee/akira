'use client';

import React from 'react';

interface ImageUploadButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  isCallActive: boolean;
}

const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ isOpen, onToggle, isCallActive }) => {
  const handleClick = () => {
    if (isCallActive) {
      onToggle();
    }
  };

  return (
    <div className="relative">
      <div
        onClick={handleClick}
        className={`
          w-16 h-16 rounded-full transition-all duration-200
          flex items-center justify-center
          ${!isCallActive 
            ? 'bg-slate-100/40 border border-slate-200 cursor-not-allowed opacity-50' 
            : isOpen 
              ? 'bg-blue-100 border-2 border-blue-400 scale-110 cursor-pointer' 
              : 'bg-slate-100/80 hover:bg-slate-200/80 border border-slate-300 cursor-pointer'
          }
          backdrop-blur-sm shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]
          ${isCallActive ? 'hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]' : ''}
        `}
        title={isCallActive ? "Upload Image" : "Start a call to upload images"}
      >
        {/* Image Upload Icon */}
        <svg 
          className={`w-8 h-8 ${isCallActive ? 'text-slate-600' : 'text-slate-400'}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    </div>
  );
};

export default ImageUploadButton; 