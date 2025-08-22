import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const el = document.documentElement;
    el.classList.remove('theme-dark', 'theme-light');
    el.classList.add(newTheme === 'light' ? 'theme-light' : 'theme-dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 glass rounded-lg hover:frost-subtle transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 stroke-1" />
      ) : (
        <Moon className="w-4 h-4 stroke-1" />
      )}
    </button>
  );
}