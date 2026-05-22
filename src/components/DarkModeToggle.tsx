/**
 * DarkModeToggle - Sun/moon theme toggle switch
 * Persists preference to localStorage and applies 'dark' class to document.
 */
import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/stores/useUIStore';

export default function DarkModeToggle() {
  const { theme, toggleTheme, initTheme } = useUIStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-white/10"
      aria-label="Toggle dark mode"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-gray-600" />
      ) : (
        <Sun size={20} className="text-yellow-400" />
      )}
    </button>
  );
}
