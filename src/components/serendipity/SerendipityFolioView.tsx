import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Shuffle, 
  BookOpen, 
  MapPin, 
  CloudSun, 
  Clock, 
  Zap, 
  Star, 
  Coffee, 
  Sparkle, 
  Sun,
  Compass,
  Calendar,
  Feather,
  ChevronRight,
  History,
  RotateCcw
} from 'lucide-react';
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import gsap from 'gsap';
import { MemoryEntry, MoodStamp, SensoryCue } from '../../types';
import { SENSORY_CUE_METADATA, TIME_PACING_METADATA } from '../../data/microNoveltiesCatalog';
import { soundEngine } from '../../utils/soundEngine';
import { hapticsEngine } from '../../utils/hapticsEngine';
import { parseLocalDate } from '../../utils/dateUtils';

interface SerendipityFolioViewProps {
  entries: MemoryEntry[];
  currentSelectedDate?: string;
  onSelectDateAndNavigateToJournal: (date: string) => void;
  onNavigateBack: () => void;
}

const STAMP_CONFIG: Record<MoodStamp, { label: string; icon: React.FC<{ className?: string }> }> = {
  CORE_MEMORY: { label: 'CORE MEMORY', icon: Zap },
  ROUTINE_BREAKER: { label: 'ROUTINE BREAKER', icon: Sparkles },
  MUNDANE_MAGIC: { label: 'MUNDANE MAGIC', icon: Star },
  QUIET_MOMENT: { label: 'QUIET MOMENT', icon: Coffee },
  SERENDIPITY: { label: 'SERENDIPITY', icon: Sparkle },
  GENTLE_DAY: { label: 'GENTLE DAY', icon: Sun }
};

