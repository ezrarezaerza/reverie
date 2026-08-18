import React, { useState, useEffect, useRef } from 'react';
import { ModalPortal } from './ModalPortal';
import { 
  Sparkles, 
  X, 
  Shuffle, 
  BookOpen, 
  MapPin, 
  CloudSun, 
  Clock, 
  ArrowRight,
  Zap,
  Star,
  Coffee,
  Leaf,
  Sparkle,
  Sun
} from 'lucide-react';
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import gsap from 'gsap';
import { MemoryEntry, SensoryCue, MoodStamp } from '../types';
import { SENSORY_CUE_METADATA, TIME_PACING_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';
import { hapticsEngine } from '../utils/hapticsEngine';
import { parseLocalDate } from '../utils/dateUtils';

interface SerendipityMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MemoryEntry[];
  currentSelectedDate?: string;
  onSelectDate: (date: string) => void;
}

const STAMP_CONFIG: Record<MoodStamp, { label: string; icon: React.FC<{ className?: string }> }> = {
  CORE_MEMORY: { label: 'CORE MEMORY', icon: Zap },
  ROUTINE_BREAKER: { label: 'ROUTINE BREAKER', icon: Sparkles },
  MUNDANE_MAGIC: { label: 'MUNDANE MAGIC', icon: Star },
  QUIET_MOMENT: { label: 'QUIET MOMENT', icon: Coffee },
  SERENDIPITY: { label: 'SERENDIPITY', icon: Sparkle },
  GENTLE_DAY: { label: 'GENTLE DAY', icon: Sun }
};

