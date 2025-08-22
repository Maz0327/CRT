import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/ui-v2/hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="glass rounded-full p-2 transition hover:bg-white/10"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      data-testid="theme-toggle"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
};