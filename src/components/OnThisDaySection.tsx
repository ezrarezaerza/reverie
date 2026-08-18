import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, History, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { MemoryEntry } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { getLocalDateString, parseLocalDate, shiftDateString, formatDisplayDate } from '../utils/dateUtils';
import { AnalogDatePicker } from './AnalogDatePicker';

interface OnThisDaySectionProps {
  entries: MemoryEntry[];
  currentDate?: Date;
  onRevealEntry: (entry: MemoryEntry) => void;
  onSelectDateForJournal: (date: string) => void;
}

export const OnThisDaySection: React.FC<OnThisDaySectionProps> = ({
  entries,
  currentDate = new Date(),
  onRevealEntry,
  onSelectDateForJournal,
}) => {
  const todayStr = getLocalDateString(currentDate);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);

  const targetDateObj = parseLocalDate(selectedDateStr);
  const targetMonth = targetDateObj.getMonth() + 1; // 1-12
  const targetDay = targetDateObj.getDate();
  const selectedYear = targetDateObj.getFullYear();
  const isViewingToday = selectedDateStr === todayStr;

  // Find all historical entries matching the same month and day across different years
  const matchingHistoricalEntries = entries.filter((entry) => {
    const entryDateObj = parseLocalDate(entry.date);
    const entryMonth = entryDateObj.getMonth() + 1;
    const entryDay = entryDateObj.getDate();
    const entryYear = entryDateObj.getFullYear();

    return entryMonth === targetMonth && entryDay === targetDay && entryYear !== selectedYear;
  });

  // Calculate year difference relative to selected year
  const formatYearsAgo = (entryDateStr: string) => {
    const entryYear = parseLocalDate(entryDateStr).getFullYear();
    const diff = selectedYear - entryYear;
    if (diff === 1) return '1 year ago';
    if (diff > 1) return `${diff} years ago`;
    if (diff === -1) return '1 year later';
    if (diff < -1) return `${Math.abs(diff)} years later`;
    return 'Same year';
  };

  const handleDateShift = (offset: number) => {
    soundEngine.playPaperTurnSound();
    setSelectedDateStr(shiftDateString(selectedDateStr, offset));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      soundEngine.playPaperTurnSound();
      setSelectedDateStr(e.target.value);
    }
  };

  return (
    <div className="w-full bg-[#FAF8F3] border border-[#DDD1BE] rounded-2xl p-5 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_10px_20px_rgba(40,30,20,0.06)] relative overflow-hidden mb-8">
      {/* Top Washi Tape */}
      <div 
        className="washi-tape washi-terracotta absolute -top-3 left-8 w-32 h-6 flex items-center justify-center shadow-xs z-10"
        style={{ transform: 'rotate(-1.2deg)' }}
      >
        <span className="text-[9px] font-mono font-bold tracking-widest text-[#4A201A] uppercase select-none">
          ON THIS DAY
        </span>
      </div>

      <div className="flex flex-col gap-3.5 mb-5 pt-1 border-b border-dashed border-[#D6C7B3] pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#A8382A]" />
            <h3 className="font-display text-xl font-bold text-[#2A2723]">
              Temporal Memory Echoes
            </h3>
          </div>
          <p className="text-xs text-[#746856]">
            Memories inscribed on this exact calendar day across prior years.
          </p>
        </div>

        {/* Date Selector with Calendar Picker - Matching Today Page full-width centered layout */}
        <div className="w-full flex items-center justify-between gap-1 bg-[#FAF7F0] border border-[#DDD3C1] rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={() => handleDateShift(-1)}
            className="p-1.5 rounded-lg hover:bg-[#EFE7D8] text-[#554E42] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer shrink-0"
            title="Previous Day"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Analog Calendar Popover Picker: Full width, centered, full date label */}
          <AnalogDatePicker
            selectedDate={selectedDateStr}
            onSelectDate={(newDate) => setSelectedDateStr(newDate)}
            activeDates={entries.map((e) => e.date)}
            labelFormat="full"
            showTodayBadge={true}
            variant="bare"
            className="flex-1 text-center"
          />

          <button
            type="button"
            onClick={() => handleDateShift(1)}
            className="p-1.5 rounded-lg hover:bg-[#EFE7D8] text-[#554E42] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E] cursor-pointer shrink-0"
            title="Next Day"
            aria-label="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isViewingToday && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playPaperTurnSound();
                setSelectedDateStr(todayStr);
              }}
              className="text-[11px] font-semibold px-2 py-1 text-[#665D4F] hover:text-[#1E2522] bg-[#EFE7D8] rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
              title="Reset to Today's date"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Historical Entries Match list */}
      {matchingHistoricalEntries.length > 0 ? (
        <div className="space-y-4">
          {matchingHistoricalEntries.map((entry, idx) => {
            const yearsAgoLabel = formatYearsAgo(entry.date);
            return (
              <div
                key={entry.id || `${entry.date}-${idx}`}
                onClick={() => {
                  soundEngine.playPaperTurnSound();
                  onRevealEntry(entry);
                }}
                className="group relative bg-[#FFFDF9] border border-[#DCD0BC] hover:border-[#2E6B4E] rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8E0D0] text-[#524637]">
                      {yearsAgoLabel}
                    </span>
                    <span className="text-xs text-[#8A7E6C] font-mono">
                      {entry.date}
                    </span>
                    {entry.moodStamp && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E4EDE1] text-[#255038] font-semibold">
                        {entry.moodStamp.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <h4 className="font-display font-bold text-base text-[#2C2926] group-hover:text-[#A8382A] transition-colors">
                    {entry.title}
                  </h4>

                  <p className="font-hand text-lg text-[#1E3A8A] line-clamp-2 leading-relaxed">
                    "{entry.body}"
                  </p>
                </div>

                <button
                  type="button"
                  className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  <span>Open Folio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#F5EFE4] border border-dashed border-[#D5C6B1] rounded-xl p-5 text-center">
          <Clock className="w-6 h-6 text-[#8F816E] mx-auto mb-2 opacity-70" />
          <h4 className="font-display font-semibold text-sm text-[#3E362A] mb-1">
            No historical echoes for {formatDisplayDate(selectedDateStr, { month: 'long', day: 'numeric' })} yet
          </h4>
          <p className="text-xs text-[#7A6F5E] max-w-md mx-auto mb-3">
            As you continue journaling daily, this engine automatically surfaces the sights, scents, and reflections captured on this exact calendar day across prior years.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#E5DAC8] text-xs">
            <span className="text-[#6D6352] font-medium">Quick Year-Echo Simulation:</span>
            <button
              onClick={() => {
                const lastYearStr = `${selectedYear - 1}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
                onSelectDateForJournal(lastYearStr);
              }}
              className="text-xs px-3 py-1.5 bg-[#FAF8F2] border border-[#CFBFAB] text-[#2C2926] hover:bg-[#EFE7D8] rounded-md font-medium transition-colors cursor-pointer shadow-2xs"
            >
              Inscribe Memory for {formatDisplayDate(`${selectedYear - 1}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`, { month: 'short', day: 'numeric', year: 'numeric' })}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
