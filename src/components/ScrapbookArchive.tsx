import React, { useState } from 'react';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Heart, 
  MapPin, 
  Sparkles,
  BookOpen,
  ArrowUpRight,
  LayoutGrid,
  CalendarDays,
  History,
  Shuffle
} from 'lucide-react';
import { MemoryEntry, SensoryCue, TimePacing } from '../types';
import { SENSORY_CUE_METADATA, TIME_PACING_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';
import { TimelineCalendar } from './TimelineCalendar';
import { MemoryReveal } from './MemoryReveal';
import { OnThisDaySection } from './OnThisDaySection';
import { SerendipityMemoryModal } from './SerendipityMemoryModal';
import { AnnualBookshelf } from './scrapbook/AnnualBookshelf';
import { getLocalDateString } from '../utils/dateUtils';

interface ScrapbookArchiveProps {
  entries: MemoryEntry[];
  onSelectDateForJournal: (date: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const ScrapbookArchive: React.FC<ScrapbookArchiveProps> = ({
  entries,
  onSelectDateForJournal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSensoryFilter, setSelectedSensoryFilter] = useState<SensoryCue | 'all'>('all');
  const [selectedPacingFilter, setSelectedPacingFilter] = useState<TimePacing | 'all'>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'calendar'>('cards');
  const [expandedEntry, setExpandedEntry] = useState<MemoryEntry | null>(null);
  const [isSerendipityOpen, setIsSerendipityOpen] = useState(false);
  
  // Calendar month state
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.location && entry.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.linkedNoveltyTitle && entry.linkedNoveltyTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSensory = 
      selectedSensoryFilter === 'all' || entry.sensoryCues?.includes(selectedSensoryFilter);

    const matchesPacing = 
      selectedPacingFilter === 'all' || entry.timePacing === selectedPacingFilter;

    const matchesFav = !onlyFavorites || entry.isFavorite;

    const matchesYear = !selectedYearFilter || new Date(entry.date).getFullYear() === selectedYearFilter;

    return matchesSearch && matchesSensory && matchesPacing && matchesFav && matchesYear;
  });

  const getPacingBadge = (pacing?: TimePacing) => {
    if (!pacing || !TIME_PACING_METADATA[pacing]) return null;
    const meta = TIME_PACING_METADATA[pacing];
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAE0CD] text-[#3B3428] flex items-center gap-1">
        <span>{meta.symbol}</span>
        <span>{meta.label}</span>
      </span>
    );
  };

  const getWashiColor = (index: number) => {
    const washis = ['washi-sage', 'washi-ochre', 'washi-terracotta', 'washi-kraft'];
    return washis[index % washis.length];
  };

  const activeDates = entries.map(e => e.date);

  const handleCalendarDayClick = (date: Date) => {
    const dateStr = getLocalDateString(date);
    const existing = entries.find(e => e.date === dateStr);
    if (existing) {
      setExpandedEntry(existing);
    } else {
      onSelectDateForJournal(dateStr);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* On This Day Historical Resurfacing Section */}
      <OnThisDaySection
        entries={entries}
        currentDate={new Date()}
        onRevealEntry={(entry) => setExpandedEntry(entry)}
        onSelectDateForJournal={onSelectDateForJournal}
      />

      {/* Skeuomorphic Annual Bookshelf */}
      <AnnualBookshelf
        entries={entries}
        selectedYearFilter={selectedYearFilter}
        onSelectYearVolume={(year, earliestDate) => {
          setSelectedYearFilter(prev => (prev === year ? null : year));
          onSelectDateForJournal(earliestDate);
        }}
        onClearYearFilter={() => setSelectedYearFilter(null)}
      />

      {/* Header Zone */}
      <div className="mb-4 sm:mb-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#FAF7F0]">
              The Memory Scrapbook
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#344039] text-[#D8CEBE] font-semibold">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>
        <p className="text-xs text-[#A89E8F] mt-0.5">
          Every mundane detail captured here resists the brain's temporal compression.
        </p>
      </div>

      {/* Controls Bar: Responsive Grid/Flex for Mobile & Desktop */}
      <div className="bg-[#FAF7F1] border border-[#DDD3C2] p-2.5 sm:p-3.5 rounded-xl mb-4 sm:mb-6 shadow-xs space-y-2.5">
        
        {/* Row 1: Search and Main Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8474]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search memories, places, senses..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFFFFF] border border-[#DDD0BC] rounded-lg text-xs text-[#2C2926] placeholder-[#8F8474] outline-none focus:ring-1 focus:ring-[#2E6B4E]"
            />
          </div>

          {/* Action Row: Cards/Timeline, Random, Favorites */}
          <div className="flex items-center gap-1.5 justify-between sm:justify-start">
            {/* View Mode Toggle: Cards vs Timeline */}
            <div className="flex items-center bg-[#EDE4D4] p-0.5 rounded-lg border border-[#DCD0BC]">
              <button
                type="button"
                onClick={() => {
                  setViewMode('cards');
                  soundEngine.playPaperTurnSound();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#2E6B4E] text-[#FAF7F0] shadow-xs'
                    : 'text-[#695F50] hover:text-[#2C2926]'
                }`}
                title="View memory cards"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('calendar');
                  soundEngine.playPaperTurnSound();
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-[#2E6B4E] text-[#FAF7F0] shadow-xs'
                    : 'text-[#695F50] hover:text-[#2C2926]'
                }`}
                title="View timeline calendar"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
            </div>

            {/* Random Memory Trigger Button */}
            <button
              type="button"
              onClick={() => {
                soundEngine.playPaperTurnSound();
                setIsSerendipityOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FFFFFF] text-[#554D40] hover:text-[#1C355E] border border-[#DDD0BC] hover:bg-[#EFE7D8] transition-colors cursor-pointer shadow-2xs"
              title="Let the pages flutter open to an unpredictable past memory"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#D9A74A]" />
              <span>Random</span>
            </button>

            {/* Favorites Filter Button */}
            <button
              type="button"
              onClick={() => {
                setOnlyFavorites(!onlyFavorites);
                soundEngine.playPencilScratchSound();
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shadow-2xs ${
                onlyFavorites
                  ? 'bg-[#A8382A] text-[#FAF7F0] border-[#8A2C20]'
                  : 'bg-[#FFFFFF] text-[#554D40] border-[#DDD0BC] hover:bg-[#EFE7D8]'
              }`}
              title="Filter favorite memories"
            >
              <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current' : ''}`} />
              <span className="hidden xs:inline">Favorites</span>
            </button>
          </div>

        </div>

        {/* Row 2: Sensory Coordinates & Time Pacing Filters */}
        <div className="pt-2 border-t border-[#E5DAC7] space-y-2 text-xs">
          
          {/* Sense Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-mono font-bold text-[#7A6F5E] uppercase tracking-wider shrink-0 mr-1">
              Sense:
            </span>
            <button
              type="button"
              onClick={() => setSelectedSensoryFilter('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer shrink-0 ${
                selectedSensoryFilter === 'all'
                  ? 'bg-[#2E6B4E] text-[#FAF7F0]'
                  : 'bg-[#EDE4D4] text-[#554E41] hover:bg-[#E0D5C3]'
              }`}
            >
              All
            </button>
            {(Object.keys(SENSORY_CUE_METADATA) as SensoryCue[]).map(cue => (
              <button
                key={cue}
                type="button"
                onClick={() => {
                  setSelectedSensoryFilter(selectedSensoryFilter === cue ? 'all' : cue);
                  soundEngine.playPencilScratchSound();
                }}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                  selectedSensoryFilter === cue
                    ? 'bg-[#1C355E] text-[#FAF7F0]'
                    : 'bg-[#EDE4D4] text-[#554E41] hover:bg-[#E0D5C3]'
                }`}
              >
                <span>{SENSORY_CUE_METADATA[cue].icon}</span>
                <span>{cue}</span>
              </button>
            ))}
          </div>

          {/* Pacing Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-[10px] font-mono font-bold text-[#7A6F5E] uppercase tracking-wider shrink-0 mr-1">
              Pacing:
            </span>
            {(['all', 'slow', 'flow', 'fleeting', 'stillness'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelectedPacingFilter(p);
                  soundEngine.playPencilScratchSound();
                }}
                className={`px-2 py-1 rounded-md text-[11px] capitalize font-semibold transition-all cursor-pointer shrink-0 ${
                  selectedPacingFilter === p
                    ? 'bg-[#A8382A] text-[#FAF7F0]'
                    : 'bg-[#EDE4D4] text-[#554E41] hover:bg-[#E0D5C3]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Main View Area: Either Timeline Calendar or Scrapbook Cards */}
      {viewMode === 'calendar' ? (
        <div className="max-w-2xl mx-auto">
          <TimelineCalendar
            currentMonth={currentCalendarMonth}
            activeDates={activeDates}
            onDayClick={handleCalendarDayClick}
            onMonthChange={(newMonth) => setCurrentCalendarMonth(newMonth)}
          />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-[#FAF7F1] border border-[#DDD3C2] rounded-xl p-12 text-center max-w-md mx-auto paper-shadow">
          <BookOpen className="w-10 h-10 text-[#A8382A] mx-auto mb-3 opacity-70" />
          <h3 className="font-display font-bold text-lg text-[#2C2926] mb-1">
            No memories found
          </h3>
          <p className="text-xs text-[#7A7160] mb-4">
            Try adjusting your search query or sensory filters, or inscribe a new memory for today.
          </p>
          <button
            onClick={() => onSelectDateForJournal(new Date().toISOString().split('T')[0])}
            className="px-4 py-2 bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs font-semibold rounded-lg transition-colors"
          >
            Inscribe Today's Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry, idx) => {
            const entryDate = new Date(entry.date + 'T00:00:00');
            const displayDate = entryDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={entry.id || `${entry.date}-${idx}`}
                onClick={() => {
                  soundEngine.playPaperTurnSound();
                  setExpandedEntry(entry);
                }}
                className="group relative bg-[#FAF8F3] paper-shadow rounded-xl border border-[#DCD0BE] p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
              >
                {/* Washi Tape Header Accent */}
                <div className={`washi-tape ${getWashiColor(idx)} absolute -top-2.5 left-6 w-20 h-5 flex items-center justify-center text-[9px] font-mono text-[#332A1F] font-bold`}>
                  MEMOIR
                </div>

                {/* Vintage Silk Ribbon Bookmark (if favorite) */}
                {entry.isFavorite && (
                  <div 
                    className="vintage-ribbon vintage-ribbon-terracotta absolute -top-2.5 right-6 w-5 h-8 z-10 pointer-events-none shadow-xs"
                    title="Bookmarked Memory"
                  />
                )}

                <div>
                  {/* Date & Favorite */}
                  <div className="flex items-center justify-between mb-3 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#7A6F5E] font-medium">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#A8382A]" />
                      <span>{displayDate}</span>
                    </div>

                    {entry.isFavorite && (
                      <Heart className="w-3.5 h-3.5 text-[#A8382A] fill-[#A8382A]" />
                    )}
                  </div>

                  {/* Title in handwriting or retro display (if present) */}
                  {entry.title ? (
                    <h3 className="font-display font-bold text-lg text-[#292623] mb-2 group-hover:text-[#A8382A] transition-colors leading-snug">
                      {entry.title}
                    </h3>
                  ) : null}

                  {/* Handwritten memory snippet */}
                  <p className="font-hand text-lg sm:text-xl text-[#1E3A8A] leading-relaxed line-clamp-4 mb-4">
                    "{entry.body}"
                  </p>
                </div>

                {/* Card footer: Sensory pills & linked novelty */}
                <div>
                  {entry.linkedNoveltyTitle && (
                    <div className="mb-2 bg-[#F1E9DB] text-[#554939] px-2 py-1 rounded text-[11px] truncate flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#A8382A] shrink-0" />
                      <span className="truncate">{entry.linkedNoveltyTitle}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8DFCFA]">
                    <div className="flex items-center gap-1">
                      {entry.sensoryCues?.slice(0, 3).map((cue, cIdx) => (
                        <span key={`${cue}-${cIdx}`} className="text-xs" title={cue}>
                          {SENSORY_CUE_METADATA[cue]?.icon}
                        </span>
                      ))}
                    </div>

                    {getPacingBadge(entry.timePacing)}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* GSAP Animated Full Memory Modal */}
      <MemoryReveal
        isOpen={!!expandedEntry}
        entry={expandedEntry}
        onClose={() => setExpandedEntry(null)}
        onEditInNotebook={(date) => {
          onSelectDateForJournal(date);
          setExpandedEntry(null);
        }}
      />

      {/* Serendipity Random Memory Engine Modal */}
      <SerendipityMemoryModal
        isOpen={isSerendipityOpen}
        onClose={() => setIsSerendipityOpen(false)}
        entries={entries}
        onSelectDate={(date) => {
          onSelectDateForJournal(date);
          setIsSerendipityOpen(false);
        }}
      />

    </div>
  );
};
