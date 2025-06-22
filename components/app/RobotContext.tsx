'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RobotAppearance {
  bodyColor: string;
  hasHat: boolean;
}

interface RobotContextType {
  appearance: RobotAppearance;
  updateBodyColor: (color: string) => void;
  toggleHat: () => void;
}

const RobotContext = createContext<RobotContextType | undefined>(undefined);

export function RobotProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<RobotAppearance>({
    bodyColor: '#E1A3A3', // Default soft pink/red color
    hasHat: false, // Default no hat
  });

  const updateBodyColor = (color: string) => {
    setAppearance(prev => ({
      ...prev,
      bodyColor: color
    }));
  };

  const toggleHat = () => {
    setAppearance(prev => ({
      ...prev,
      hasHat: !prev.hasHat
    }));
  };

  return (
    <RobotContext.Provider value={{
      appearance,
      updateBodyColor,
      toggleHat
    }}>
      {children}
    </RobotContext.Provider>
  );
}

export function useRobot() {
  const context = useContext(RobotContext);
  if (context === undefined) {
    throw new Error('useRobot must be used within a RobotProvider');
  }
  return context;
} 