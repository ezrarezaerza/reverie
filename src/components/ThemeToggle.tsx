import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export type ThemeMode = 'warm-paper' | 'quiet-dark';

interface ThemeToggleProps {
  initialTheme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'reverie_active_theme';

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  initialTheme = 'warm-paper',
  onThemeChange,
}) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved === 'warm-paper' || saved === 'quiet-dark') {
        return saved;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'quiet-dark';
      }
    }
    return initialTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'quiet-dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'quiet-dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'warm-paper');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  const toggleTheme = () => {
    soundEngine.playPencilScratchSound();
    setTheme((prev) => (prev === 'warm-paper' ? 'quiet-dark' : 'warm-paper'));
  };

  const isDark = theme === 'quiet-dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-full border text-xs font-medium transition-all shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer ${
        isDark
          ? 'bg-[#1F2723] border-[#35433B] text-[#D8D1C5] hover:bg-[#28332D]'
          : 'bg-[#FAF7F0] border-[#DDD3C2] text-[#4A4235] hover:bg-[#F2ECE0]'
      }`}
      aria-label={`Switch to ${isDark ? 'Warm Paper light mode' : 'Quiet Dark night mode'}`}
      title={isDark ? 'Switch to Warm Paper' : 'Switch to Quiet Dark'}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 text-[#DEAC5D] transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-[#A8382A] transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>

      {/* Text label hidden on mobile, visible on sm: screens and above */}
      <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider select-none font-semibold">
        {isDark ? 'Quiet Dark' : 'Warm Paper'}
      </span>

      {/* Tactile indicator dot hidden on mobile */}
      <span
        className={`hidden sm:inline-block w-1.5 h-1.5 rounded-full transition-colors ${
          isDark ? 'bg-[#DEAC5D]' : 'bg-[#2E6B4E]'
        }`}
      />
    </button>
  );
};
