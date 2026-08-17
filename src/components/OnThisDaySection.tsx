import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, ArrowRight, History, Compass } from 'lucide-react';
import { MemoryEntry } from '../types';
import { soundEngine } from '../utils/soundEngine';

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
  const [customSimulatedMonthDay, setCustomSimulatedMonthDay] = useState<string>('');

  const targetDate = customSimulatedMonthDay 
    ? new Date(`2026-${customSimulatedMonthDay}T00:00:00`)
    : currentDate;

  const targetMonth = targetDate.getMonth() + 1; // 1-12
  const targetDay = targetDate.getDate();
  const currentYear = targetDate.getFullYear();

  // Find all historical entries matching the same month and day in prior years
  // Also, for demo richness, if no prior year matches, we show the closest same-month memories
  const matchingHistoricalEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date + 'T00:00:00');
    const entryMonth = entryDate.getMonth() + 1;
    const entryDay = entryDate.getDate();
    const entryYear = entryDate.getFullYear();

    return entryMonth === targetMonth && entryDay === targetDay && entryYear !== currentYear;
  });

  // Calculate year difference
  const formatYearsAgo = (entryDateStr: string) => {
    const entryYear = new Date(entryDateStr + 'T00:00:00').getFullYear();
    const diff = currentYear - entryYear;
    if (diff === 1) return '1 year ago';
    if (diff > 1) return `${diff} years ago`;
    if (diff < 0) return `Future year (${entryYear})`;
    return 'Same year';
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pt-1 border-b border-dashed border-[#D6C7B3] pb-4">
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

        {/* Date Context Indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F0E7D6] px-3 py-1 rounded-lg border border-[#D5C6B1]">
          <Calendar className="w-3.5 h-3.5 text-[#2E6B4E]" />
          <span className="text-xs font-semibold text-[#42392B]">
            {targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Historical Entries Match list */}
      {matchingHistoricalEntries.length > 0 ? (
        <div className="space-y-4">
          {matchingHistoricalEntries.map((entry) => {
            const yearsAgoLabel = formatYearsAgo(entry.date);
            return (
              <div
                key={entry.id}
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
                  className="self-end sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs font-semibold shrink-0 transition-colors"
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
            No past-year records for {targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} yet
          </h4>
          <p className="text-xs text-[#7A6F5E] max-w-md mx-auto mb-3">
            As you continue journaling daily, this engine will automatically resurface the sights, scents, and reflections you captured on this exact calendar day in years past.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-[#E5DAC8] text-xs">
            <span className="text-[#6D6352] font-medium">Quick Year-Echo Simulation:</span>
            <button
              onClick={() => {
                // Add a sample 1-year ago memory for today's date if user desires
                const lastYearStr = `${currentYear - 1}-${String(targetMonth).padStart(2, '0')}-${String(targetDay).padStart(2, '0')}`;
                onSelectDateForJournal(lastYearStr);
              }}
              className="text-xs px-3 py-1 bg-[#FAF8F2] border border-[#CFBFAB] text-[#2C2926] hover:bg-[#EFE7D8] rounded-md font-medium transition-colors"
            >
              Write a Memory for {currentYear - 1}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
