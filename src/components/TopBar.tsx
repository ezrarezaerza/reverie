import React from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, Compass, Layers, Hourglass, Settings as SettingsIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { soundEngine } from '../utils/soundEngine';

interface TopBarProps {
  activeTab: 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings';
  setActiveTab: (tab: 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings') => void;
  ambientSound: string;
  onToggleAmbience: () => void;
  onOpenQuickPrompt: () => void;
  hasWrittenToday?: boolean;
  isNoveltyCompletedToday?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  ambientSound,
  onToggleAmbience,
  onOpenQuickPrompt,
  hasWrittenToday = true,
  isNoveltyCompletedToday = true
}) => {
  const navItems = [
    { id: 'journal' as const, label: 'Today', icon: BookOpen, hasDot: !hasWrittenToday, dotColor: 'bg-[#A8382A] dark:bg-[#F08A7D]', dotTitle: "Today's page is waiting for your pen" },
    { id: 'novelties' as const, label: 'Novelties', icon: Compass, hasDot: !isNoveltyCompletedToday, dotColor: 'bg-[#D97706] dark:bg-[#F59E0B]', dotTitle: "Today's micro-novelty has not been marked completed" },
    { id: 'scrapbook' as const, label: 'Scrapbook', icon: Layers },
    { id: 'timeflow' as const, label: 'Time Flow', icon: Hourglass },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F0] dark:bg-[#181E1B] border-b border-[#E3D9C6] dark:border-[#2B3530] px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 shadow-[0_2px_8px_rgba(30,25,20,0.04)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Zone 1: Brand title (single text element, no subtitle) */}
        <span 
          onClick={() => {
            soundEngine.playPaperTurnSound();
            setActiveTab('journal');
          }}
          className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#2B302C] dark:text-[#EAE3D5] cursor-pointer select-none shrink-0 hover:text-[#A8382A] dark:hover:text-[#E07A6D] transition-colors"
        >
          Reverie
        </span>

        {/* Zone 2: Navigation Links (Visible on desktop/tablet md+, converted to Bottom Bar on mobile) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundEngine.playPaperTurnSound();
                  setActiveTab(item.id);
                }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#2E6B4E] outline-none cursor-pointer ${
                  isActive
                    ? 'bg-[#EAE0CE] dark:bg-[#28332D] text-[#1E3A8A] dark:text-[#9EC0F4] shadow-inner font-semibold'
                    : 'text-[#5C5549] dark:text-[#C5BBAE] hover:text-[#1E2522] dark:hover:text-[#F0ECE1] hover:bg-[#F2ECE0] dark:hover:bg-[#222A26]'
                }`}
                title={item.hasDot ? item.dotTitle : undefined}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-[#1E3A8A] dark:text-[#9EC0F4]' : 'text-[#7D7362] dark:text-[#8E8373]'}`} />
                  {item.hasDot && (
                    <span 
                      className={`absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full ${item.dotColor} shadow-xs ring-1 ring-[#FAF7F0] dark:ring-[#181E1B] animate-pulse`} 
                    />
                  )}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Theme, Ambience, Nudge) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <ThemeToggle />

          <button
            onClick={onToggleAmbience}
            title={ambientSound === 'none' ? 'Play soothing rain ambience' : `Playing ${ambientSound} (click to mute)`}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#2E6B4E] outline-none cursor-pointer ${
              ambientSound !== 'none'
                ? 'bg-[#2E6B4E] text-[#FDFBF7] border-[#25563E]'
                : 'bg-[#F2ECE0] dark:bg-[#232B27] text-[#5C5549] dark:text-[#C5BBAE] border-[#D9CEBA] dark:border-[#38463F] hover:bg-[#EAE0CE] dark:hover:bg-[#2C3731]'
            }`}
          >
            {ambientSound !== 'none' ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{ambientSound !== 'none' ? 'Rain Ambience' : 'Ambience'}</span>
          </button>

          <button
            onClick={onOpenQuickPrompt}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#A8382A] hover:bg-[#912F23] text-[#FAF7F0] shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#A8382A] outline-none cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nudge</span>
          </button>
        </div>

      </div>
    </header>
  );
};
