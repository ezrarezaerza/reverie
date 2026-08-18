import React from 'react';
import { BookOpen, Compass, Layers, Hourglass, Settings as SettingsIcon } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface BottomNavBarProps {
  activeTab: 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings';
  setActiveTab: (tab: 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings') => void;
  hasWrittenToday?: boolean;
  isNoveltyCompletedToday?: boolean;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  setActiveTab,
  hasWrittenToday = true,
  isNoveltyCompletedToday = true
}) => {
  const navItems = [
    { id: 'journal' as const, label: 'Today', icon: BookOpen, hasDot: !hasWrittenToday, dotColor: 'bg-[#A8382A] dark:bg-[#F08A7D]' },
    { id: 'novelties' as const, label: 'Novelties', icon: Compass, hasDot: !isNoveltyCompletedToday, dotColor: 'bg-[#D97706] dark:bg-[#F59E0B]' },
    { id: 'scrapbook' as const, label: 'Scrapbook', icon: Layers },
    { id: 'timeflow' as const, label: 'Time Flow', icon: Hourglass },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav 
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#FAF7F0] dark:bg-[#181E1B] border-t border-[#E3D9C6] dark:border-[#2B3530] px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-colors duration-200"
    >
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                soundEngine.playPaperTurnSound();
                setActiveTab(item.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all select-none cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2E6B4E] outline-none ${
                isActive
                  ? 'bg-[#EAE0CE] dark:bg-[#28332D] text-[#1E3A8A] dark:text-[#9EC0F4]'
                  : 'text-[#695F4F] dark:text-[#A89E8F] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] hover:bg-[#F2ECE0] dark:hover:bg-[#202724]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-4 h-4 mb-0.5 transition-transform ${
                    isActive 
                      ? 'text-[#1E3A8A] dark:text-[#9EC0F4] scale-110 stroke-[2.2]' 
                      : 'text-[#7D7362] dark:text-[#8E8373] stroke-[1.8]'
                  }`} 
                />
                {item.hasDot && (
                  <span 
                    className={`absolute -top-0.5 -right-1 w-1.5 h-1.5 rounded-full ${item.dotColor} ring-1 ring-[#FAF7F0] dark:ring-[#181E1B] animate-pulse`} 
                  />
                )}
              </div>
              <span className={`text-[10px] tracking-tight leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
