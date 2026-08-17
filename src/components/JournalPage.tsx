import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Heart,
  Feather,
  MapPin,
  CloudSun,
  Shuffle,
  Flame,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { MemoryEntry, SensoryCue, TimePacing, MoodStamp, MicroNovelty } from '../types';
import { SENSORY_CUE_METADATA, TIME_PACING_METADATA } from '../data/microNoveltiesCatalog';
import { EVENING_REFLECTION_PROMPTS } from '../data/reflectionPromptsCatalog';
import { getDailyPrompt } from '../lib/prompt-engine';
import { calculateNewStreak } from '../lib/streak-logic';
import { soundEngine } from '../utils/soundEngine';

interface JournalPageProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  entries: MemoryEntry[];
  onSaveEntry: (entry: MemoryEntry) => void;
  activeNovelty: MicroNovelty;
  onNoveltyCompleted: (noveltyId: string) => void;
  isNoveltyCompletedToday: boolean;
  onJumpToNovelties: () => void;
}

export const JournalPage: React.FC<JournalPageProps> = ({
  selectedDate,
  setSelectedDate,
  entries,
  onSaveEntry,
  activeNovelty,
  onNoveltyCompleted,
  isNoveltyCompletedToday,
  onJumpToNovelties
}) => {
  // Find entry for selected date
  const existingEntry = entries.find(e => e.date === selectedDate);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [timePacing, setTimePacing] = useState<TimePacing>('slow');
  const [sensoryCues, setSensoryCues] = useState<SensoryCue[]>(['sight', 'sound']);
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState('');
  const [moodStamp, setMoodStamp] = useState<MoodStamp>('ROUTINE_BREAKER');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [paperStyle, setPaperStyle] = useState<'ruled' | 'grid' | 'dot'>('ruled');
  const [inkColor, setInkColor] = useState<'blue' | 'black' | 'sepia'>('blue');
  const [showSavedToast, setShowSavedToast] = useState(false);

  const paperRef = useRef<HTMLDivElement>(null);
  const saveBtnRef = useRef<HTMLButtonElement>(null);

  // Compute offline deterministic micro-novelty prompt for the selected date
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const offlineDailyPrompt = getDailyPrompt(dateObj);

  // Calculate Streak & Grace Day status
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastRecordedDate = sortedEntries.length > 0 ? new Date(sortedEntries[0].date + 'T00:00:00') : null;
  const streakCalc = calculateNewStreak(
    lastRecordedDate,
    new Date(),
    sortedEntries.length > 0 ? Math.max(1, sortedEntries.length) : 0,
    false
  );

  // Load existing entry data when date changes
  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title || '');
      setBody(existingEntry.body || '');
      setTimePacing(existingEntry.timePacing || 'slow');
      setSensoryCues(existingEntry.sensoryCues || ['sight']);
      setLocation(existingEntry.location || '');
      setWeather(existingEntry.weather || '');
      setMoodStamp(existingEntry.moodStamp || 'ROUTINE_BREAKER');
      setIsFavorite(!!existingEntry.isFavorite);
      setPaperStyle(existingEntry.paperStyle || 'ruled');
      setInkColor(existingEntry.inkColor || 'blue');
    } else {
      // Clean slate for new date
      setTitle('');
      setBody('');
      setTimePacing('slow');
      setSensoryCues(['sight', 'sound']);
      setLocation('');
      setWeather('');
      setMoodStamp('ROUTINE_BREAKER');
      setIsFavorite(false);
    }
  }, [selectedDate, existingEntry]);

  // Tactile GSAP entrance animation on date change
  useEffect(() => {
    if (paperRef.current) {
      gsap.fromTo(
        paperRef.current,
        { opacity: 0.85, y: 8, rotateZ: -0.5 },
        { opacity: 1, y: 0, rotateZ: 0, duration: 0.45, ease: 'power2.out' }
      );
    }
  }, [selectedDate]);

  const handleDateChange = (offsetDays: number) => {
    soundEngine.playPaperTurnSound();
    const currentDateObj = new Date(selectedDate + 'T00:00:00');
    currentDateObj.setDate(currentDateObj.getDate() + offsetDays);
    const newDateStr = currentDateObj.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  const handlePromptShuffle = () => {
    soundEngine.playPaperTurnSound();
    setCurrentPromptIndex((prev) => (prev + 1) % EVENING_REFLECTION_PROMPTS.length);
  };

  const toggleSensoryCue = (cue: SensoryCue) => {
    soundEngine.playPencilScratchSound();
    setSensoryCues(prev => 
      prev.includes(cue) ? prev.filter(c => c !== cue) : [...prev, cue]
    );
  };

  const handleSave = () => {
    soundEngine.playPencilScratchSound();
    
    // Confetti effect from save button
    if (saveBtnRef.current) {
      const rect = saveBtnRef.current.getBoundingClientRect();
      confetti({
        particleCount: 28,
        spread: 45,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight
        },
        colors: ['#A8382A', '#D9A74A', '#2E6B4E', '#1C355E']
      });
    }

    const newEntry: MemoryEntry = {
      id: existingEntry ? existingEntry.id : `entry-${Date.now()}`,
      date: selectedDate,
      createdAt: existingEntry ? existingEntry.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      title: title.trim() || 'Untitled Evening Memory',
      body: body.trim(),
      timePacing,
      sensoryCues,
      location: location.trim() || undefined,
      weather: weather.trim() || undefined,
      moodStamp,
      linkedNoveltyId: isNoveltyCompletedToday ? activeNovelty.id : undefined,
      linkedNoveltyTitle: isNoveltyCompletedToday ? activeNovelty.title : undefined,
      reflectionPrompt: EVENING_REFLECTION_PROMPTS[currentPromptIndex].promptText,
      isFavorite,
      paperStyle,
      inkColor
    };

    onSaveEntry(newEntry);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2400);
  };

  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const getInkClass = () => {
    if (inkColor === 'black') return 'text-[#1F1E1C]';
    if (inkColor === 'sepia') return 'text-[#4A321E]';
    return 'ballpoint-ink';
  };

  const getPaperBgClass = () => {
    if (paperStyle === 'grid') return 'grid-paper';
    if (paperStyle === 'dot') return 'dot-paper';
    return 'ruled-paper';
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Date Navigation, Streak Badge & Paper Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-1.5 rounded-md bg-[#FAF7F0] border border-[#DDD3C1] hover:bg-[#EFE7D8] text-[#554E42] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E]"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 bg-[#FAF7F0] border border-[#DDD3C1] px-3.5 py-1.5 rounded-lg shadow-sm">
            <CalendarIcon className="w-4 h-4 text-[#A8382A]" />
            <span className="font-display font-semibold text-sm text-[#2C2926] tracking-wide">
              {formattedDate}
            </span>
            {isToday && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#E2EDDE] text-[#245239] rounded-full">
                Today
              </span>
            )}
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-1.5 rounded-md bg-[#FAF7F0] border border-[#DDD3C1] hover:bg-[#EFE7D8] text-[#554E42] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E]"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="text-xs px-2.5 py-1 text-[#665D4F] hover:text-[#1E2522] hover:bg-[#EFE7D8] rounded-md transition-colors"
            >
              Jump to Today
            </button>
          )}
        </div>

        {/* Streak & Grace Day Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#FAF7F0] border border-[#DDD3C1] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#8C3A27]">
            <Flame className="w-3.5 h-3.5 text-[#A8382A] fill-[#A8382A]" />
            <span>{streakCalc.currentStreak} Day Reflection Streak</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-[#FAF7F0] border border-[#DDD3C1] px-2.5 py-1 rounded-lg text-[11px] text-[#48634F] font-medium" title="1 free missed day per month preserved automatically">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E6B4E]" />
            <span>{streakCalc.graceDayUsed ? 'Grace Used This Month' : 'Monthly Grace Active'}</span>
          </div>

          {/* Paper & Ink switchers */}
          <div className="flex items-center bg-[#FAF7F0] border border-[#DDD3C1] p-0.5 rounded-lg text-xs">
            {(['ruled', 'grid', 'dot'] as const).map(p => (
              <button
                key={p}
                onClick={() => { setPaperStyle(p); soundEngine.playPencilScratchSound(); }}
                className={`px-2 py-0.5 rounded-md capitalize font-medium transition-all ${
                  paperStyle === p ? 'bg-[#EAE0CE] text-[#1E3A8A] font-semibold' : 'text-[#7D7362] hover:text-[#2C2926]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#FAF7F0] border border-[#DDD3C1] p-1 rounded-lg gap-1.5">
            <button
              onClick={() => setInkColor('blue')}
              className={`w-3.5 h-3.5 rounded-full bg-[#1C355E] border transition-transform ${inkColor === 'blue' ? 'scale-125 ring-2 ring-[#1C355E] ring-offset-1' : 'opacity-70'}`}
              title="Ballpoint Blue Ink"
            />
            <button
              onClick={() => setInkColor('black')}
              className={`w-3.5 h-3.5 rounded-full bg-[#202020] border transition-transform ${inkColor === 'black' ? 'scale-125 ring-2 ring-[#202020] ring-offset-1' : 'opacity-70'}`}
              title="Charcoal Black Ink"
            />
            <button
              onClick={() => setInkColor('sepia')}
              className={`w-3.5 h-3.5 rounded-full bg-[#593E2B] border transition-transform ${inkColor === 'sepia' ? 'scale-125 ring-2 ring-[#593E2B] ring-offset-1' : 'opacity-70'}`}
              title="Faded Sepia Ink"
            />
          </div>
        </div>
      </div>

      {/* Main Analog Notebook Spread */}
      <div 
        ref={paperRef}
        className={`relative ${getPaperBgClass()} paper-shadow-lifted rounded-xl border border-[#D8CDBC] p-6 sm:p-10 transition-all`}
      >
        {/* Washi Tape Strip at the Top Center */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-32 h-6 washi-sage washi-tape shadow-sm z-10 flex items-center justify-center">
          <span className="text-[10px] font-mono tracking-widest text-[#3B543D] opacity-80 select-none">
            REVERIE • DAILY
          </span>
        </div>

        {/* Top Planner Grid: Today's Deterministic Micro-Novelty & Evening Prompt */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 pb-6 border-b border-[#E3D9C8]">
          
          {/* Micro-Novelty Sticky Card (Deterministic Offline Engine) */}
          <div className="lg:col-span-6 bg-[#F5EFE3] border border-[#DDD0BC] rounded-lg p-4 relative shadow-sm">
            <div className="washi-tape washi-terracotta absolute -top-2.5 right-4 w-24 h-5 text-[9px] text-[#542B24] font-bold flex items-center justify-center">
              DAY {offlineDailyPrompt.dayOfYear} NOVELTY
            </div>
            
            <div className="space-y-1 pt-1">
              <span className="text-xs font-semibold text-[#A8382A] uppercase tracking-wider">
                Micro-Novelty Prompt #{offlineDailyPrompt.id}
              </span>
              <p className="font-display font-medium text-sm text-[#2C2926] leading-relaxed">
                "{offlineDailyPrompt.text}"
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E5DAC8] flex items-center justify-between">
              <button
                onClick={() => {
                  onNoveltyCompleted(activeNovelty.id);
                  soundEngine.playPencilScratchSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  isNoveltyCompletedToday
                    ? 'bg-[#2E6B4E] text-[#FAF7F0] font-semibold'
                    : 'bg-[#EAE0CD] text-[#4A4235] hover:bg-[#DFD3BE]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isNoveltyCompletedToday ? 'Completed Today!' : 'Mark Completed'}</span>
              </button>

              <button
                onClick={onJumpToNovelties}
                className="text-[11px] font-medium text-[#7A4B30] hover:text-[#522F1D] underline underline-offset-2"
              >
                Full Novelties Deck →
              </button>
            </div>
          </div>

          {/* Evening Reflection Prompt Card */}
          <div className="lg:col-span-6 bg-[#F7F4EB] border border-[#DDD0BC] rounded-lg p-4 relative shadow-sm flex flex-col justify-between">
            <div className="washi-tape washi-ochre absolute -top-2.5 left-4 w-24 h-5 text-[9px] text-[#543C16] font-bold flex items-center justify-center">
              EVENING INQUIRY
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#8C6228] uppercase tracking-wider">
                  Gentle Reflection
                </span>
                <button
                  onClick={handlePromptShuffle}
                  className="flex items-center gap-1 text-[11px] text-[#6E6352] hover:text-[#2C2926] bg-[#EBE3D3] px-2 py-0.5 rounded transition-colors"
                  title="Shuffle prompt"
                >
                  <Shuffle className="w-3 h-3" />
                  <span>Shuffle</span>
                </button>
              </div>

              <p className="font-display italic text-sm text-[#2E2B27] leading-snug">
                "{EVENING_REFLECTION_PROMPTS[currentPromptIndex].promptText}"
              </p>
              <p className="text-[11px] text-[#786E5E] mt-1">
                {EVENING_REFLECTION_PROMPTS[currentPromptIndex].subtext}
              </p>
            </div>

            <div className="mt-2 text-[10px] text-[#918573] italic">
              Record the fine sensory details below to preserve this memory.
            </div>
          </div>

        </div>

        {/* Notebook Entry Metadata: Location, Weather, Stamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-dashed border-[#DDD0BC] text-xs">
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-[#5C5549]">
              <MapPin className="w-3.5 h-3.5 text-[#A8382A]" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Where were you? (e.g. Garden porch, Train)"
                className="bg-transparent border-b border-[#D4C8B5] focus:border-[#2E6B4E] outline-none text-[#2C2926] placeholder-[#A09584] py-0.5 text-xs w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center gap-1.5 text-[#5C5549]">
              <CloudSun className="w-3.5 h-3.5 text-[#2E6B4E]" />
              <input
                type="text"
                value={weather}
                onChange={e => setWeather(e.target.value)}
                placeholder="Sky & temp (e.g. Cool rain, 19°C)"
                className="bg-transparent border-b border-[#D4C8B5] focus:border-[#2E6B4E] outline-none text-[#2C2926] placeholder-[#A09584] py-0.5 text-xs w-36 sm:w-48"
              />
            </div>
          </div>

          {/* Rubber Stamp Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#7A7160] font-medium">Memory Stamp:</span>
            <select
              value={moodStamp}
              onChange={e => {
                setMoodStamp(e.target.value as MoodStamp);
                soundEngine.playPencilScratchSound();
              }}
              className="bg-[#F0E9DC] border border-[#CFBFAB] text-[#2C2926] text-xs rounded px-2 py-1 outline-none font-mono focus:ring-1 focus:ring-[#A8382A]"
            >
              <option value="ROUTINE_BREAKER">⚡ ROUTINE BREAKER</option>
              <option value="CORE_MEMORY">🌟 CORE MEMORY</option>
              <option value="MUNDANE_MAGIC">☕ MUNDANE MAGIC</option>
              <option value="QUIET_MOMENT">🌿 QUIET MOMENT</option>
              <option value="SERENDIPITY">✨ SERENDIPITY</option>
              <option value="GENTLE_DAY">🕊️ GENTLE DAY</option>
            </select>
          </div>

        </div>

        {/* Journal Entry Title (Ballpoint handwritten feel) */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="A single vivid phrase for this day..."
            className={`w-full bg-transparent font-hand text-2xl sm:text-3xl font-bold tracking-wide outline-none placeholder-[#A99F90] border-b border-[#E3D8C6] pb-1 ${getInkClass()}`}
          />
        </div>

        {/* Journal Entry Body (Authentic notebook ruled alignment) */}
        <div className="relative mb-6">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write freely. Describe the sounds, the light on the wall, what you touched, the taste of morning, or how the hours slipped away... (No character limits. Your thoughts remain 100% private in your device)."
            rows={10}
            className={`w-full bg-transparent ${getInkClass()} font-hand text-xl sm:text-2xl leading-[32px] outline-none resize-y placeholder-[#AFA595]`}
            style={{ minHeight: '260px' }}
          />
          
          {/* Subtle watermarked ink stamp on paper */}
          <div className="absolute bottom-3 right-3 pointer-events-none opacity-85">
            <div className={moodStamp === 'CORE_MEMORY' || moodStamp === 'ROUTINE_BREAKER' ? 'rubber-stamp' : 'rubber-stamp-green'}>
              {moodStamp.replace('_', ' ')}
            </div>
          </div>
        </div>

        {/* Sensory Anchors (Somatosensory Awakening Multi-selector) */}
        <div className="mb-6 pt-4 border-t border-[#E3D9C8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#554E40] uppercase tracking-wider">
              Sensory Anchors (What physical senses were present?)
            </span>
            <span className="text-[11px] text-[#857A68]">Select all that applied</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(SENSORY_CUE_METADATA) as SensoryCue[]).map(cue => {
              const info = SENSORY_CUE_METADATA[cue];
              const isSelected = sensoryCues.includes(cue);
              return (
                <button
                  key={cue}
                  type="button"
                  onClick={() => toggleSensoryCue(cue)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    isSelected
                      ? 'bg-[#1C355E] text-[#FAF7F0] border-[#1C355E] shadow-sm scale-105'
                      : 'bg-[#F2ECE0] text-[#554E40] border-[#D4C8B5] hover:bg-[#E8DFCFA]'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Perception Gauge (The core mechanism: How did time feel today?) */}
        <div className="mb-6 pt-4 border-t border-[#E3D9C8]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#554E40] uppercase tracking-wider">
              Subjective Time Velocity (How did time feel today?)
            </span>
            <span className="text-[11px] text-[#857A68]">Temporal Dilation Metric</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
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
                  className={`flex flex-col text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-[#EBF2EA] border-[#2E6B4E] ring-1 ring-[#2E6B4E] shadow-sm'
                      : 'bg-[#F5EFE4] border-[#D9CDBC] hover:bg-[#ECE3D3]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{pacing.symbol}</span>
                    <span className="font-semibold text-xs text-[#2C2926]">{pacing.label}</span>
                  </div>
                  <p className="text-[10px] text-[#6E6454] leading-tight">
                    {pacing.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: Save, Word count, Favorite */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-[#DED2BF]">
          <div className="flex items-center gap-4 text-xs text-[#7A6F5E]">
            <span>{wordCount} words written</span>
            <span>•</span>
            <button
              onClick={() => {
                setIsFavorite(!isFavorite);
                soundEngine.playPencilScratchSound();
              }}
              className={`flex items-center gap-1 transition-colors ${isFavorite ? 'text-[#A8382A] font-semibold' : 'text-[#7A6F5E] hover:text-[#2C2926]'}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#A8382A]' : ''}`} />
              <span>{isFavorite ? 'Bookmarked as favorite' : 'Bookmark favorite'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {showSavedToast && (
              <span className="text-xs font-semibold text-[#2E6B4E] bg-[#E3EFE5] px-3 py-1 rounded-md animate-fade-in">
                ✓ Recorded into notebook
              </span>
            )}
            
            <button
              ref={saveBtnRef}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#2E6B4E] hover:bg-[#25563E] active:scale-95 text-[#FAF7F0] font-semibold text-sm shadow-md transition-all whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#2E6B4E]"
            >
              <Feather className="w-4 h-4" />
              <span>Inscribe into Journal</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
