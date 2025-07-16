'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { SPACING_SIZES, STORED_DATA_NAME } from './constants';

type Size = keyof typeof SPACING_SIZES;

type SizeProviderState = {
  size: Size;
  setSize: (size: Size) => void;
};

const initialState: SizeProviderState = {
  size: 'normal',
  setSize: () => null,
};

const SizeProviderContext = createContext<SizeProviderState>(initialState);

export function SpacingProvider({ children }: { children: React.ReactNode }) {
  const [size, setSize] = useState<Size>('normal');

  // On mount, read the stored size from localStorage
  useEffect(() => {
    const storedSize = localStorage.getItem(STORED_DATA_NAME) as Size | null;
    if (storedSize && SPACING_SIZES[size]) {
      setSize(storedSize);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the size changes, update the CSS variable and localStorage
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--spacing', SPACING_SIZES[size].value);
    localStorage.setItem(STORED_DATA_NAME, size);
  }, [size]);

  const value = useMemo(() => ({ size, setSize }), [size]);

  return (
    <SizeProviderContext.Provider value={value}>
      {children}
    </SizeProviderContext.Provider>
  );
}

// Custom hook for easy access to the size context
export const useSize = () => {
  const context = useContext(SizeProviderContext);
  if (context === undefined) {
    throw new Error('useSize must be used within a SizeProvider');
  }
  return context;
};