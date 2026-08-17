import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface TimelineCalendarProps {
  currentMonth: Date;
  activeDates: (Date | string)[];
  onDayClick: (date: Date) => void;
  selectedDate?: Date | string;
  onMonthChange?: (newMonth: Date) => void;
}

export const TimelineCalendar: React.FC<TimelineCalendarProps> = ({
  currentMonth,
  activeDates,
  onDayClick,
  selectedDate,
  onMonthChange,
}) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const hasEntry = (day: Date) => {
    return activeDates.some((activeDate) => {
      const d = typeof activeDate === 'string' ? new Date(activeDate + 'T00:00:00') : activeDate;
      return isSameDay(d, day);
    });
  };

  const isSelected = (day: Date) => {
    if (!selectedDate) return false;
    const d = typeof selectedDate === 'string' ? new Date(selectedDate + 'T00:00:00') : selectedDate;
    return isSameDay(d, day);
  };

  const handlePrevMonth = () => {
    soundEngine.playPaperTurnSound();
    if (onMonthChange) {
      const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      onMonthChange(prev);
    }
  };

  const handleNextMonth = () => {
    soundEngine.playPaperTurnSound();
    if (onMonthChange) {
      const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      onMonthChange(next);
    }
  };

  // Count memories in the current displayed month
  const memoriesThisMonth = activeDates.filter(ad => {
    const d = typeof ad === 'string' ? new Date(ad + 'T00:00:00') : ad;
    return isSameMonth(d, monthStart);
  }).length;

  return (
    <div className="w-full bg-[#FAF8F2] rounded-2xl border border-[#DCD1BF] p-5 sm:p-7 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_16px_rgba(40,30,20,0.08)] relative overflow-hidden">
      {/* Skeuomorphic Washi Tape Accent at Top Center */}
      <div 
        className="washi-tape washi-ochre absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 flex items-center justify-center pointer-events-none shadow-xs z-10"
        style={{ transform: 'translateX(-50%) rotate(-0.8deg)' }}
      >
        <span className="text-[9px] font-mono font-bold tracking-widest text-[#4A3716] uppercase select-none">
          TIMELINE GRID
        </span>
      </div>

      {/* Planner Header: Month & Year display with Controls */}
      <div className="flex items-center justify-between mb-5 pt-2 pb-3 border-b border-dashed border-[#D5C7B4]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg text-[#6B604F] hover:bg-[#EAE0CE] hover:text-[#2A2723] transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2723] tracking-wide">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-[11px] font-hand text-lg text-[#7C6E59] -mt-1">
            {memoriesThisMonth} recorded {memoriesThisMonth === 1 ? 'memory' : 'memories'} this month
          </p>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg text-[#6B604F] hover:bg-[#EAE0CE] hover:text-[#2A2723] transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-[11px] font-bold uppercase tracking-wider text-[#8A7D6B] font-mono py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayActive = hasEntry(day);
          const isDaySelected = isSelected(day);
          const isDayToday = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                soundEngine.playPencilScratchSound();
                onDayClick(day);
              }}
              disabled={!isCurrentMonth}
              className={`group relative aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#2E6B4E] ${
                !isCurrentMonth
                  ? 'opacity-20 cursor-default pointer-events-none'
                  : isDayActive
                  ? 'hover:scale-105 cursor-pointer bg-[#F4EDE0]'
                  : 'hover:bg-[#F0E8D9] cursor-pointer'
              } ${
                isDaySelected ? 'ring-2 ring-[#1C355E] ring-offset-1 bg-[#EBE1CF]' : ''
              }`}
            >
              {/* Day Number */}
              <span
                className={`text-xs sm:text-sm font-semibold z-10 ${
                  !isCurrentMonth
                    ? 'text-[#A09686]'
                    : isDayToday
                    ? 'text-[#A8382A] font-bold'
                    : 'text-[#2D2A26]'
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Hand-drawn Circle / Organic Sage Highlighter for Days with Entries */}
              {isDayActive && isCurrentMonth && (
                <div
                  className="absolute inset-1 sm:inset-1.5 rounded-full bg-[#E2EDDE] border border-[#A8C7A3] opacity-90 pointer-events-none transition-transform group-hover:scale-105 shadow-xs"
                  style={{
                    borderRadius: '48% 52% 56% 44% / 46% 49% 51% 54%', // Organic sketch feel
                  }}
                />
              )}

              {/* Today Indicator Dot */}
              {isDayToday && isCurrentMonth && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#A8382A]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-3 border-t border-[#E8DFCFA] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7A6F5E]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#E2EDDE] border border-[#A8C7A3] inline-block" />
            <span>Journaled Memory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A8382A] inline-block" />
            <span>Today</span>
          </div>
        </div>
        <span className="text-[10px] italic text-[#998E7E]">Click any date to reveal or write a memory</span>
      </div>
    </div>
  );
};