export const SerendipityMemoryModal: React.FC<SerendipityMemoryModalProps> = ({
  isOpen,
  onClose,
  entries,
  onSelectDate
}) => {
  const [selectedEntry, setSelectedEntry] = useState<MemoryEntry | null>(null);
  const [isFluttering, setIsFluttering] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const paperSheetRef = useRef<HTMLDivElement>(null);

  // Helper to pick an unpredictable random entry (preferably different from current)
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

  // Trigger the page-flutter animation and pick a new memory
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
            { scale: 0.96, rotateZ: -1.5, opacity: 0.8 },
            { scale: 1, rotateZ: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
          );
        }
      });

      tl.to(paperSheetRef.current, {
        rotateY: isInitial ? -10 : -18,
        rotateZ: 2,
        scale: 0.95,
        opacity: 0.4,
        duration: 0.18,
        ease: 'power1.in'
      })
      .to(paperSheetRef.current, {
        rotateY: 8,
        rotateZ: -2,
        scale: 0.97,
        opacity: 0.6,
        duration: 0.14,
        ease: 'power1.out'
      });
    } else {
      const nextPick = pickRandomEntry(entries, selectedEntry?.id);
      setSelectedEntry(nextPick);
      setIsFluttering(false);
    }
  };

  // Initialize upon opening and lock background scrolling
  useEffect(() => {
    if (isOpen) {
      const initialEntry = pickRandomEntry(entries, undefined);
      setSelectedEntry(initialEntry);
      setIsFluttering(false);

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (modalRef.current && backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.92, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    soundEngine.playPaperTurnSound();
    if (modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 15,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Compute time distance relative to present
  const getTimeDistanceLabel = (dateStr: string) => {
    try {
      const entryDate = parseLocalDate(dateStr);
      const today = new Date();
      const diffDays = differenceInDays(today, entryDate);

      if (diffDays === 0) return 'Inscribed earlier today';
      if (diffDays === 1) return 'Yesterday evening';
      if (diffDays < 30) return `${diffDays} days ago`;
      
      const diffMonths = differenceInMonths(today, entryDate);
      if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
      
      const diffYears = differenceInYears(today, entryDate);
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago (${format(entryDate, 'yyyy')})`;
    } catch {
      return 'Archived memory';
    }
  };

  const currentStamp = selectedEntry?.moodStamp || 'ROUTINE_BREAKER';
  const StampIcon = STAMP_CONFIG[currentStamp]?.icon || Sparkles;
  const entryDateObj = selectedEntry ? parseLocalDate(selectedEntry.date) : new Date();

  // Render modal with true viewport-centered positioning
  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop overlay */}
        <div 
          ref={backdropRef}
          className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          onClick={handleClose}
        />

        {/* Main Centered Modal Window */}
        <div 
          ref={modalRef}
          className="relative w-full max-w-2xl bg-[#232A26] rounded-2xl border border-[#3E4D45] shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[82vh] z-10 animate-in fade-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
        
        {/* Top Header Bar (Fixed at top of modal) */}
        <div className="flex items-center justify-between px-4 sm:px-5 pt-4 pb-3 border-b border-[#35433B] shrink-0 bg-[#232A26]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-[#2E3C34] text-[#D9A74A] border border-[#485B51] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-[#FAF7F0]">
                  The Serendipity Engine
                </h3>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#3D4C43] text-[#D4C8B6]">
                  FOLIO
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#A89E8F]">
                Pages flutter open at random to break linear time perception
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-[#A89E8F] hover:text-[#FAF7F0] hover:bg-[#313E37] rounded-lg transition-colors cursor-pointer shrink-0"
            title="Close modal"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area with matching analog scrollbar */}
        <div className="p-3.5 sm:p-5 space-y-3.5 flex-1 overflow-y-auto analog-scrollbar">
          
          {/* Empty Archive State */}
          {!selectedEntry ? (
            <div className="p-8 text-center bg-[#1B221E] rounded-xl border border-[#33423A] space-y-3">
              <BookOpen className="w-8 h-8 text-[#A89E8F] mx-auto opacity-50" />
              <h4 className="font-display font-bold text-[#FAF7F0] text-base">Your Scrapbook is Waiting</h4>
              <p className="text-xs text-[#A89E8F] max-w-sm mx-auto">
                Once you record your first memory entry, the serendipity engine will allow you to flutter back through unpredictable moments in time.
              </p>
            </div>
          ) : (
            /* Selected Memory Analog Paper Card */
            <div 
              ref={paperSheetRef}
              className="relative bg-[#FAF8F2] dark:bg-[#1E2522] rounded-xl p-4 sm:p-6 border border-[#D9CEBA] dark:border-[#38463F] shadow-lg transition-all"
              style={{
                backgroundImage: 'radial-gradient(#E8DFC8 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              {/* Paper Left Red Margin Accent */}
              <div className="absolute top-0 bottom-0 left-3 sm:left-5 w-[2px] bg-[#E78F81] dark:bg-[#B05B50] opacity-70 pointer-events-none" />

              {/* Time Distance Badge & Date Header */}
              <div className="pl-3 sm:pl-5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#E5DAC8] dark:border-[#2C3831]">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display lowercase font-bold text-base sm:text-xl text-[#2E4A3D] dark:text-[#6CB28E]">
                      {format(entryDateObj, 'EEEE')}
                    </span>
                    <span className="font-display lowercase text-xs sm:text-base text-[#A8382A] dark:text-[#F08A7D]">
                      {format(entryDateObj, 'MMMM d, yyyy')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-semibold bg-[#EAE0CE] dark:bg-[#2A3630] text-[#554936] dark:text-[#D5CCC0] border border-[#DDD0BC] dark:border-[#3E4F46] shrink-0">
                    {getTimeDistanceLabel(selectedEntry.date)}
                  </span>
                </div>

                {/* Metadata Row: Weather, Location & Pacing */}
                <div className="flex flex-wrap items-center gap-2.5 text-[11px] sm:text-xs text-[#6B6152] dark:text-[#A89E8F] font-mono">
                  {selectedEntry.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#A8382A]" />
                      <span>{selectedEntry.location}</span>
                    </span>
                  )}
                  {selectedEntry.weather && (
                    <span className="flex items-center gap-1">
                      <CloudSun className="w-3 h-3 text-[#D9A74A]" />
                      <span>{selectedEntry.weather}</span>
                    </span>
                  )}
                  {selectedEntry.timePacing && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#2E6B4E]" />
                      <span className="capitalize">{TIME_PACING_METADATA[selectedEntry.timePacing]?.label}</span>
                    </span>
                  )}
                </div>

                {/* Entry Title */}
                <h4 className="font-hand font-bold text-lg sm:text-2xl text-[#1C355E] dark:text-[#9EC0F4] leading-snug pt-1">
                  {selectedEntry.title}
                </h4>

                {/* Entry Body */}
                <p className="font-hand text-base sm:text-xl text-[#2C2926] dark:text-[#FAF7F0] leading-relaxed whitespace-pre-wrap pt-0.5">
                  {selectedEntry.body}
                </p>

                {/* Linked Routine Novelty (if present) */}
                {selectedEntry.linkedNoveltyTitle && (
                  <div className="mt-2.5 p-2 rounded-lg bg-[#F0E8DA] dark:bg-[#28332E] border border-[#DDD0BC] dark:border-[#38463F] text-xs space-y-0.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#8C3A27] dark:text-[#F08A7D]">
                      Linked Routine Interruption:
                    </span>
                    <p className="font-semibold text-[#2C2926] dark:text-[#EAE5D9]">
                      {selectedEntry.linkedNoveltyTitle}
                    </p>
                  </div>
                )}

                {/* Sensory Anchors */}
                {selectedEntry.sensoryCues && selectedEntry.sensoryCues.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#E5DAC8] dark:border-[#2C3831]">
                    <span className="text-[10px] uppercase font-mono font-bold text-[#7A6F5E] dark:text-[#A89E8F] mr-1">
                      Sensory Anchors:
                    </span>
                    {selectedEntry.sensoryCues.map((cue: SensoryCue) => (
                      <span
                        key={cue}
                        className="px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-[#E8DFCF] dark:bg-[#2B3831] text-[#3D3528] dark:text-[#FAF7F0] border border-[#D5C9B4] dark:border-[#38463F]"
                      >
                        {SENSORY_CUE_METADATA[cue]?.icon} {SENSORY_CUE_METADATA[cue]?.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Rubber Stamp Watermark */}
                <div className="flex justify-end pt-2">
                  <div className={currentStamp === 'CORE_MEMORY' || currentStamp === 'ROUTINE_BREAKER' ? 'rubber-stamp flex items-center gap-1.5' : 'rubber-stamp-green flex items-center gap-1.5'}>
                    <StampIcon className="w-3.5 h-3.5 inline-block shrink-0" />
                    <span>{STAMP_CONFIG[currentStamp]?.label || currentStamp.replace('_', ' ')}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Pinned Bottom Action Footer */}
        <div className="p-3 sm:p-4 bg-[#1C231F] border-t border-[#35433B] shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => triggerPageFlutter(false)}
            disabled={entries.length <= 1 || isFluttering}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              entries.length <= 1 || isFluttering
                ? 'opacity-50 cursor-not-allowed bg-[#28322D] text-[#A89E8F] border-[#38463F]'
                : 'bg-[#2E3C34] hover:bg-[#394B41] active:scale-95 text-[#FAF7F0] border-[#485B51] shadow-xs'
            }`}
            title="Let the journal flutter to another random memory"
          >
            <Shuffle className={`w-3.5 h-3.5 text-[#D9A74A] ${isFluttering ? 'animate-spin' : ''}`} />
            <span>{isFluttering ? 'Fluttering Pages...' : 'Rifle to Another Random Memory'}</span>
          </button>

          {selectedEntry && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playPaperTurnSound();
                onSelectDate(selectedEntry.date);
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#2E6B4E] hover:bg-[#24563E] active:scale-95 text-[#FAF7F0] text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Open in Today's Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
    </ModalPortal>
  );
};
