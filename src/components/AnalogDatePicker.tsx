import React, { useState, useRef, useEffect } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday as checkIsToday,
  format,
} from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RotateCcw, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { getLocalDateString, parseLocalDate, formatDisplayDate } from '../utils/dateUtils';
import { ScallopStamp } from './ScallopStamp';

interface AnalogDatePickerProps {
  selectedDate: string; // 'YYYY-MM-DD'
  onSelectDate: (dateStr: string) => void;
  activeDates?: string[]; // list of dates with recorded memories
  labelFormat?: 'full' | 'medium' | 'short';
  className?: string;
  showTodayBadge?: boolean;
  align?: 'left' | 'center' | 'right';
  variant?: 'pill' | 'bare';
}

export const AnalogDatePicker: React.FC<AnalogDatePickerProps> = ({
  selectedDate,
  onSelectDate,
  activeDates = [],
  labelFormat = 'full',
  className = '',
  showTodayBadge = true,
  align = 'center',
  variant = 'bare',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDateObj = parseLocalDate(selectedDate);
  const [viewMonth, setViewMonth] = useState<Date>(selectedDateObj);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view month whenever selectedDate changes
  useEffect(() => {
    setViewMonth(parseLocalDate(selectedDate));
  }, [selectedDate]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayStr = getLocalDateString();
  const isSelectedDateToday = selectedDate === todayStr;

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPaperTurnSound();
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPaperTurnSound();
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
  };

  const handleDaySelect = (day: Date) => {
    soundEngine.playPencilScratchSound();
    const dateStr = getLocalDateString(day);
    onSelectDate(dateStr);
    setIsOpen(false);
  };

  const handleJumpToToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPaperTurnSound();
    onSelectDate(todayStr);
    setViewMonth(new Date());
    setIsOpen(false);
  };

  const formattedDisplay = formatDisplayDate(
    selectedDate,
    labelFormat === 'full'
      ? { month: 'long', day: 'numeric', year: 'numeric' } // e.g. August 17, 2026
      : labelFormat === 'medium'
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric' }
  );

  return (
    <div className={`relative flex items-center justify-center ${className}`} ref={containerRef}>
      {/* Trigger Button: Full version and Center-aligned */}
      <button
        type="button"
        onClick={() => {
          soundEngine.playPaperTurnSound();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer group select-none text-center ${
          variant === 'bare'
            ? 'px-2 py-1 hover:bg-[#EFE7D8] dark:hover:bg-[#28322E] rounded-md'
            : 'bg-[#FAF7F0] dark:bg-[#1E2522] hover:bg-[#EFE7D8] dark:hover:bg-[#28322E] border border-[#DDD3C1] dark:border-[#38463F] hover:border-[#2E6B4E] px-2.5 sm:px-3 py-1.5 rounded-lg shadow-sm'
        }`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="w-4 h-4 text-[#A8382A] dark:text-[#E07A6D] group-hover:scale-110 transition-transform shrink-0" />
        <span className="font-display font-bold text-sm sm:text-base text-[#1E3A8A] dark:text-[#9EC0F4] tracking-tight whitespace-nowrap">
          {formattedDisplay}
        </span>
        {showTodayBadge && isSelectedDateToday && (
          <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-[#D8ECE0] dark:bg-[#253D30] text-[#1E5C3A] dark:text-[#90D4AB] rounded-full shrink-0">
            TODAY
          </span>
        )}
      </button>

      {/* Calendar Dropdown Popover */}
      {isOpen && (
        <div 
          className={`absolute z-50 mt-2 w-[300px] sm:w-[320px] max-w-[94vw] bg-[#FAF8F3] dark:bg-[#1E2622] border border-[#D5C6B1] dark:border-[#38463F] rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_28px_rgba(30,20,10,0.22)] animate-in fade-in zoom-in-95 duration-150 text-[#2C2926] dark:text-[#E8E0D2] ${
            align === 'left' 
              ? 'left-0' 
              : align === 'right' 
              ? 'right-0' 
              : 'left-1/2 -translate-x-1/2'
          }`}
          style={{ transformOrigin: 'top center' }}
        >
          {/* Popover Header: Month & Year Navigator */}
          <div className="flex items-center justify-between pt-0.5 pb-2 mb-2 border-b border-dashed border-[#DDD0BC] dark:border-[#38463F]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-[#5A5040] dark:text-[#C4B8A5] hover:bg-[#EAE0CD] dark:hover:bg-[#2B3530] transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="font-display font-bold text-sm text-[#2A2723] dark:text-[#EAE3D5]">
                {format(viewMonth, 'MMMM yyyy')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-[#5A5040] dark:text-[#C4B8A5] hover:bg-[#EAE0CD] dark:hover:bg-[#2B3530] transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-[10px] font-mono font-bold uppercase text-[#8C7F6E] dark:text-[#A89E8F]">
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid with Scalloped Sunburst Rosette Seals */}
          <div className="grid grid-cols-7 gap-1 place-items-center">
            {calendarDays.map((day) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDateObj);
              const isDayToday = checkIsToday(day);
              const dayStr = getLocalDateString(day);
              const hasMemory = activeDates.includes(dayStr);

              return (
                <div key={day.toISOString()} className="w-full flex justify-center py-0.5">
                  <ScallopStamp
                    dayNumber={format(day, 'd')}
                    isFilled={hasMemory && isCurrentMonth}
                    isSelected={isSelected}
                    isToday={isDayToday && isCurrentMonth}
                    variant={hasMemory ? 'ochre' : 'ochre'}
                    size="sm"
                    disabled={!isCurrentMonth}
                    title={`${format(day, 'MMM d, yyyy')}${hasMemory ? ' (Memory recorded)' : ''}`}
                    onClick={() => handleDaySelect(day)}
                  />
                </div>
              );
            })}
          </div>

          {/* Footer Controls: Jump to Today & Close */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-dashed border-[#DDD0BC] dark:border-[#38463F] text-xs">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="flex items-center gap-1 text-[11px] font-medium text-[#2E6B4E] dark:text-[#5BA87E] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Jump to Today</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#8C7F6E] dark:text-[#A89E8F] flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5A338] inline-block" /> Memory
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-0.5 text-[11px] text-[#7A6F5E] dark:text-[#A89E8F] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] px-1.5 py-0.5 rounded hover:bg-[#EAE0CD] dark:hover:bg-[#2B3530] cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
