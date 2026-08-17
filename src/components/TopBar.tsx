import React from 'react';
import { Volume2, VolumeX, Sparkles, BookOpen, Compass, Layers, Hourglass, Settings as SettingsIcon } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface TopBarProps {
  activeTab: 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings';
  setActiveTab: (tab: 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings') => void;
  ambientSound: string;
  onToggleAmbience: () => void;
  onOpenQuickPrompt: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  ambientSound,
  onToggleAmbience,
  onOpenQuickPrompt
}) => {
  const navItems = [
    { id: 'journal' as const, label: 'Today', icon: BookOpen },
    { id: 'novelties' as const, label: 'Novelties', icon: Compass },
    { id: 'scrapbook' as const, label: 'Scrapbook', icon: Layers },
    { id: 'timeflow' as const, label: 'Time Flow', icon: Hourglass },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F0] border-b border-[#E3D9C6] px-4 md:px-8 py-3 shadow-[0_2px_8px_rgba(30,25,20,0.04)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand title (single text element, no subtitle) */}
        <span 
          onClick={() => setActiveTab('journal')}
          className="font-display text-2xl font-bold tracking-tight text-[#2B302C] cursor-pointer select-none shrink-0 hover:text-[#A8382A] transition-colors"
        >
          Reverie
        </span>

        {/* Zone 2: Navigation Links (1-2 word labels, single line) */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#2E6B4E] outline-none ${
                  isActive
                    ? 'bg-[#EAE0CE] text-[#1E3A8A] shadow-inner font-semibold'
                    : 'text-[#5C5549] hover:text-[#1E2522] hover:bg-[#F2ECE0]'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-[#1E3A8A]' : 'text-[#7D7362]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <button
            onClick={onToggleAmbience}
            title={ambientSound === 'none' ? 'Play soothing rain ambience' : `Playing ${ambientSound} (click to mute)`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#2E6B4E] outline-none ${
              ambientSound !== 'none'
                ? 'bg-[#2E6B4E] text-[#FDFBF7] border-[#25563E]'
                : 'bg-[#F2ECE0] text-[#5C5549] border-[#D9CEBA] hover:bg-[#EAE0CE]'
            }`}
          >
            {ambientSound !== 'none' ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{ambientSound !== 'none' ? 'Rain Ambience' : 'Ambience'}</span>
          </button>

          <button
            onClick={onOpenQuickPrompt}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#A8382A] hover:bg-[#912F23] text-[#FAF7F0] shadow-sm transition-all whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-[#A8382A] outline-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nudge</span>
          </button>
        </div>

      </div>
    </header>
  );
};
