"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemoMode: false,
  toggleDemoMode: () => {},
});

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize from localStorage safely
  useEffect(() => {
    const stored = localStorage.getItem('yieldiq_demo_mode');
    if (stored === 'true') setIsDemoMode(true);
  }, []);

  const toggleDemoMode = () => {
    setIsDemoMode(prev => {
      const newState = !prev;
      localStorage.setItem('yieldiq_demo_mode', newState.toString());
      return newState;
    });
  };

  return (
    <DemoContext.Provider value={{ isDemoMode, toggleDemoMode }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemoMode = () => useContext(DemoContext);
