/**
 * Reverie | Your gentle memory companion
 * An analog planner & micro-novelty memory companion designed to slow down time perception.
 */

import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TopBar } from './components/TopBar';
import { JournalPage } from './components/JournalPage';
import { MicroNoveltyDeck } from './components/MicroNoveltyDeck';
import { ScrapbookArchive } from './components/ScrapbookArchive';
import { TimePerceptionAnalysis } from './components/TimePerceptionAnalysis';
import { SettingsAndBackup } from './components/SettingsAndBackup';
import { EveningNudgeModal } from './components/EveningNudgeModal';
import { NoiseOverlay } from './components/NoiseOverlay';

import { MemoryEntry, UserPreferences, MicroNovelty, NoveltyLog } from './types';
import { memoryStorage } from './utils/storage';
import { MICRO_NOVELTIES_CATALOG } from './data/microNoveltiesCatalog';
import { soundEngine } from './utils/soundEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings'>('journal');
  
  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(memoryStorage.getPreferences());
  const [noveltyLogs, setNoveltyLogs] = useState<NoveltyLog[]>([]);
  const [activeNovelty, setActiveNovelty] = useState<MicroNovelty>(MICRO_NOVELTIES_CATALOG[0]);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize data on mount
  useEffect(() => {
    const loadedEntries = memoryStorage.getEntries();
    setEntries(loadedEntries);

    const loadedLogs = memoryStorage.getNoveltyLogs();
    setNoveltyLogs(loadedLogs);

    const activeId = memoryStorage.getActiveNoveltyId();
    const found = MICRO_NOVELTIES_CATALOG.find(n => n.id === activeId);
    if (found) {
      setActiveNovelty(found);
    }

    const prefs = memoryStorage.getPreferences();
    setPreferences(prefs);
    if (prefs.ambientSound && prefs.ambientSound !== 'none') {
      soundEngine.setVolume(prefs.ambientVolume || 0.4);
    }
  }, []);

  // GSAP tab switch animation
  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0.7, y: 6 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const handleSaveEntry = (entry: MemoryEntry) => {
    const updated = memoryStorage.saveEntry(entry);
    setEntries(updated);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = memoryStorage.deleteEntry(id);
    setEntries(updated);
  };

  const handleSavePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = memoryStorage.savePreferences(newPrefs);
    setPreferences(updated);
  };

  const handleSelectActiveNovelty = (novelty: MicroNovelty) => {
    setActiveNovelty(novelty);
    memoryStorage.setActiveNoveltyId(novelty.id);
  };

  const handleNoveltyCompleted = (noveltyId: string) => {
    const updatedLogs = memoryStorage.logNoveltyCompleted(noveltyId);
    setNoveltyLogs(updatedLogs);
  };

  const handleToggleAmbience = () => {
    if (preferences.ambientSound === 'none') {
      const newSound = 'rain';
      soundEngine.playAmbience(newSound);
      handleSavePreferences({ ambientSound: newSound });
    } else {
      soundEngine.stop();
      handleSavePreferences({ ambientSound: 'none' });
    }
  };

  const handleDataImported = () => {
    setEntries(memoryStorage.getEntries());
    setPreferences(memoryStorage.getPreferences());
    setNoveltyLogs(memoryStorage.getNoveltyLogs());
  };

  const completedNoveltyIdsToday = noveltyLogs
    .filter(log => log.completedAt === todayStr)
    .map(log => log.noveltyId);

  const isTodayNoveltyCompleted = completedNoveltyIdsToday.includes(activeNovelty.id);

  return (
    <div className="min-h-screen bg-[#242B28] text-[#2C2926] relative flex flex-col font-sans selection:bg-[#EAE0CE] selection:text-[#1E3A8A]">
      
      {/* Global Tactile Noise Filter */}
      <NoiseOverlay />

      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          soundEngine.playPaperTurnSound();
          setActiveTab(tab);
        }}
        ambientSound={preferences.ambientSound}
        onToggleAmbience={handleToggleAmbience}
        onOpenQuickPrompt={() => setIsNudgeModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <main ref={contentRef} className="flex-1 pb-16 pt-4">
        {activeTab === 'journal' && (
          <JournalPage
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            entries={entries}
            onSaveEntry={handleSaveEntry}
            activeNovelty={activeNovelty}
            onNoveltyCompleted={handleNoveltyCompleted}
            isNoveltyCompletedToday={isTodayNoveltyCompleted}
            onJumpToNovelties={() => setActiveTab('novelties')}
          />
        )}

        {activeTab === 'novelties' && (
          <MicroNoveltyDeck
            activeNovelty={activeNovelty}
            onSelectActiveNovelty={handleSelectActiveNovelty}
            completedNoveltyIds={noveltyLogs.map(l => l.noveltyId)}
            onToggleComplete={handleNoveltyCompleted}
            onNavigateToJournal={() => {
              setSelectedDate(todayStr);
              setActiveTab('journal');
            }}
          />
        )}

        {activeTab === 'scrapbook' && (
          <ScrapbookArchive
            entries={entries}
            onSelectDateForJournal={(date) => {
              setSelectedDate(date);
              setActiveTab('journal');
            }}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeTab === 'timeflow' && (
          <TimePerceptionAnalysis
            entries={entries}
            noveltyLogs={noveltyLogs}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsAndBackup
            preferences={preferences}
            onSavePreferences={handleSavePreferences}
            entries={entries}
            onDataImported={handleDataImported}
          />
        )}
      </main>

      {/* Nightly Nudge Check-In Modal */}
      <EveningNudgeModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        onJumpToTodayJournal={() => {
          setSelectedDate(todayStr);
          setActiveTab('journal');
        }}
      />

      {/* Subtle Analog Footer Note */}
      <footer className="w-full text-center py-4 border-t border-[#343D38] text-[11px] text-[#86948C]">
        <span>Reverie • Designed for subjective temporal expansion & privacy • Zero live tracking</span>
      </footer>

    </div>
  );
}
