/**
 * Reverie | Your gentle memory companion
 * An analog planner & micro-novelty memory companion designed to slow down time perception.
 */

import React, { useState, useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { JournalPage } from './components/JournalPage';
import { MicroNoveltyDeck } from './components/MicroNoveltyDeck';
import { NoveltyDossierView } from './components/novelties/NoveltyDossierView';
import { NoveltyWorkshopView } from './components/novelties/NoveltyWorkshopView';
import { SerendipityFolioView } from './components/serendipity/SerendipityFolioView';
import { TwilightDeskView } from './components/nudge/TwilightDeskView';
import { ScrapbookArchive } from './components/ScrapbookArchive';
import { TimePerceptionAnalysis } from './components/TimePerceptionAnalysis';
import { SettingsAndBackup } from './components/SettingsAndBackup';
import { EveningNudgeModal } from './components/EveningNudgeModal';
import { NoiseOverlay } from './components/NoiseOverlay';
import { PageTransitionWrapper } from './components/transitions/PageTransitionWrapper';

import { MemoryEntry, UserPreferences, MicroNovelty, NoveltyLog } from './types';
import { memoryStorage } from './utils/storage';
import { MICRO_NOVELTIES_CATALOG } from './data/microNoveltiesCatalog';
import { getDailyPrompt } from './lib/prompt-engine';
import { soundEngine } from './utils/soundEngine';
import { getLocalDateString, parseLocalDate } from './utils/dateUtils';
import { useAppNavigation } from './hooks/useAppNavigation';

export default function App() {
  const {
    activeTab,
    currentView,
    selectedId,
    promptIndex,
    refPromptText,
    navigateToTab,
    navigateToNoveltyDossier,
    navigateToNoveltyWorkshop,
    navigateToSerendipity,
    navigateToEveningNudge,
    navigateBack,
    closeSubView
  } = useAppNavigation();

  // Today's date string YYYY-MM-DD in local time
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(memoryStorage.getPreferences());
  const [noveltyLogs, setNoveltyLogs] = useState<NoveltyLog[]>([]);
  const [customNovelties, setCustomNovelties] = useState<MicroNovelty[]>([]);
  const [activeNovelty, setActiveNovelty] = useState<MicroNovelty>(MICRO_NOVELTIES_CATALOG[0]);
  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState(false);
  const [activeReflectionPromptIndex, setActiveReflectionPromptIndex] = useState(0);
  const [nudgePromptTextToInscribe, setNudgePromptTextToInscribe] = useState<string | undefined>(undefined);

  // Initialize data on mount
  useEffect(() => {
    const loadedEntries = memoryStorage.getEntries();
    setEntries(loadedEntries);

    // Scrub any stale/empty draft artifacts
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('reverie_draft_')) {
            const raw = localStorage.getItem(key);
            if (raw) {
              const draft = JSON.parse(raw);
              if (!draft || (!draft.title?.trim() && !draft.body?.trim())) {
                localStorage.removeItem(key);
              }
            }
          }
        }
      } catch {
        // ignore parsing issues
      }
    }

    const loadedLogs = memoryStorage.getNoveltyLogs();
    setNoveltyLogs(loadedLogs);

    const loadedCustom = memoryStorage.getCustomNovelties();
    setCustomNovelties(loadedCustom);

    const activeId = memoryStorage.getActiveNoveltyId();
    const allAvailable = [...loadedCustom, ...MICRO_NOVELTIES_CATALOG];
    const found = allAvailable.find(n => n.id === activeId);
    if (found) {
      setActiveNovelty(found);
    }

    const prefs = memoryStorage.getPreferences();
    setPreferences(prefs);
    if (prefs.ambientSound && prefs.ambientSound !== 'none') {
      soundEngine.setVolume(prefs.ambientVolume || 0.4);
    }
  }, [todayStr]);

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

  const handleSaveCustomNovelty = (novelty: MicroNovelty, setAsActiveToday?: boolean) => {
    const updated = memoryStorage.saveCustomNovelty(novelty);
    setCustomNovelties(updated);
    if (setAsActiveToday) {
      handleSelectActiveNovelty(novelty);
    }
  };

  const handleDeleteCustomNovelty = (noveltyId: string) => {
    const updated = memoryStorage.deleteCustomNovelty(noveltyId);
    setCustomNovelties(updated);
    if (activeNovelty?.id === noveltyId) {
      const fallback = MICRO_NOVELTIES_CATALOG[0];
      handleSelectActiveNovelty(fallback);
    }
  };

  const handleNoveltyCompleted = (noveltyId: string, forDate?: string) => {
    const updatedLogs = memoryStorage.toggleNoveltyCompleted(noveltyId, forDate || selectedDate);
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
    setCustomNovelties(memoryStorage.getCustomNovelties());
  };

  const handleNavigateToJournalWithNovelty = (novelty: MicroNovelty) => {
    handleSelectActiveNovelty(novelty);
    setSelectedDate(todayStr);
    navigateToTab('journal');
  };

  const handleInscribeTwilightPrompt = (promptIdx: number, promptText: string) => {
    setSelectedDate(todayStr);
    setActiveReflectionPromptIndex(promptIdx);
    setNudgePromptTextToInscribe(promptText);
    navigateToTab('journal');
  };

  const handleSelectSerendipityDate = (date: string) => {
    setSelectedDate(date);
    navigateToTab('journal');
  };

  const selectedDateObj = parseLocalDate(selectedDate);
  const selectedDateDailyPrompt = getDailyPrompt(selectedDateObj);
  const currentGoalId = activeNovelty?.id || selectedDateDailyPrompt.novelty.id;

  const completedNoveltyIdsForSelectedDate = noveltyLogs
    .filter(log => log.completedAt === selectedDate)
    .map(log => log.noveltyId);

  const isSelectedDateNoveltyCompleted = completedNoveltyIdsForSelectedDate.includes(currentGoalId);

  const hasWrittenToday = entries.some(
    (e) => e.date === todayStr && ((e.body && e.body.trim().length > 0) || (e.title && e.title.trim().length > 0))
  );

  const todayDailyPrompt = getDailyPrompt(parseLocalDate(todayStr));
  const todayGoalId = activeNovelty?.id || todayDailyPrompt.novelty.id;
  const completedNoveltyIdsForToday = noveltyLogs
    .filter(log => log.completedAt === todayStr)
    .map(log => log.noveltyId);
  const isTodayNoveltyCompleted = completedNoveltyIdsForToday.includes(todayGoalId);

  const transitionKey = `${activeTab}_${currentView}_${selectedId || ''}`;

  return (
    <div className="min-h-screen bg-[#2E3632] dark:bg-[#121614] text-[#2C2926] dark:text-[#EAE5D9] relative flex flex-col font-sans selection:bg-[#EAE0CE] selection:text-[#1E3A8A] transition-colors duration-200">
      
      {/* Global Tactile Noise Filter */}
      <NoiseOverlay />

      {/* Top Bar Navigation (Strict 3-zone contract) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          navigateToTab(tab);
        }}
        ambientSound={preferences.ambientSound}
        onToggleAmbience={handleToggleAmbience}
        onOpenQuickPrompt={() => navigateToEveningNudge()}
        hasWrittenToday={hasWrittenToday}
        isNoveltyCompletedToday={isTodayNoveltyCompleted}
      />

      {/* Main Content Workspace with Tactile Page Transition Engine */}
      <main className="flex-1 pb-24 md:pb-16 pt-3 sm:pt-4">
        <PageTransitionWrapper 
          transitionKey={transitionKey}
          variant={currentView !== 'none' ? 'folioSlide' : 'pageFlip'}
        >
          
          {/* SUB-ROUTE VIEW: Dedicated Micro-Novelty Field Card Dossier */}
          {currentView === 'dossier' && (
            <NoveltyDossierView
              noveltyId={selectedId || activeNovelty.id}
              customNovelties={customNovelties}
              activeNovelty={activeNovelty}
              completedNoveltyIds={noveltyLogs.map(l => l.noveltyId)}
              onSelectActiveNovelty={handleSelectActiveNovelty}
              onToggleComplete={handleNoveltyCompleted}
              onNavigateBack={() => closeSubView('novelties')}
              onNavigateToWorkshop={(novId) => navigateToNoveltyWorkshop(novId)}
              onNavigateToJournalWithNovelty={handleNavigateToJournalWithNovelty}
              onNavigateToDossierId={(novId) => navigateToNoveltyDossier(novId)}
            />
          )}

          {/* SUB-ROUTE VIEW: Dedicated Alchemist's Novelty Workshop */}
          {currentView === 'workshop' && (
            <NoveltyWorkshopView
              editingNoveltyId={selectedId}
              customNovelties={customNovelties}
              onSaveNovelty={handleSaveCustomNovelty}
              onDeleteNovelty={handleDeleteCustomNovelty}
              onNavigateBack={() => closeSubView('novelties')}
              onNavigateToDossier={(novId) => navigateToNoveltyDossier(novId)}
            />
          )}

          {/* SUB-ROUTE VIEW: Dedicated Serendipity Memory Folio */}
          {currentView === 'serendipity' && (
            <SerendipityFolioView
              entries={entries}
              currentSelectedDate={selectedDate}
              onSelectDateAndNavigateToJournal={handleSelectSerendipityDate}
              onNavigateBack={() => closeSubView('journal')}
            />
          )}

          {/* SUB-ROUTE VIEW: Dedicated Twilight Reflection Desk */}
          {currentView === 'nudge' && (
            <TwilightDeskView
              hasWrittenToday={hasWrittenToday}
              onInscribePromptToJournal={handleInscribeTwilightPrompt}
              onNavigateBack={() => closeSubView('journal')}
              initialPromptIndex={promptIndex || 0}
            />
          )}

          {/* MAIN TOP-LEVEL TAB VIEWS (when no sub-route view is active) */}
          {currentView === 'none' && (
            <>
              {activeTab === 'journal' && (
                <JournalPage
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  entries={entries}
                  onSaveEntry={handleSaveEntry}
                  activeNovelty={activeNovelty}
                  onNoveltyCompleted={(id) => handleNoveltyCompleted(id, selectedDate)}
                  isNoveltyCompletedToday={isSelectedDateNoveltyCompleted}
                  onJumpToNovelties={() => navigateToTab('novelties')}
                  onOpenNoveltyDossier={(novId) => navigateToNoveltyDossier(novId)}
                  onOpenSerendipityFolio={() => navigateToSerendipity()}
                  onOpenTwilightDesk={() => navigateToEveningNudge()}
                  activeReflectionPromptIndex={activeReflectionPromptIndex}
                  nudgePromptTextToInscribe={nudgePromptTextToInscribe}
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
                    navigateToTab('journal');
                  }}
                  customNovelties={customNovelties}
                  onDeleteCustomNovelty={handleDeleteCustomNovelty}
                  onOpenDossier={(novId) => navigateToNoveltyDossier(novId)}
                  onOpenWorkshop={(novId) => navigateToNoveltyWorkshop(novId)}
                />
              )}

              {activeTab === 'scrapbook' && (
                <ScrapbookArchive
                  entries={entries}
                  onSelectDateForJournal={(date) => {
                    setSelectedDate(date);
                    navigateToTab('journal');
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
            </>
          )}
        </PageTransitionWrapper>
      </main>

      {/* Quick Modal fallback for inline check-ins */}
      <EveningNudgeModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        hasWrittenToday={hasWrittenToday}
        onJumpToTodayJournal={(pIndex, pText) => {
          handleInscribeTwilightPrompt(pIndex, pText);
        }}
      />

      {/* Subtle Analog Footer Note (Hidden on mobile to avoid overlap with bottom nav) */}
      <footer className="hidden md:block w-full text-center py-4 border-t border-[#343D38] text-[11px] text-[#86948C]">
        <span>Reverie • Designed for subjective temporal expansion & privacy • Zero live tracking</span>
      </footer>

      {/* Mobile Bottom Navigation Bar (<768px viewports) */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          navigateToTab(tab);
        }}
        hasWrittenToday={hasWrittenToday}
        isNoveltyCompletedToday={isTodayNoveltyCompleted}
      />

    </div>
  );
}