export const SerendipityFolioView: React.FC<SerendipityFolioViewProps> = ({
  entries,
  onSelectDateAndNavigateToJournal,
  onNavigateBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const paperSheetRef = useRef<HTMLDivElement>(null);

  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);
  const [isFluttering, setIsFluttering] = useState<boolean>(false);
  const [hasTriggeredFirst, setHasTriggeredFirst] = useState(false);

  // Helper to pick an unpredictable random entry (avoiding the same one consecutively)
  const pickRandomEntry = (availableEntries: MemoryEntry[], avoidId?: string): MemoryEntry | null => {
    if (availableEntries.length === 0) return null;
    if (availableEntries.length === 1) return availableEntries[0];

    const pool = avoidId 
      ? availableEntries.filter(e => e.id !== avoidId) 
      : availableEntries;
    
    const candidatePool = pool.length > 0 ? pool : availableEntries;
    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    return candidatePool[randomIndex];
  };

  // Trigger tactile paper-flutter physics and select a new memory
  const triggerPageFlutter = (isInitial: boolean = false) => {
    if (entries.length === 0) return;

    setIsFluttering(true);
    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('flutter');

    if (paperSheetRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          const nextPick = pickRandomEntry(entries, selectedEntry?.id);
          setSelectedEntry(nextPick);
          setIsFluttering(false);

          gsap.fromTo(
            paperSheetRef.current,
            { scale: 0.97, rotateZ: -1.2, opacity: 0.8 },
            { scale: 1, rotateZ: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }
          );
        }
      });

      tl.to(paperSheetRef.current, {
        rotateY: isInitial ? -8 : -16,
        rotateZ: 1.5,
        scale: 0.96,
        opacity: 0.35,
        duration: 0.18,
        ease: 'power1.in'
      });
    } else {
      const nextPick = pickRandomEntry(entries, selectedEntry?.id);
      setSelectedEntry(nextPick);
      setIsFluttering(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!hasTriggeredFirst && entries.length > 0) {
      setHasTriggeredFirst(true);
      triggerPageFlutter(true);
    }
  }, [entries.length, hasTriggeredFirst]);

  // Keyboard shortcut (Escape to go back, Space/S to shuffle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNavigateBack();
      } else if (e.key === ' ' || e.key === 's' || e.key === 'S') {
        if (!isFluttering && entries.length > 1) {
          triggerPageFlutter();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entries.length, isFluttering, onNavigateBack]);

  // Compute time difference text
  const getTimeAgoText = (dateStr: string) => {
    try {
      const entryDate = parseLocalDate(dateStr);
      const now = new Date();
      const days = differenceInDays(now, entryDate);
      const months = differenceInMonths(now, entryDate);
      const years = differenceInYears(now, entryDate);

      if (days === 0) return 'Inscribed earlier today';
      if (days === 1) return 'Yesterday';
      if (days < 30) return `${days} days ago`;
      if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
      return `${years} year${years > 1 ? 's' : ''} ago (${days} days passed)`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
      
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#1E2723] text-[#423B30] dark:text-[#EAE5D9] hover:bg-[#EFE7D8] dark:hover:bg-[#28352F] text-xs font-semibold border border-[#D9CEBA] dark:border-[#384A40] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journal</span>
        </button>

        <div className="flex items-center gap-2">
          {entries.length > 1 && (
            <button
              type="button"
              onClick={() => triggerPageFlutter()}
              disabled={isFluttering}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#232F2A] hover:bg-[#EAE2D2] text-[#A8382A] dark:text-[#F08A7D] text-xs font-bold border border-[#D5C7B2] dark:border-[#384A40] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Shuffle className={`w-3.5 h-3.5 ${isFluttering ? 'animate-spin' : ''}`} />
              <span>Flip to Another Random Memory (Space)</span>
            </button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A] dark:text-[#F08A7D] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Serendipity Memory Folio</span>
          </span>
          <span className="text-xs text-[#827766]">•</span>
          <span className="text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
            Unpredictable Past Re-Surfacing Engine
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#FAF7F0] mt-1">
          Random Moments Reclaimed from Time
        </h1>
        <p className="text-xs sm:text-sm text-[#C5BBAA] mt-1 max-w-3xl">
          By confronting unexpected snapshots of your past rather than rigid chronological feeds, your brain links distant memories together—counteracting the adult illusion that time passes in an instant.
        </p>
      </div>

      {/* When no memories exist yet */}
      {entries.length === 0 ? (
        <div className="bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-2xl border border-[#D9CEBC] dark:border-[#384A40] p-10 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#F0E6D4] dark:bg-[#28352F] text-[#A8382A] dark:text-[#F08A7D] flex items-center justify-center mx-auto mb-4">
            <History className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-[#2C2926] dark:text-[#FAF7F0] mb-2">
            Your Memory Ledger Is Just Beginning
          </h3>
          <p className="text-xs text-[#6E6454] dark:text-[#A89E8F] mb-6 leading-relaxed">
            Inscribe your first core observation or micro-novelty in today’s journal. As your days accumulate, the Serendipity Engine will surprise you with rich moments you forgot occurred.
          </p>
          <button
            type="button"
            onClick={onNavigateBack}
            className="px-5 py-2.5 bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Inscribe Today's Page →
          </button>
        </div>
      ) : (
        /* The Physical Memory Folio Sheet */
        <div 
          ref={paperSheetRef}
          style={{ transformOrigin: 'left center' }}
          className="relative bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-2xl border border-[#D9CEBC] dark:border-[#384A40] p-6 sm:p-10 overflow-hidden"
        >
          {/* Top washi tape corner */}
          <div className="washi-tape washi-ochre absolute -top-3 left-10 w-36 h-6 flex items-center justify-center">
            <span className="text-[10px] font-mono font-bold text-[#4A320A] tracking-wider uppercase">
              ✦ SERENDIPITY FLIP
            </span>
          </div>

          {selectedEntry && (
            <>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
                  <Calendar className="w-4 h-4 text-[#A8382A] dark:text-[#F08A7D]" />
                  <span className="font-bold text-[#2C2926] dark:text-[#FAF7F0] text-sm sm:text-base">
                    {format(parseLocalDate(selectedEntry.date), 'EEEE, MMMM do, yyyy')}
                  </span>
                  <span className="text-[#867B6B]">•</span>
                  <span className="bg-[#EAE0CE] dark:bg-[#2C3831] px-2 py-0.5 rounded font-mono text-xs text-[#5D5344] dark:text-[#C5BBAE]">
                    {getTimeAgoText(selectedEntry.date)}
                  </span>
                </div>

                {selectedEntry.stamp && STAMP_CONFIG[selectedEntry.stamp] && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F2E8DC] dark:bg-[#2E201E] border border-[#E0D0BE] dark:border-[#42322E] rounded-full text-xs font-mono font-bold text-[#A8382A] dark:text-[#F08A7D]">
                    {React.createElement(STAMP_CONFIG[selectedEntry.stamp].icon, { className: 'w-3.5 h-3.5' })}
                    <span>{STAMP_CONFIG[selectedEntry.stamp].label}</span>
                  </div>
                )}
              </div>

              {/* Entry Title & Metadata */}
              <div className="mb-6">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24211E] dark:text-[#FAF7F0] tracking-tight mb-2">
                  {selectedEntry.title || 'Untitled Observation'}
                </h2>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
                  {selectedEntry.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2E6B4E] dark:text-[#5BA87E]" />
                      <span>{selectedEntry.location}</span>
                    </span>
                  )}
                  {selectedEntry.weather && (
                    <span className="flex items-center gap-1">
                      <CloudSun className="w-3.5 h-3.5 text-[#D9A74A]" />
                      <span className="capitalize">{selectedEntry.weather}</span>
                    </span>
                  )}
                  {selectedEntry.timePacing && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#1C355E] dark:text-[#88B2F8]" />
                      <span>{TIME_PACING_METADATA[selectedEntry.timePacing]?.label}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* College Ruled Handwritten Body */}
              <div className="mb-8">
                <div className="ruled-paper bg-[#FCFAF5] dark:bg-[#232F2A] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl p-6 sm:p-8 shadow-inner">
                  <p className="font-hand text-xl sm:text-2xl text-[#1E3A8A] dark:text-[#9EC0F4] leading-relaxed whitespace-pre-wrap">
                    {selectedEntry.body || 'No written thoughts recorded on this day.'}
                  </p>
                </div>
              </div>

              {/* Sensory Cues Tags & Daily Novelty Log Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {selectedEntry.sensoryCues && selectedEntry.sensoryCues.length > 0 && (
                  <div className="bg-[#F8F5EE] dark:bg-[#19221E] border border-[#E0D5C3] dark:border-[#2E3C34] p-4 rounded-xl">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2">
                      Sensory Anchors Inscribed
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.sensoryCues.map((cue: SensoryCue) => (
                        <span
                          key={cue}
                          className="text-xs px-2.5 py-1 bg-[#EAE1D1] dark:bg-[#2A3630] text-[#3D3529] dark:text-[#E2DBCF] rounded-lg font-medium border border-[#D5C9B6] dark:border-[#384A40]"
                        >
                          {SENSORY_CUE_METADATA[cue]?.icon} {cue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.microNovelty && (
                  <div className="bg-[#F8F5EE] dark:bg-[#19221E] border border-[#E0D5C3] dark:border-[#2E3C34] p-4 rounded-xl">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-1">
                      Routine-Breaker on This Day
                    </h4>
                    <div className="text-xs font-semibold text-[#2E6B4E] dark:text-[#5BA87E]">
                      {selectedEntry.microNovelty.title}
                    </div>
                    <p className="text-[11px] text-[#6E6454] dark:text-[#A89E8F] mt-0.5">
                      "{selectedEntry.microNovelty.tagline}"
                    </p>
                  </div>
                )}
              </div>

              {/* Primary Action Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#E3D8C6] dark:border-[#2C3831]">
                <button
                  type="button"
                  onClick={() => triggerPageFlutter()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F3] dark:bg-[#232F2A] hover:bg-[#EAE2D2] dark:hover:bg-[#2C3B34] text-[#423B30] dark:text-[#EAE5D9] text-xs sm:text-sm font-semibold border border-[#D5C7B2] dark:border-[#384A40] transition-colors cursor-pointer"
                >
                  <Shuffle className="w-4 h-4 text-[#A8382A] dark:text-[#F08A7D]" />
                  <span>Shuffle Another Memory</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectDateAndNavigateToJournal(selectedEntry.date)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Open This Exact Day in Journal ({format(parseLocalDate(selectedEntry.date), 'MMM d, yyyy')}) →</span>
                </button>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};
