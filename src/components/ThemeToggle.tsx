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
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-[#2E6B4E] ${
        isDark
          ? 'bg-[#232926] border-[#38423E] text-[#D3CBC0] hover:bg-[#2B3330]'
          : 'bg-[#FAF7F0] border-[#DDD3C2] text-[#4A4235] hover:bg-[#F2ECE0]'
      }`}
      aria-label={`Switch to ${isDark ? 'Warm Paper light mode' : 'Quiet Dark night mode'}`}
      title={isDark ? 'Switch to Warm Paper' : 'Switch to Quiet Dark'}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-[#D9A74A] transition-transform duration-300 group-hover:-rotate-12" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-[#A8382A] transition-transform duration-300 group-hover:rotate-45" />
        )}
      </div>

      <span className="font-mono text-[11px] uppercase tracking-wider select-none">
        {isDark ? 'Quiet Dark' : 'Warm Paper'}
      </span>

      {/* Tactile indicator slider */}
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isDark ? 'bg-[#D9A74A]' : 'bg-[#2E6B4E]'
        }`}
      />
    </button>
  );
};
