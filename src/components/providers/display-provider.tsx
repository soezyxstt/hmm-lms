'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { STORED_DATA_NAME, FONT_FAMILIES, FONT_SIZES, SPACING_SIZES } from './constants';

type Spacing = keyof typeof SPACING_SIZES;
type FontSize = keyof typeof FONT_SIZES;
type FontFamily = keyof typeof FONT_FAMILIES;

type ThemeSettings = {
  spacing: Spacing;
  fontSize: FontSize;
  fontFamily: FontFamily;
};

type ThemeProviderState = {
  spacing: Spacing;
  setSpacing: (spacing: Spacing) => void;
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
  fontFamily: FontFamily;
  setFontFamily: (fontFamily: FontFamily) => void;
};

// --- INITIAL STATE ---

const initialState: ThemeProviderState = {
  spacing: 'normal',
  setSpacing: () => null,
  fontSize: 'medium',
  setFontSize: () => null,
  fontFamily: 'geist',
  setFontFamily: () => null,
};

// --- CONTEXT ---

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// --- PROVIDER ---

export function DisplaySettingProvider({ children }: { children: React.ReactNode }) {
  // State for each theme property
  const [spacing, setSpacing] = useState<Spacing>('normal');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [fontFamily, setFontFamily] = useState<FontFamily>('geist');

  // On mount, read all stored settings from localStorage
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(STORED_DATA_NAME);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings) as Partial<ThemeSettings>;

        if (parsedSettings.spacing && SPACING_SIZES[parsedSettings.spacing]) {
          setSpacing(parsedSettings.spacing);
        }
        if (parsedSettings.fontSize && FONT_SIZES[parsedSettings.fontSize]) {
          setFontSize(parsedSettings.fontSize);
        }
        if (parsedSettings.fontFamily && FONT_FAMILIES[parsedSettings.fontFamily]) {
          setFontFamily(parsedSettings.fontFamily);
        }
      }
    } catch (error) {
      console.error("Failed to parse theme settings from localStorage", error);
    }
  }, []);

  // Effect to update CSS variables and localStorage when any setting changes
  useEffect(() => {
    const root = document.documentElement;

    // console.log('--- Running Settings Effect ---');
    // console.log('Current state for "spacing":', spacing);
    // console.log('Is SPACING_SIZES object available?', SPACING_SIZES);
    // console.log('The lookup result for SPACING_SIZES[spacing] is:', SPACING_SIZES[spacing]);

    // Update CSS variables
    root.style.setProperty('--spacing', SPACING_SIZES[spacing].value);
    root.style.fontSize = `${FONT_SIZES[fontSize].value}px`
    root.style.setProperty('--default-font', `var(${FONT_FAMILIES[fontFamily].value})`);

    // Update localStorage with all current settings
    const settingsToStore: ThemeSettings = { spacing, fontSize, fontFamily };
    localStorage.setItem(STORED_DATA_NAME, JSON.stringify(settingsToStore));

  }, [spacing, fontSize, fontFamily]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    spacing,
    setSpacing,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
  }), [spacing, fontSize, fontFamily]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useDisplaySetting = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error('useDisplaySetting must be used within a DisplaySettingProvider');
  }
  return context;
};