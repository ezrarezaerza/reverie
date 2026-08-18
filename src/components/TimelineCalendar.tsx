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
import { ScallopStamp } from './ScallopStamp';

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
    <div className="w-full bg-[#FAF8F2] dark:bg-[#1E2622] rounded-2xl border border-[#DCD1BF] dark:border-[#38463F] p-5 sm:p-7 shadow-[0_2px_4px_rgba(0,0,0,0.04),0_8px_16px_rgba(40,30,20,0.08)] relative overflow-hidden">
      {/* Skeuomorphic Washi Tape Accent at Top Center */}
      <div 
        className="washi-tape washi-ochre absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-6 flex items-center justify-center pointer-events-none shadow-xs z-10"
        style={{ transform: 'translateX(-50%) rotate(-0.6deg)' }}
      >
        <span className="text-[9px] font-mono font-bold tracking-widest text-[#4A3716] uppercase select-none">
          TIMELINE OVERVIEW
        </span>
      </div>

      {/* Planner Header: Month & Year display with Controls */}
      <div className="flex items-center justify-between mb-5 pt-2 pb-3 border-b border-dashed border-[#D5C7B4] dark:border-[#38463F]">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg text-[#6B604F] dark:text-[#C4B8A5] hover:bg-[#EAE0CE] dark:hover:bg-[#2B3530] hover:text-[#2A2723] transition-colors cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#2A2723] dark:text-[#FAF7F0] tracking-wide lowercase">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <p className="text-xs font-hand text-lg text-[#7C6E59] dark:text-[#A89E8F] -mt-0.5">
            {memoriesThisMonth} {memoriesThisMonth === 1 ? 'memory seal' : 'memory seals'} stamped this month
          </p>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg text-[#6B604F] dark:text-[#C4B8A5] hover:bg-[#EAE0CE] dark:hover:bg-[#2B3530] hover:text-[#2A2723] transition-colors cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday Labels Grid */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-[11px] font-bold uppercase tracking-wider text-[#8A7D6B] dark:text-[#9E9383] font-mono py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid with 12-Lobed Scalloped Rosette Stamps */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 place-items-center">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isDayActive = hasEntry(day);
          const isDaySelected = isSelected(day);
          const isDayToday = isToday(day);

          return (
            <div key={day.toISOString()} className="w-full flex justify-center py-1">
              <ScallopStamp
                dayNumber={format(day, 'd')}
                isFilled={isDayActive && isCurrentMonth}
                isSelected={isDaySelected}
                isToday={isDayToday && isCurrentMonth}
                variant="ochre"
                size="md"
                disabled={!isCurrentMonth}
                title={`${format(day, 'MMM d, yyyy')}${isDayActive ? ' (Memory recorded)' : ''}`}
                onClick={() => {
                  soundEngine.playPencilScratchSound();
                  onDayClick(day);
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-3.5 border-t border-[#E8DFCFA] dark:border-[#38463F] flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E5A338] shadow-2xs inline-block" />
            <span className="font-medium">Recorded Memory Stamp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A8382A] inline-block" />
            <span>Today</span>
          </div>
        </div>
        <span className="text-[11px] italic text-[#998E7E] dark:text-[#887F72]">
          Tap any stamp to view or write an entry
        </span>
      </div>
    </div>
  );
};
