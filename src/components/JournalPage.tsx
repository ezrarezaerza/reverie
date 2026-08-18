import React, { useState, useEffect, useRef } from 'react';
import { 
  Feather, 
  MapPin, 
  CloudSun, 
  CheckCircle2, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle,
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
  Zap,
  Star,
  Coffee,
  Leaf,
  Sparkle,
  Sun,
  Clock,
  Info,
  Mic,
  MicOff,
  Radio
} from 'lucide-react';
import { format } from 'date-fns';
import gsap from 'gsap';
import { MemoryEntry, MicroNovelty, SensoryCue, TimePacing, MoodStamp } from '../types';
import { SENSORY_CUE_METADATA, TIME_PACING_METADATA } from '../data/microNoveltiesCatalog';
import { EVENING_REFLECTION_PROMPTS } from '../data/reflectionPromptsCatalog';
import { getDailyPrompt } from '../lib/prompt-engine';
import { calculateNewStreak } from '../lib/streak-logic';
import { soundEngine } from '../utils/soundEngine';
import { getLocalDateString, parseLocalDate, shiftDateString, formatDisplayDate } from '../utils/dateUtils';
import { AnalogDatePicker } from './AnalogDatePicker';
import { useVoiceDictation } from '../hooks/useVoiceDictation';
import { hapticsEngine } from '../utils/hapticsEngine';
import { SerendipityMemoryModal } from './SerendipityMemoryModal';
import { VintageRibbonBookmark } from './VintageRibbonBookmark';

interface JournalPageProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  entries: MemoryEntry[];
  onSaveEntry: (entry: Partial<MemoryEntry>) => void;
  activeNovelty?: MicroNovelty | null;
  onNoveltyCompleted: (noveltyId: string) => void;
  isNoveltyCompletedToday: boolean;
  onJumpToNovelties: () => void;
  onOpenNoveltyDossier?: (noveltyId: string) => void;
  onOpenSerendipityFolio?: () => void;
  onOpenTwilightDesk?: () => void;
  activeReflectionPromptIndex?: number;
  nudgePromptTextToInscribe?: string | null;
}

const STAMP_CONFIG: Record<MoodStamp, { label: string; icon: React.FC<{ className?: string }> }> = {
  ROUTINE_BREAKER: { label: 'ROUTINE BREAKER', icon: Zap },
  CORE_MEMORY: { label: 'CORE MEMORY', icon: Star },
  MUNDANE_MAGIC: { label: 'MUNDANE MAGIC', icon: Coffee },
  QUIET_MOMENT: { label: 'QUIET MOMENT', icon: Leaf },
  SERENDIPITY: { label: 'SERENDIPITY', icon: Sparkle },
  GENTLE_DAY: { label: 'GENTLE DAY', icon: Sun },
};

