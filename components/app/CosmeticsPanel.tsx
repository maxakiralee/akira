'use client';

import React from 'react';
import { useRobot } from './RobotContext';

interface CosmeticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CosmeticsPanel: React.FC<CosmeticsPanelProps> = ({ isOpen, onClose }) => {
  const { appearance, updateBodyColor } = useRobot();
  
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const bodyColors = [
    '#E1A3A3', // Soft Pink/Red (top left)
    '#A3C7E1', // Soft Blue (top middle left)
    '#E1C7E1', // Soft Light Pink (top middle right)
    '#E1E1A3', // Soft Yellow (top right)
    '#C7A3E1', // Soft Purple (bottom left)
    '#A3E1C7', // Soft Mint Green (bottom middle left)
    '#C7E1A3', // Soft Light Green (bottom middle right)
    '#A3A3E1', // Soft Light Blue/Purple (bottom right)
  ];

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-slate-100/90 backdrop-blur-md rounded-3xl p-8 shadow-[16px_16px_32px_rgba(0,0,0,0.1),-16px_-16px_32px_rgba(255,255,255,0.8)] max-w-md w-full ml-8 mr-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-slate-700">Cosmetics</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300/80 flex items-center justify-center transition-all duration-200 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Hat Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center mr-3 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700">Hat</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-slate-200/60 rounded-2xl border border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-300/60 transition-all duration-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="aspect-square bg-slate-200/60 rounded-2xl border border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-300/60 transition-all duration-200 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div>
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 flex items-center justify-center mr-3 shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.8)]">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-700">Body</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {bodyColors.map((color, index) => (
              <div
                key={index}
                onClick={() => updateBodyColor(color)}
                className={`
                  aspect-square rounded-2xl cursor-pointer transition-all duration-200
                  shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.8)]
                  hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.9)]
                  hover:scale-105
                  ${appearance.bodyColor === color 
                    ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-100/90 scale-105' 
                    : ''
                  }
                `}
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmeticsPanel; 