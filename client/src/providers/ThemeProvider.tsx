import React, { createContext, useContext, useEffect } from 'react';
import { useTheme } from '@/ui-v2/hooks/useTheme';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggle: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggle, set } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme: set }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};