export const JournalPage: React.FC<JournalPageProps> = ({
  selectedDate,
  setSelectedDate,
  entries,
  onSaveEntry,
  activeNovelty,
  onNoveltyCompleted,
  isNoveltyCompletedToday,
  onJumpToNovelties,
  onOpenNoveltyDossier,
  onOpenSerendipityFolio,
  onOpenTwilightDesk,
  activeReflectionPromptIndex = 0,
  nudgePromptTextToInscribe = null,
}) => {
  const currentEntry = entries.find(e => e.date === selectedDate);

  const [title, setTitle] = useState(currentEntry?.title || '');
  const [body, setBody] = useState(currentEntry?.body || '');
  const [location, setLocation] = useState(currentEntry?.location || '');
  const [weather, setWeather] = useState(currentEntry?.weather || '');
  const [sensoryCues, setSensoryCues] = useState<SensoryCue[]>(currentEntry?.sensoryCues || []);
  const [timePacing, setTimePacing] = useState<TimePacing>(currentEntry?.timePacing || 'EXPANDED_FLOW');
  const [moodStamp, setMoodStamp] = useState<MoodStamp>(currentEntry?.moodStamp || 'GENTLE_DAY');
  const [isFavorite, setIsFavorite] = useState(currentEntry?.isFavorite || false);
  const [inkColor, setInkColor] = useState<'blue' | 'black' | 'sepia'>('blue');
  const [paperStyle, setPaperStyle] = useState<'ruled' | 'grid' | 'dot'>('ruled');
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Collapsible Inspirations section (Focus Canvas mode)
  const [isDailyCollapsed, setIsDailyCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('reverie_daily_collapsed') === 'true';
    }
    return false;
  });

  const toggleDailyCollapse = () => {
    soundEngine.playPaperTurnSound();
    setIsDailyCollapsed(prev => {
      const nextVal = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('reverie_daily_collapsed', String(nextVal));
      }
      return nextVal;
    });
  };

  const [currentPromptIndex, setCurrentPromptIndex] = useState<number>(() => {
    return activeReflectionPromptIndex % EVENING_REFLECTION_PROMPTS.length;
  });

  const paperRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [voiceErrorDismissed, setVoiceErrorDismissed] = useState<boolean>(false);
  const [isSerendipityOpen, setIsSerendipityOpen] = useState<boolean>(false);

  // Auto-resize title textarea to avoid cutting off or obscuring wrapped lines on mobile
  const adjustTitleHeight = () => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = 'auto';
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  };

  // Web Speech API Voice Dictation Hook
  const {
    isListening,
    isSupported: isVoiceSupported,
    interimTranscript,
    error: voiceError,
    toggleListening,
    stopListening
  } = useVoiceDictation({
    onTranscript: (chunk, isFinal) => {
      if (isFinal && chunk.trim()) {
        setBody(prev => {
          const textarea = textareaRef.current;
          if (textarea && document.activeElement === textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const before = prev.substring(0, start);
            const after = prev.substring(end);
            const prefix = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : '';
            const suffix = after.length > 0 && !after.startsWith(' ') && !after.startsWith('\n') ? ' ' : '';
            const newText = `${before}${prefix}${chunk.trim()}${suffix}${after}`;
            
            setTimeout(() => {
              if (textareaRef.current) {
                const newPos = start + prefix.length + chunk.trim().length;
                textareaRef.current.selectionStart = newPos;
                textareaRef.current.selectionEnd = newPos;
              }
            }, 0);
            return newText;
          }

          const trimmed = prev.trimEnd();
          const sep = trimmed.length > 0 ? (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?') ? ' ' : ' ') : '';
          return `${trimmed}${sep}${chunk.trim()}`;
        });
      }
    }
  });

  useEffect(() => {
    adjustTitleHeight();
  }, [title, selectedDate]);

  useEffect(() => {
    window.addEventListener('resize', adjustTitleHeight);
    return () => window.removeEventListener('resize', adjustTitleHeight);
  }, []);

  // Update prompt index if prop changes from Nudge modal
  useEffect(() => {
    if (activeReflectionPromptIndex !== undefined) {
      setCurrentPromptIndex(activeReflectionPromptIndex % EVENING_REFLECTION_PROMPTS.length);
    }
  }, [activeReflectionPromptIndex]);

  // If a nudge prompt was selected from the modal, inscribe its prompt into body if empty
  useEffect(() => {
    if (nudgePromptTextToInscribe) {
      setBody(prev => {
        if (prev.includes(nudgePromptTextToInscribe)) return prev;
        const prefix = prev.trim().length > 0 ? `${prev}\n\n` : '';
        return `${prefix}— Prompt: "${nudgePromptTextToInscribe}"\n`;
      });
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [nudgePromptTextToInscribe]);

  // Target active novelty
  const dateObj = parseLocalDate(selectedDate);
  const offlineDailyPrompt = getDailyPrompt(dateObj);
  const displayedNovelty = activeNovelty || offlineDailyPrompt.novelty;
  const currentNoveltyId = displayedNovelty.id;

  // Calculate Streak
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastRecordedDate = sortedEntries.length > 0 ? parseLocalDate(sortedEntries[0].date) : null;
  const streakCalc = calculateNewStreak(
    lastRecordedDate,
    new Date(),
    sortedEntries.length > 0 ? Math.max(1, sortedEntries.length) : 0,
    false
  );

  // Draft tracking state & loaded date ref
  const [lastDraftTime, setLastDraftTime] = useState<string | null>(null);
  const activeDateRef = useRef(selectedDate);

  // Check if current form inputs differ from saved entry
  const hasUnsavedChanges = Boolean(
    (title.trim() !== (currentEntry?.title || '').trim()) ||
    (body.trim() !== (currentEntry?.body || '').trim()) ||
    (location.trim() !== (currentEntry?.location || '').trim()) ||
    (weather.trim() !== (currentEntry?.weather || '').trim())
  );

  // Draft marker shows up immediately as soon as any content is being inscribed or changed
  const hasDraft = Boolean(
    hasUnsavedChanges && (title.trim().length > 0 || body.trim().length > 0 || location.trim().length > 0 || weather.trim().length > 0)
  );

  // Auto-save draft locally on change
  useEffect(() => {
    if (activeDateRef.current === selectedDate && hasDraft) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastDraftTime(now);
      try {
        localStorage.setItem(`reverie_draft_${selectedDate}`, JSON.stringify({
          title,
          body,
          location,
          weather,
          sensoryCues,
          timePacing,
          moodStamp,
          savedAt: now
        }));
      } catch (e) {
        // ignore storage quota issues
      }
    }
  }, [title, body, location, weather, sensoryCues, timePacing, moodStamp, selectedDate, hasDraft]);

  // Sync state when selectedDate changes or entry is loaded - always prioritizing saved entries
  useEffect(() => {
    activeDateRef.current = selectedDate;
    const entry = entries.find(e => e.date === selectedDate);
    const draftKey = `reverie_draft_${selectedDate}`;
    const draftJson = localStorage.getItem(draftKey);
    
    // If a saved entry already exists, ALWAYS load the saved entry!
    if (entry) {
      setTitle(entry.title || '');
      setBody(entry.body || '');
      setLocation(entry.location || '');
      setWeather(entry.weather || '');
      setSensoryCues(entry.sensoryCues || []);
      setTimePacing(entry.timePacing || 'EXPANDED_FLOW');
      setMoodStamp(entry.moodStamp || 'GENTLE_DAY');
      setIsFavorite(entry.isFavorite || false);
      setLastDraftTime(null);
      
      // Clean up any empty or stale draft for this date
      if (draftJson) {
        try {
          const draft = JSON.parse(draftJson);
          if (!draft || (!draft.title?.trim() && !draft.body?.trim())) {
            localStorage.removeItem(draftKey);
          }
        } catch {
          localStorage.removeItem(draftKey);
        }
      }
      return;
    }

    // If no saved entry exists, check if there is an existing non-empty draft
    if (draftJson) {
      try {
        const draft = JSON.parse(draftJson);
        if (draft && (draft.title?.trim() || draft.body?.trim())) {
          setTitle(draft.title || '');
          setBody(draft.body || '');
          setLocation(draft.location || '');
          setWeather(draft.weather || '');
          setSensoryCues(draft.sensoryCues || []);
          setTimePacing(draft.timePacing || 'EXPANDED_FLOW');
          setMoodStamp(draft.moodStamp || 'GENTLE_DAY');
          setLastDraftTime(draft.savedAt || 'recently');
          setIsFavorite(false);
          return;
        } else {
          localStorage.removeItem(draftKey);
        }
      } catch (e) {
        localStorage.removeItem(draftKey);
      }
    }

    // Otherwise, clean blank state
    setTitle('');
    setBody('');
    setLocation('');
    setWeather('');
    setSensoryCues([]);
    setTimePacing('EXPANDED_FLOW');
    setMoodStamp('GENTLE_DAY');
    setIsFavorite(false);
    setLastDraftTime(null);
  }, [selectedDate, entries]);

  const handleDiscardDraft = () => {
    soundEngine.playPaperTurnSound();
    localStorage.removeItem(`reverie_draft_${selectedDate}`);
    const entry = entries.find(e => e.date === selectedDate);
    if (entry) {
      setTitle(entry.title || '');
      setBody(entry.body || '');
      setLocation(entry.location || '');
      setWeather(entry.weather || '');
      setSensoryCues(entry.sensoryCues || []);
      setTimePacing(entry.timePacing || 'EXPANDED_FLOW');
      setMoodStamp(entry.moodStamp || 'GENTLE_DAY');
      setIsFavorite(entry.isFavorite || false);
    } else {
      setTitle('');
      setBody('');
      setLocation('');
      setWeather('');
      setSensoryCues([]);
      setTimePacing('EXPANDED_FLOW');
      setMoodStamp('GENTLE_DAY');
      setIsFavorite(false);
    }
    setLastDraftTime(null);
  };

  // GSAP Page Flip Animation on date change
  useEffect(() => {
    if (paperRef.current) {
      gsap.fromTo(
        paperRef.current,
        { opacity: 0.9, y: 5 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      );
    }
  }, [selectedDate]);

  const handleDateChange = (offsetDays: number) => {
    soundEngine.playPaperTurnSound();
    const newDateStr = shiftDateString(selectedDate, offsetDays);
    setSelectedDate(newDateStr);
  };

  const toggleSensoryCue = (cue: SensoryCue) => {
    soundEngine.playPencilScratchSound();
    setSensoryCues(prev => 
      prev.includes(cue) ? prev.filter(c => c !== cue) : [...prev, cue]
    );
  };

  const handlePromptShuffle = () => {
    soundEngine.playPaperTurnSound();
    setCurrentPromptIndex(prev => (prev + 1) % EVENING_REFLECTION_PROMPTS.length);
  };

  const handleSave = () => {
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('stamp');

    if (saveBtnRef.current) {
      gsap.to(saveBtnRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });
    }

    const calculatedWordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

    onSaveEntry({
      id: currentEntry?.id,
      date: selectedDate,
      title: title.trim(),
      body,
      location,
      weather,
      sensoryCues,
      timePacing,
      moodStamp,
      isFavorite,
      linkedNoveltyId: currentNoveltyId,
      linkedNoveltyTitle: displayedNovelty.title,
      reflectionPrompt: EVENING_REFLECTION_PROMPTS[currentPromptIndex].promptText,
      wordCount: calculatedWordCount
    });

    localStorage.removeItem(`reverie_draft_${selectedDate}`);
    setLastDraftTime(null);

    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2400);
  };

  const todayStr = getLocalDateString();
  const isToday = selectedDate === todayStr;

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const getInkClass = () => {
    if (inkColor === 'black') return 'text-[#1F1E1C] dark:text-[#F0ECE1]';
    if (inkColor === 'sepia') return 'text-[#4A321E] dark:text-[#E2C799]';
    return 'ballpoint-ink';
  };

  const getPaperBgClass = () => {
    if (paperStyle === 'grid') return 'grid-paper';
    if (paperStyle === 'dot') return 'dot-paper';
    return 'ruled-paper';
  };

  const StampIcon = STAMP_CONFIG[moodStamp]?.icon || Sun;

  return (
    <div className="w-full max-w-5xl mx-auto py-2 sm:py-4 px-2.5 sm:px-6">
      
      {/* Planner Action Toolbar: Rhythmic, Symmetrical, and Balanced */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mb-4 sm:mb-5">
        
        {/* Left: Date Capsule with Next/Prev and Date Picker */}
        <div className="flex items-center justify-between sm:justify-start gap-1 bg-[#FAF7F0] dark:bg-[#1B2320] border border-[#DDD3C1] dark:border-[#33423A] rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleDateChange(-1)}
            className="p-1.5 rounded-lg hover:bg-[#EFE7D8] dark:hover:bg-[#27322D] text-[#554E42] dark:text-[#C5BBAE] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer shrink-0"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <AnalogDatePicker
            selectedDate={selectedDate}
            onSelectDate={(newDate) => setSelectedDate(newDate)}
            activeDates={entries.map((e) => e.date)}
            labelFormat="full"
            showTodayBadge={true}
            variant="bare"
            className="flex-1 text-center"
          />

          <button
            type="button"
            onClick={() => handleDateChange(1)}
            className="p-1.5 rounded-lg hover:bg-[#EFE7D8] dark:hover:bg-[#27322D] text-[#554E42] dark:text-[#C5BBAE] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer shrink-0"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playPaperTurnSound();
                setSelectedDate(todayStr);
              }}
              className="text-[11px] font-semibold px-2 py-1 text-[#665D4F] dark:text-[#C5BBAE] hover:text-[#1E2522] dark:hover:text-[#FAF7F0] bg-[#EFE7D8] dark:bg-[#28322D] rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
              title="Jump to Today's date"
            >
              Today
            </button>
          )}

          {/* Serendipity: Random Memory Trigger */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playPaperTurnSound();
              if (onOpenSerendipityFolio) {
                onOpenSerendipityFolio();
              } else {
                setIsSerendipityOpen(true);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-[#EFE7D8] dark:hover:bg-[#27322D] text-[#8C7F6E] hover:text-[#D97706] dark:text-[#A89E8F] dark:hover:text-[#F3C465] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer shrink-0 ml-0.5"
            title="Serendipity: Let the journal flutter open to a random past memory"
            aria-label="Open a random past memory"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Streak & Paper / Ink Tools */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          
          {/* Animated Flame & 4 Days Streak */}
          <div className="flex items-center gap-1.5 bg-[#FAF7F0] dark:bg-[#1F2320] border border-[#DDD3C1] dark:border-[#3A332C] px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#8C3A27] dark:text-[#F08A7D] shadow-2xs shrink-0">
            <Flame className="w-3.5 h-3.5 text-[#A8382A] dark:text-[#F08A7D] fill-[#A8382A] dark:fill-[#F08A7D] animate-flame shrink-0" />
            <span>{streakCalc.currentStreak} Days Streak</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Paper Type Switcher */}
            <div className="flex items-center bg-[#FAF7F0] dark:bg-[#1B2320] border border-[#DDD3C1] dark:border-[#33423A] p-0.5 rounded-xl text-xs">
              {(['ruled', 'grid', 'dot'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => { setPaperStyle(p); soundEngine.playPencilScratchSound(); }}
                  className={`px-2 py-1 rounded-lg capitalize font-medium transition-all cursor-pointer ${
                    paperStyle === p 
                      ? 'bg-[#EAE0CE] dark:bg-[#28352F] text-[#1E3A8A] dark:text-[#A5C4F7] font-semibold' 
                      : 'text-[#7D7362] dark:text-[#9C9283] hover:text-[#2C2926] dark:hover:text-[#FAF7F0]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Ink Color Switcher */}
            <div className="flex items-center bg-[#FAF7F0] dark:bg-[#1B2320] border border-[#DDD3C1] dark:border-[#33423A] p-1.5 rounded-xl gap-1.5">
              <button
                type="button"
                onClick={() => setInkColor('blue')}
                className={`w-4 h-4 rounded-full bg-[#1C355E] dark:bg-[#9EC0F4] border border-[#DDD3C1] dark:border-[#4B5E55] transition-transform cursor-pointer ${inkColor === 'blue' ? 'scale-110 ring-2 ring-[#1C355E] dark:ring-[#9EC0F4] ring-offset-1 dark:ring-offset-[#1B2320]' : 'opacity-70'}`}
                title="Ballpoint Blue Ink"
                aria-label="Ballpoint Blue Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor('black')}
                className={`w-4 h-4 rounded-full bg-[#202020] dark:bg-[#F0ECE1] border border-[#DDD3C1] dark:border-[#4B5E55] transition-transform cursor-pointer ${inkColor === 'black' ? 'scale-110 ring-2 ring-[#202020] dark:ring-[#F0ECE1] ring-offset-1 dark:ring-offset-[#1B2320]' : 'opacity-70'}`}
                title="Charcoal Black Ink"
                aria-label="Charcoal Black Ink"
              />
              <button
                type="button"
                onClick={() => setInkColor('sepia')}
                className={`w-4 h-4 rounded-full bg-[#593E2B] dark:bg-[#E2C799] border border-[#DDD3C1] dark:border-[#4B5E55] transition-transform cursor-pointer ${inkColor === 'sepia' ? 'scale-110 ring-2 ring-[#593E2B] dark:ring-[#E2C799] ring-offset-1 dark:ring-offset-[#1B2320]' : 'opacity-70'}`}
                title="Faded Sepia Ink"
                aria-label="Faded Sepia Ink"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Main Analog Notebook Spread */}
      <div 
        ref={paperRef}
        className={`relative ${getPaperBgClass()} paper-shadow-lifted rounded-xl sm:rounded-2xl border border-[#D8CDBC] dark:border-[#33423A] pt-7 sm:pt-9 md:pt-10 px-4 sm:px-7 md:px-10 pb-5 sm:pb-8 transition-all`}
      >
        {/* Vintage Silk Ribbon Bookmark & In-Progress Draft Marker */}
        <VintageRibbonBookmark
          isBookmarked={isFavorite}
          onToggleBookmark={() => {
            const nextFav = !isFavorite;
            setIsFavorite(nextFav);
            onSaveEntry({
              id: currentEntry?.id,
              date: selectedDate,
              title: title.trim(),
              body,
              location,
              weather,
              sensoryCues,
              timePacing,
              moodStamp,
              isFavorite: nextFav,
              linkedNoveltyId: currentNoveltyId,
              linkedNoveltyTitle: displayedNovelty.title,
              reflectionPrompt: EVENING_REFLECTION_PROMPTS[currentPromptIndex].promptText
            });
          }}
          hasDraft={hasDraft}
          draftWordCount={wordCount}
          lastDraftTime={lastDraftTime}
          onPreserveDraft={handleSave}
          onDiscardDraft={handleDiscardDraft}
          entries={entries}
          currentDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
        
        {/* 1. Printed Day & Date Header Zone (Directly on the paper spread with original left-right layout) */}
        <div className="flex items-baseline justify-between mb-3 pb-2 border-b-2 border-[#E5DAC8] dark:border-[#2C3831]">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display lowercase font-extrabold text-2xl sm:text-3xl text-[#2E4A3D] dark:text-[#6CB28E] tracking-tight">
              {format(dateObj, 'EEEE')}
            </span>
          </div>

          <div className="flex items-baseline gap-2 sm:gap-3">
            <span className="font-display lowercase font-bold text-lg sm:text-2xl text-[#A8382A] dark:text-[#F08A7D] tracking-tight">
              {format(dateObj, 'MMMM d')}
            </span>

            {/* Subtle collapse / focus prompt trigger - icon only with glow */}
            <button
              type="button"
              onClick={toggleDailyCollapse}
              className="p-1.5 text-[#8C7F6E] dark:text-[#A89E8F] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] transition-colors cursor-pointer flex items-center justify-center rounded-md hover:bg-[#EDE4D4] dark:hover:bg-[#2A3530]"
              title={isDailyCollapsed ? 'Show Prompts' : 'Focus Canvas'}
              aria-label={isDailyCollapsed ? 'Show Prompts' : 'Focus Canvas'}
            >
              {isDailyCollapsed ? (
                <Sparkles className="w-4 h-4 text-[#D97706] fill-[#D97706] animate-glow" />
              ) : (
                <ChevronUp className="w-4 h-4 text-[#A8382A]" />
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Planner Grid: Today's Micro-Novelty & Evening Prompt (Matching Flat Card Style) */}
        {!isDailyCollapsed && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-5 sm:mb-6 pb-4 border-b border-[#E3D9C8] dark:border-[#2C3831] animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Micro-Novelty Card: Flat style matching Evening Inquiry (no drop shadow) */}
            <div className="lg:col-span-7 bg-[#F7F4EB] dark:bg-[#1E2723] border border-[#DDD0BC] dark:border-[#33423A] rounded-xl p-3.5 sm:p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8382A] dark:text-[#F08A7D]">
                      Micro-Novelty of the Day
                    </span>
                    {displayedNovelty.isCustom && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#EAE0CE] dark:bg-[#2C3831] text-[#786D5C] dark:text-[#C5BBAE] font-bold">
                        Handcrafted
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#827766] dark:text-[#9E9382] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#A8382A] dark:text-[#F08A7D]" /> {displayedNovelty.estimatedMinutes || 3} mins
                  </span>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-[#282522] dark:text-[#FAF7F0] mb-0.5">
                  {displayedNovelty.title}
                </h3>
                {displayedNovelty.tagline && (
                  <p className="font-hand text-sm sm:text-base text-[#6B5738] dark:text-[#D1B88D] mb-2">
                    — {displayedNovelty.tagline}
                  </p>
                )}

                <p className="font-display font-medium text-xs sm:text-sm text-[#2C2926] dark:text-[#EAE5D9] leading-relaxed mb-2.5">
                  "{displayedNovelty.instruction}"
                </p>
              </div>

              {/* Action Button Row */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5DAC8] dark:border-[#2C3831]">
                <button
                  type="button"
                  onClick={() => {
                    onNoveltyCompleted(currentNoveltyId);
                    soundEngine.playPencilScratchSound();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isNoveltyCompletedToday
                      ? 'bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0]'
                      : 'bg-[#A8382A] hover:bg-[#8F2F23] text-[#FAF7F0]'
                  }`}
                  title={isNoveltyCompletedToday ? 'Completed (Click to uncheck)' : 'Click to mark as complete'}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isNoveltyCompletedToday ? 'Completed Today!' : 'Mark as Complete'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenNoveltyDossier) {
                      onOpenNoveltyDossier(currentNoveltyId);
                    } else {
                      onJumpToNovelties();
                    }
                  }}
                  className="text-xs font-medium text-[#7A4B30] dark:text-[#E2A77B] hover:underline cursor-pointer"
                >
                  Field Dossier →
                </button>
              </div>
            </div>

            {/* Evening Reflection Prompt Card */}
            <div className="lg:col-span-5 bg-[#F7F4EB] dark:bg-[#1E2723] border border-[#DDD0BC] dark:border-[#33423A] rounded-xl p-3.5 sm:p-4 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-[#8C6228] dark:text-[#DEAC5D] uppercase tracking-wider">
                    Evening Inquiry
                  </span>
                  <button
                    type="button"
                    onClick={handlePromptShuffle}
                    className="flex items-center gap-1 text-[11px] text-[#6E6352] dark:text-[#C5BBAE] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] bg-[#EBE3D3] dark:bg-[#2A3530] px-2 py-0.5 rounded transition-colors cursor-pointer"
                    title="Shuffle prompt"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Shuffle</span>
                  </button>
                </div>

                <p className="font-display italic text-sm text-[#2E2B27] dark:text-[#EAE5D9] leading-snug">
                  "{EVENING_REFLECTION_PROMPTS[currentPromptIndex].promptText}"
                </p>
                <p className="text-[11px] text-[#786E5E] dark:text-[#A89E8F] mt-1">
                  {EVENING_REFLECTION_PROMPTS[currentPromptIndex].subtext}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-[#E3D8C6] dark:border-[#2C3831] flex items-center justify-between">
                <span className="text-[10px] text-[#918573] dark:text-[#8E8373] italic">
                  Inscribe in canvas below.
                </span>
                {onOpenTwilightDesk && (
                  <button
                    type="button"
                    onClick={onOpenTwilightDesk}
                    className="text-[11px] font-semibold text-[#8C6228] dark:text-[#DEAC5D] hover:underline cursor-pointer"
                  >
                    Twilight Desk →
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* 3. Seamless Analog Metadata Row (NO thin box borders) with Lucide Icons */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4 pb-2.5 border-b border-dashed border-[#DDD0BC] dark:border-[#2C3831] text-xs">
          
          {/* Location field (clean inline) */}
          <div className="flex items-center gap-1.5 min-w-[130px] flex-1">
            <MapPin className="w-3.5 h-3.5 text-[#A8382A] dark:text-[#F08A7D] shrink-0" />
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="location (e.g. Porch)"
              className="bg-transparent outline-none text-[#2C2926] dark:text-[#EAE5D9] placeholder-[#9C9180] dark:placeholder-[#766F62] text-xs w-full py-0.5 border-b border-transparent focus:border-[#2E6B4E] dark:focus:border-[#4B8C68] transition-colors"
            />
          </div>

          {/* Weather field (clean inline) */}
          <div className="flex items-center gap-1.5 min-w-[130px] flex-1">
            <CloudSun className="w-3.5 h-3.5 text-[#2E6B4E] dark:text-[#5BA87E] shrink-0" />
            <input
              type="text"
              value={weather}
              onChange={e => setWeather(e.target.value)}
              placeholder="weather (e.g. Soft rain, 19°C)"
              className="bg-transparent outline-none text-[#2C2926] dark:text-[#EAE5D9] placeholder-[#9C9180] dark:placeholder-[#766F62] text-xs w-full py-0.5 border-b border-transparent focus:border-[#2E6B4E] dark:focus:border-[#4B8C68] transition-colors"
            />
          </div>

          {/* Rubber Stamp Selector with Lucide Icons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-[#7A6F5E] dark:text-[#A89F90] font-medium">stamp:</span>
            <div className="flex items-center gap-1">
              <StampIcon className="w-3.5 h-3.5 text-[#A8382A] dark:text-[#F08A7D] shrink-0" />
              <select
                value={moodStamp}
                onChange={e => {
                  setMoodStamp(e.target.value as MoodStamp);
                  soundEngine.playPencilScratchSound();
                }}
                className="bg-transparent text-[#2C2926] dark:text-[#EAE5D9] text-xs font-mono font-medium outline-none cursor-pointer hover:text-[#2E6B4E] dark:hover:text-[#5BA87E] transition-colors py-0.5 [&>option]:bg-[#FAF8F3] [&>option]:text-[#2C2926] dark:[&>option]:bg-[#1A211E] dark:[&>option]:text-[#EAE5D9]"
              >
                <option value="ROUTINE_BREAKER">ROUTINE BREAKER</option>
                <option value="CORE_MEMORY">CORE MEMORY</option>
                <option value="MUNDANE_MAGIC">MUNDANE MAGIC</option>
                <option value="QUIET_MOMENT">QUIET MOMENT</option>
                <option value="SERENDIPITY">SERENDIPITY</option>
                <option value="GENTLE_DAY">GENTLE DAY</option>
              </select>
            </div>
          </div>

          {/* Quick Voice Dictation Trigger on Canvas */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              type="button"
              onClick={() => toggleListening()}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                isListening
                  ? 'bg-[#A8382A] text-[#FAF7F0] font-bold shadow-xs animate-pulse'
                  : 'text-[#6D6352] dark:text-[#A89E8F] hover:text-[#1C355E] dark:hover:text-[#FAF7F0] hover:bg-[#EDE3D2] dark:hover:bg-[#28322E]'
              }`}
              title={isListening ? 'Stop Voice Dictation' : 'Dictate directly onto notebook with Voice'}
            >
              {isListening ? (
                <>
                  <Radio className="w-3 h-3 text-[#FAF7F0] animate-pulse" />
                  <span>DICTATING</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-[#7A6F5E] dark:text-[#A89E8F]" />
                  <span>DICTATE</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Voice Dictation Live Interim Banner */}
        {isListening && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#F5EDE0] dark:bg-[#232D27] border border-[#DDD0BC] dark:border-[#38463F] flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="flex h-2.5 w-2.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A8382A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A8382A]"></span>
              </span>
              <span className="font-mono text-[11px] font-bold text-[#A8382A] dark:text-[#F08A7D] uppercase tracking-wider shrink-0">
                Listening:
              </span>
              <span className="font-hand text-lg text-[#2C2926] dark:text-[#FAF7F0] truncate italic">
                {interimTranscript ? `"${interimTranscript}"` : 'Speak now... thoughts will appear in your handwriting font'}
              </span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="px-2 py-0.5 bg-[#A8382A] hover:bg-[#8C2E22] text-[#FAF7F0] rounded-md font-semibold text-[11px] shrink-0 cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* Voice Error Notification (Dismissible) */}
        {voiceError && !voiceErrorDismissed && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-[#FDF2F0] dark:bg-[#2E1D1B] border border-[#F5C2BC] dark:border-[#4D2622] text-xs text-[#8C3A27] dark:text-[#F08A7D] flex items-center justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <MicOff className="w-3.5 h-3.5 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceErrorDismissed(true)}
              className="font-bold hover:opacity-75 cursor-pointer text-xs px-1.5 py-0.5 rounded-md hover:bg-[#F5C2BC]/30"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Journal Entry Title (Ballpoint handwritten feel - auto-wrapping on mobile & desktop) */}
        <div className="mb-4">
          <textarea
            ref={titleTextareaRef}
            rows={1}
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              adjustTitleHeight();
            }}
            placeholder="A single vivid phrase for this day..."
            className={`w-full bg-transparent font-hand text-xl sm:text-2xl md:text-3xl font-bold tracking-wide outline-none placeholder-[#A99F90] dark:placeholder-[#726B5F] border-b border-[#E3D8C6] dark:border-[#2C3831] pb-2 pt-1 px-0 resize-none break-words leading-relaxed sm:leading-normal ${getInkClass()}`}
            style={{ height: 'auto', minHeight: '44px', overflowY: 'hidden' }}
          />
        </div>

        {/* Journal Entry Body (Authentic notebook ruled alignment with integrated margin) */}
        <div className="relative mb-6">
          {paperStyle === 'ruled' && (
            <div className="absolute top-0 bottom-0 left-4 sm:left-7 w-[2px] bg-[#E78F81] dark:bg-[#B05B50] opacity-75 pointer-events-none z-10" />
          )}

          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write freely. Describe the sounds, the light on the wall, what you touched, the taste of morning, or how the hours slipped away... (No character limits. Your thoughts remain 100% private in your device)."
            rows={9}
            className={`w-full bg-transparent ${getInkClass()} font-hand text-lg sm:text-xl md:text-2xl leading-[28px] sm:leading-[32px] outline-none resize-y placeholder-[#AFA595] dark:placeholder-[#726B5F] ${
              paperStyle === 'ruled' ? 'pl-6 sm:pl-10 pr-2' : 'px-1'
            }`}
            style={{ minHeight: '220px' }}
          />
          
          {/* Subtle watermarked ink stamp on paper with Lucide icon */}
          <div className="absolute bottom-2 right-2 pointer-events-none opacity-80 flex items-center gap-1">
            <div className={moodStamp === 'CORE_MEMORY' || moodStamp === 'ROUTINE_BREAKER' ? 'rubber-stamp flex items-center gap-1.5' : 'rubber-stamp-green flex items-center gap-1.5'}>
              <StampIcon className="w-3.5 h-3.5 inline-block shrink-0" />
              <span>{STAMP_CONFIG[moodStamp]?.label || moodStamp.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Sensory Anchors (Somatosensory Awakening Multi-selector) with Emoji Icons */}
        <div className="mb-5 sm:mb-6 pt-3 sm:pt-4 border-t border-[#E3D9C8] dark:border-[#2C3831]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#554E40] dark:text-[#C5BBAE] uppercase tracking-wider">
              Sensory Anchors
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#857A68] dark:text-[#8E8373]">Physical senses present</span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(Object.keys(SENSORY_CUE_METADATA) as SensoryCue[]).map(cue => {
              const info = SENSORY_CUE_METADATA[cue];
              const isSelected = sensoryCues.includes(cue);
              return (
                <button
                  key={cue}
                  type="button"
                  onClick={() => toggleSensoryCue(cue)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#1C355E] dark:bg-[#234578] text-[#FAF7F0] border-[#1C355E] dark:border-[#3864A3] shadow-xs scale-102 font-semibold'
                      : 'bg-[#F2ECE0] dark:bg-[#1F2723] text-[#554E40] dark:text-[#C5BBAE] border-[#D4C8B5] dark:border-[#33423A] hover:bg-[#E8DFCF] dark:hover:bg-[#28332D]'
                  }`}
                >
                  <span className="text-sm">{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Perception Gauge (Subjective Time Velocity) with Emoji Symbols */}
        <div className="mb-5 sm:mb-6 pt-3 sm:pt-4 border-t border-[#E3D9C8] dark:border-[#2C3831]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#554E40] dark:text-[#C5BBAE] uppercase tracking-wider">
              Subjective Time Velocity
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#857A68] dark:text-[#8E8373]">Temporal Flow</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(Object.keys(TIME_PACING_METADATA) as TimePacing[]).map(pacingKey => {
              const pacing = TIME_PACING_METADATA[pacingKey];
              const isSelected = timePacing === pacingKey;
              return (
                <button
                  key={pacingKey}
                  type="button"
                  onClick={() => {
                    setTimePacing(pacingKey);
                    soundEngine.playPencilScratchSound();
                  }}
                  className={`flex flex-col text-left p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EBF2EA] dark:bg-[#21352A] border-[#2E6B4E] dark:border-[#4B8C68] ring-1 ring-[#2E6B4E] dark:ring-[#4B8C68] shadow-xs'
                      : 'bg-[#F5EFE4] dark:bg-[#1E2723] border-[#D9CDBC] dark:border-[#33423A] hover:bg-[#ECE3D3] dark:hover:bg-[#28332D]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-base sm:text-lg">{pacing.symbol}</span>
                    <span className="font-semibold text-xs text-[#2C2926] dark:text-[#EAE5D9] leading-tight">{pacing.label}</span>
                  </div>
                  <p className="text-[10px] text-[#6E6454] dark:text-[#A89F90] leading-tight line-clamp-2">
                    {pacing.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: Save, Word count, Favorite */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#DED2BF] dark:border-[#2C3831]">
          <div className="flex items-center justify-between w-full sm:w-auto gap-4 text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
            <span>{wordCount} words</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setIsFavorite(!isFavorite);
                soundEngine.playPencilScratchSound();
              }}
              className={`flex items-center gap-1 transition-colors cursor-pointer ${isFavorite ? 'text-[#A8382A] dark:text-[#F08A7D] font-semibold' : 'text-[#7A6F5E] dark:text-[#A89E8F] hover:text-[#2C2926] dark:hover:text-[#FAF7F0]'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#A8382A] dark:fill-[#F08A7D]' : ''}`} />
              <span>{isFavorite ? 'Bookmarked' : 'Bookmark'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2.5">
            {showSavedToast && (
              <span className="text-xs font-semibold text-[#2E6B4E] dark:text-[#5BA87E] bg-[#E3EFE5] dark:bg-[#1E3326] px-2.5 py-1 rounded-md animate-fade-in">
                ✓ Recorded
              </span>
            )}
            
            <button
              ref={saveBtnRef}
              onClick={handleSave}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-[#2E6B4E] hover:bg-[#25563E] active:scale-95 text-[#FAF7F0] font-semibold text-sm shadow-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer"
            >
              <Feather className="w-4 h-4" />
              <span>Preserve Memory</span>
            </button>
          </div>
        </div>

      </div>

      {/* Serendipity Engine Random Memory Modal */}
      <SerendipityMemoryModal
        isOpen={isSerendipityOpen}
        onClose={() => setIsSerendipityOpen(false)}
        entries={entries}
        currentSelectedDate={selectedDate}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setIsSerendipityOpen(false);
        }}
      />

    </div>
  );
};
