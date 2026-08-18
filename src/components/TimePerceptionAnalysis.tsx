import React, { useState, useMemo } from 'react';
import { 
  Hourglass, 
  Brain, 
  Sparkles, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Calendar, 
  History, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter
} from 'lucide-react';
import { MemoryEntry, NoveltyLog, TimePacing } from '../types';
import { TIME_PACING_METADATA, SENSORY_CUE_METADATA } from '../data/microNoveltiesCatalog';
import { TIME_PERCEPTION_SCIENCE } from '../data/reflectionPromptsCatalog';
import { BentoGridAnimations } from './BentoGridAnimations';
import { soundEngine } from '../utils/soundEngine';

interface TimePerceptionAnalysisProps {
  entries: MemoryEntry[];
  noveltyLogs: NoveltyLog[];
}

interface YearStats {
  year: string;
  totalEntries: number;
  totalNovelties: number;
  slowTimeDays: number;
  slowTimeRate: number;
  sensoryAnchorCount: number;
  dominantPacing: { key: TimePacing; label: string; symbol: string; count: number } | null;
  pacingCounts: Record<TimePacing, number>;
}

export const TimePerceptionAnalysis: React.FC<TimePerceptionAnalysisProps> = ({
  entries,
  noveltyLogs
}) => {
  // Extract all available years from entries and novelty logs
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    entries.forEach(e => {
      if (e.date && e.date.length >= 4) {
        yearsSet.add(e.date.slice(0, 4));
      }
    });
    noveltyLogs.forEach(l => {
      if (l.completedAt && l.completedAt.length >= 4) {
        yearsSet.add(l.completedAt.slice(0, 4));
      }
    });
    // If no entries, at least provide current year
    if (yearsSet.size === 0) {
      yearsSet.add(new Date().getFullYear().toString());
    }
    return Array.from(yearsSet).sort((a, b) => b.localeCompare(a));
  }, [entries, noveltyLogs]);

  // Selected filter: 'ALL' or specific year ('2026', '2025', etc.)
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');

  // Filtered dataset for main view
  const filteredEntries = useMemo(() => {
    if (selectedYearFilter === 'ALL') return entries;
    return entries.filter(e => e.date && e.date.startsWith(selectedYearFilter));
  }, [entries, selectedYearFilter]);

  const filteredNoveltyLogs = useMemo(() => {
    if (selectedYearFilter === 'ALL') return noveltyLogs;
    return noveltyLogs.filter(l => l.completedAt && l.completedAt.startsWith(selectedYearFilter));
  }, [noveltyLogs, selectedYearFilter]);

  // Metric calculations for the currently filtered view
  const totalEntries = filteredEntries.length;
  const totalNovelties = filteredNoveltyLogs.length;

  const pacingCounts = useMemo(() => ({
    slow: filteredEntries.filter(e => e.timePacing === 'slow').length,
    flow: filteredEntries.filter(e => e.timePacing === 'flow').length,
    fleeting: filteredEntries.filter(e => e.timePacing === 'fleeting').length,
    stillness: filteredEntries.filter(e => e.timePacing === 'stillness').length
  }), [filteredEntries]);

  const sensoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      sight: 0,
      sound: 0,
      scent: 0,
      taste: 0,
      touch: 0,
      serendipity: 0
    };
    filteredEntries.forEach(e => {
      e.sensoryCues?.forEach(cue => {
        if (counts[cue] !== undefined) {
          counts[cue]++;
        }
      });
    });
    return counts;
  }, [filteredEntries]);

  const slowOrStillDays = pacingCounts.slow + pacingCounts.stillness;
  const expansionPercentage = totalEntries > 0 ? Math.round((slowOrStillDays / totalEntries) * 100) : 0;
  const totalSensoryFlags = Object.values(sensoryCounts).reduce((acc: number, val: number) => acc + val, 0);

  // Compute Year-over-Year (YoY) Statistics for all available years
  const yearByYearStats = useMemo(() => {
    const stats: YearStats[] = availableYears.map(year => {
      const yearEntries = entries.filter(e => e.date && e.date.startsWith(year));
      const yearNovelties = noveltyLogs.filter(l => l.completedAt && l.completedAt.startsWith(year));
      
      const yearPacingCounts: Record<TimePacing, number> = {
        slow: yearEntries.filter(e => e.timePacing === 'slow').length,
        flow: yearEntries.filter(e => e.timePacing === 'flow').length,
        fleeting: yearEntries.filter(e => e.timePacing === 'fleeting').length,
        stillness: yearEntries.filter(e => e.timePacing === 'stillness').length
      };

      const yearSlowOrStill = yearPacingCounts.slow + yearPacingCounts.stillness;
      const rate = yearEntries.length > 0 ? Math.round((yearSlowOrStill / yearEntries.length) * 100) : 0;

      let sensoryTotal = 0;
      yearEntries.forEach(e => {
        sensoryTotal += e.sensoryCues?.length || 0;
      });

      // Find dominant pacing
      let dominant: YearStats['dominantPacing'] = null;
      let maxCount = -1;
      (Object.keys(yearPacingCounts) as TimePacing[]).forEach(k => {
        if (yearPacingCounts[k] > maxCount && yearPacingCounts[k] > 0) {
          maxCount = yearPacingCounts[k];
          dominant = {
            key: k,
            label: TIME_PACING_METADATA[k]?.label || k,
            symbol: TIME_PACING_METADATA[k]?.symbol || '⏳',
            count: yearPacingCounts[k]
          };
        }
      });

      return {
        year,
        totalEntries: yearEntries.length,
        totalNovelties: yearNovelties.length,
        slowTimeDays: yearSlowOrStill,
        slowTimeRate: rate,
        sensoryAnchorCount: sensoryTotal,
        dominantPacing: dominant,
        pacingCounts: yearPacingCounts
      };
    });

    return stats;
  }, [availableYears, entries, noveltyLogs]);

  const handleFilterClick = (year: string) => {
    soundEngine.playPaperTurnSound();
    setSelectedYearFilter(year);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Header & Year Filtering Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E5DAC8] dark:border-[#2C3831]">
        <div>
          <h2 className="font-display font-bold text-2xl text-[#FAF7F0] flex items-center gap-2">
            <span>Time Velocity & Cognitive Dilation</span>
          </h2>
          <p className="text-xs text-[#C8BDAE]">
            How micro-novelties and sensory granularity de-compress your perception of life.
          </p>
        </div>

        {/* Year Filter Capsule Selector */}
        <div className="flex items-center gap-1.5 bg-[#FAF7F0] dark:bg-[#1E2522] border border-[#DDD3C1] dark:border-[#38463F] p-1 rounded-xl shadow-xs self-start md:self-auto overflow-x-auto max-w-full">
          <div className="flex items-center gap-1 px-2 text-[11px] font-bold text-[#7A6F5E] dark:text-[#A89E8F] uppercase tracking-wider shrink-0">
            <Filter className="w-3 h-3 text-[#A8382A] dark:text-[#E07A6D]" />
            <span>Scope:</span>
          </div>

          <button
            type="button"
            onClick={() => handleFilterClick('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedYearFilter === 'ALL'
                ? 'bg-[#1C355E] dark:bg-[#9EC0F4] text-[#FAF7F0] dark:text-[#111A16] shadow-2xs'
                : 'text-[#605546] dark:text-[#C5BBAE] hover:text-[#1A1816] dark:hover:text-[#FAF7F0] hover:bg-[#EFE7D8] dark:hover:bg-[#28322E]'
            }`}
          >
            All Time
          </button>

          {availableYears.map(year => (
            <button
              key={year}
              type="button"
              onClick={() => handleFilterClick(year)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                selectedYearFilter === year
                  ? 'bg-[#1C355E] dark:bg-[#9EC0F4] text-[#FAF7F0] dark:text-[#111A16] shadow-2xs'
                  : 'text-[#605546] dark:text-[#C5BBAE] hover:text-[#1A1816] dark:hover:text-[#FAF7F0] hover:bg-[#EFE7D8] dark:hover:bg-[#28322E]'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Metric Highlights (Analog planner cards with GSAP Stagger) */}
      <BentoGridAnimations className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Metric 1 */}
        <div className="bento-card-item bg-[#FAF7F1] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-5 relative overflow-hidden">
          <div className="washi-tape washi-sage absolute -top-2.5 right-4 w-24 h-4 flex items-center justify-center text-[8px] font-mono text-[#25422B] font-bold uppercase">
            {selectedYearFilter === 'ALL' ? 'ALL-TIME FLOW' : `${selectedYearFilter} FLOW`}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8382A] dark:text-[#E07A6D]">
            Slow Time Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1 mb-1">
            <span className="font-display text-3xl font-bold text-[#2C2926] dark:text-[#FAF7F0]">
              {expansionPercentage}%
            </span>
            <span className="text-xs text-[#6B6150] dark:text-[#A89E8F]">
              {selectedYearFilter === 'ALL' ? 'of all recorded days' : `of ${selectedYearFilter} days`}
            </span>
          </div>
          <p className="text-xs text-[#6D6352] dark:text-[#BDB2A2] leading-relaxed">
            {slowOrStillDays} out of {totalEntries} days recorded felt spacious, stillness-rich, or deliberately slowed.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bento-card-item bg-[#FAF7F1] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-5 relative overflow-hidden">
          <div className="washi-tape washi-ochre absolute -top-2.5 right-4 w-24 h-4 flex items-center justify-center text-[8px] font-mono text-[#4A340C] font-bold uppercase">
            {selectedYearFilter === 'ALL' ? 'ROUTINE BREAKS' : `${selectedYearFilter} NOVELTIES`}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5743D] dark:text-[#E2A77B]">
            Micro-Novelties Done
          </span>
          <div className="flex items-baseline gap-2 mt-1 mb-1">
            <span className="font-display text-3xl font-bold text-[#2C2926] dark:text-[#FAF7F0]">
              {totalNovelties}
            </span>
            <span className="text-xs text-[#6B6150] dark:text-[#A89E8F]">routine interruptions</span>
          </div>
          <p className="text-xs text-[#6D6352] dark:text-[#BDB2A2] leading-relaxed">
            Each novelty created a fresh hippocampal bookmark in your long-term memory.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bento-card-item bg-[#FAF7F1] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-5 relative overflow-hidden">
          <div className="washi-tape washi-terracotta absolute -top-2.5 right-4 w-24 h-4 flex items-center justify-center text-[8px] font-mono text-[#4F251F] font-bold uppercase">
            {selectedYearFilter === 'ALL' ? 'SENSORY FLAGS' : `${selectedYearFilter} ANCHORS`}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C355E] dark:text-[#9EC0F4]">
            Somatosensory Anchors
          </span>
          <div className="flex items-baseline gap-2 mt-1 mb-1">
            <span className="font-display text-3xl font-bold text-[#2C2926] dark:text-[#FAF7F0]">
              {totalSensoryFlags}
            </span>
            <span className="text-xs text-[#6B6150] dark:text-[#A89E8F]">sensory coordinates</span>
          </div>
          <p className="text-xs text-[#6D6352] dark:text-[#BDB2A2] leading-relaxed">
            Smell, texture, taste, and audio markers permanently bound to autobiographical episodes.
          </p>
        </div>

      </BentoGridAnimations>

      {/* Year-over-Year (YoY) Evolution & Comparison Feature */}
      <div className="bg-[#FAF8F3] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-5 sm:p-7 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E5DAC8] dark:border-[#33423A]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#A8382A] dark:text-[#E07A6D]" />
            <h3 className="font-display font-bold text-lg text-[#2C2926] dark:text-[#FAF7F0]">
              Year-over-Year Temporal Evolution
            </h3>
          </div>
          <span className="text-xs text-[#807462] dark:text-[#A89E8F]">
            Historical context of engagement & time perception
          </span>
        </div>

        {/* YoY Comparative Progression Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {yearByYearStats.map((yearStat, index) => {
            const previousYearStat = yearByYearStats[index + 1]; // chronological prior year (since sorted desc)
            
            // Calculate YoY deltas if previous year exists
            const entriesDelta = previousYearStat ? yearStat.totalEntries - previousYearStat.totalEntries : null;
            const noveltiesDelta = previousYearStat ? yearStat.totalNovelties - previousYearStat.totalNovelties : null;
            const rateDelta = previousYearStat ? yearStat.slowTimeRate - previousYearStat.slowTimeRate : null;

            return (
              <div 
                key={yearStat.year}
                className={`bg-[#F4EDE0] dark:bg-[#25302A] border rounded-xl p-4 transition-all ${
                  selectedYearFilter === yearStat.year 
                    ? 'border-[#2E6B4E] dark:border-[#5BA87E] ring-1 ring-[#2E6B4E] dark:ring-[#5BA87E] shadow-sm'
                    : 'border-[#DDD1BE] dark:border-[#33423A]'
                }`}
              >
                {/* Year Header & Dominant Pacing */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-dashed border-[#DDD0BC] dark:border-[#38463F]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#A8382A] dark:text-[#E07A6D]" />
                    <span className="font-display font-bold text-base text-[#2C2926] dark:text-[#FAF7F0]">
                      {yearStat.year}
                    </span>
                  </div>

                  {yearStat.dominantPacing ? (
                    <span className="text-[11px] font-medium bg-[#E8DFC9] dark:bg-[#1E2723] text-[#554E40] dark:text-[#C5BBAE] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>{yearStat.dominantPacing.symbol}</span>
                      <span className="truncate max-w-[100px]">{yearStat.dominantPacing.label}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#8C8170] dark:text-[#8E8373]">No pacing data</span>
                  )}
                </div>

                {/* Key Metrics for the Year with YoY Delta Badges */}
                <div className="space-y-2.5 text-xs">
                  
                  {/* Slow Time Rate */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#6D6352] dark:text-[#A89E8F]">Slow Time Rate:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-bold text-sm text-[#2C2926] dark:text-[#FAF7F0]">
                        {yearStat.slowTimeRate}%
                      </span>
                      {rateDelta !== null && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                          rateDelta > 0 
                            ? 'text-[#1E5C3A] bg-[#D8ECE0] dark:text-[#90D4AB] dark:bg-[#1B3527]' 
                            : rateDelta < 0 
                            ? 'text-[#8C3A27] bg-[#FCE8E6] dark:text-[#F08A7D] dark:bg-[#3D211E]' 
                            : 'text-[#6D6352] bg-[#EAE0CE] dark:text-[#A89E8F] dark:bg-[#28352F]'
                        }`}>
                          {rateDelta > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : rateDelta < 0 ? <ArrowDownRight className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                          {rateDelta > 0 ? `+${rateDelta}%` : `${rateDelta}%`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Journal Inscriptions */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#6D6352] dark:text-[#A89E8F]">Journal Inscriptions:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#2C2926] dark:text-[#FAF7F0]">
                        {yearStat.totalEntries} days
                      </span>
                      {entriesDelta !== null && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          entriesDelta > 0 
                            ? 'text-[#1E5C3A] bg-[#D8ECE0] dark:text-[#90D4AB] dark:bg-[#1B3527]' 
                            : entriesDelta < 0 
                            ? 'text-[#8C3A27] bg-[#FCE8E6] dark:text-[#F08A7D] dark:bg-[#3D211E]' 
                            : 'text-[#6D6352] bg-[#EAE0CE] dark:text-[#A89E8F] dark:bg-[#28352F]'
                        }`}>
                          {entriesDelta > 0 ? `+${entriesDelta}` : entriesDelta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Micro-Novelties Done */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#6D6352] dark:text-[#A89E8F]">Novelties Completed:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-[#2C2926] dark:text-[#FAF7F0]">
                        {yearStat.totalNovelties}
                      </span>
                      {noveltiesDelta !== null && (
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          noveltiesDelta > 0 
                            ? 'text-[#1E5C3A] bg-[#D8ECE0] dark:text-[#90D4AB] dark:bg-[#1B3527]' 
                            : noveltiesDelta < 0 
                            ? 'text-[#8C3A27] bg-[#FCE8E6] dark:text-[#F08A7D] dark:bg-[#3D211E]' 
                            : 'text-[#6D6352] bg-[#EAE0CE] dark:text-[#A89E8F] dark:bg-[#28352F]'
                        }`}>
                          {noveltiesDelta > 0 ? `+${noveltiesDelta}` : noveltiesDelta}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sensory Anchors */}
                  <div className="flex items-center justify-between">
                    <span className="text-[#6D6352] dark:text-[#A89E8F]">Sensory Coordinates:</span>
                    <span className="font-mono font-semibold text-[#1C355E] dark:text-[#9EC0F4]">
                      {yearStat.sensoryAnchorCount}
                    </span>
                  </div>

                </div>

                {/* Progress bar representing slow time rate */}
                <div className="mt-3 pt-2 border-t border-[#E5DAC8] dark:border-[#33423A]">
                  <div className="flex justify-between text-[10px] text-[#7A6F5D] dark:text-[#A89E8F] mb-1">
                    <span>Temporal Dilation Bar</span>
                    <span>{yearStat.slowTimeDays} spacious days</span>
                  </div>
                  <div className="w-full h-2 bg-[#E0D5C3] dark:bg-[#1C2520] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#2E6B4E] dark:bg-[#5BA87E] rounded-full transition-all duration-500"
                      style={{ width: `${yearStat.slowTimeRate}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Narrative Takeaway / Cognitive Summary */}
        <div className="bg-[#F0EAE0] dark:bg-[#1A221E] border border-[#DDD0BC] dark:border-[#33423A] rounded-lg p-3.5 text-xs text-[#554E40] dark:text-[#C5BBAE] flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-[#B5743D] dark:text-[#E2A77B] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[#2C2926] dark:text-[#FAF7F0]">Historical Takeaway: </span>
            {yearByYearStats.length > 1 ? (
              <>
                Year-over-year progression demonstrates how conscious breaks in daily routine and tactile recording directly expand autobiographical recall and prevent calendar weeks from blurring together.
              </>
            ) : (
              <>
                Currently tracking baseline data for <strong>{yearByYearStats[0]?.year}</strong>. As you continue recording daily memories and completing micro-novelties over time, this panel will automatically calculate multi-year comparative trajectories and time-dilation shifts.
              </>
            )}
          </div>
        </div>

      </div>

      {/* Two-Column Deep Breakdown: Pacing Distribution & Sensory Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Pacing Distribution */}
        <div className="bg-[#FAF8F3] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DAC8] dark:border-[#33423A]">
            <h3 className="font-display font-bold text-base text-[#2C2926] dark:text-[#FAF7F0]">
              Subjective Pace Distribution
            </h3>
            <span className="text-xs text-[#807462] dark:text-[#A89E8F]">
              {selectedYearFilter === 'ALL' ? 'All Time' : selectedYearFilter}
            </span>
          </div>

          <div className="space-y-3.5">
            {(['slow', 'flow', 'fleeting', 'stillness'] as TimePacing[]).map(key => {
              const meta = TIME_PACING_METADATA[key];
              const count = pacingCounts[key] || 0;
              const percent = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-[#383228] dark:text-[#EAE5D9]">
                      <span>{meta.symbol}</span>
                      <span>{meta.label}</span>
                    </div>
                    <span className="font-mono text-[#665D4F] dark:text-[#A89E8F]">{count} days ({percent}%)</span>
                  </div>

                  {/* Tactile progress bar */}
                  <div className="w-full h-2.5 bg-[#EAE0CE] dark:bg-[#28322E] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percent}%`,
                        backgroundColor: meta.color
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sensory Spectrum */}
        <div className="bg-[#FAF8F3] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DAC8] dark:border-[#33423A]">
            <h3 className="font-display font-bold text-base text-[#2C2926] dark:text-[#FAF7F0]">
              Sensory Coordinate Channels
            </h3>
            <span className="text-xs text-[#807462] dark:text-[#A89E8F]">
              {selectedYearFilter === 'ALL' ? 'All Time' : selectedYearFilter}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.keys(SENSORY_CUE_METADATA).map(cue => {
              const meta = SENSORY_CUE_METADATA[cue];
              const count = sensoryCounts[cue] || 0;

              return (
                <div 
                  key={cue}
                  className="bg-[#F3ECE0] dark:bg-[#25302A] border border-[#DDD1BE] dark:border-[#33423A] rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-[#2C2926] dark:text-[#FAF7F0] capitalize">{cue}</div>
                      <div className="text-[10px] text-[#7A6F5D] dark:text-[#A89E8F]">{meta.label}</div>
                    </div>
                  </div>
                  <span className="font-display font-bold text-base text-[#1C355E] dark:text-[#9EC0F4]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* The Neuroscience Principles (Analog Folio Guide) */}
      <div className="bg-[#FAF7F1] dark:bg-[#1E2622] paper-shadow rounded-xl border border-[#DCD0BD] dark:border-[#38463F] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#A8382A] dark:text-[#E07A6D]" />
          <h3 className="font-display font-bold text-lg text-[#2C2926] dark:text-[#FAF7F0]">
            The Cognitive Neuroscience of Temporal Dilation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIME_PERCEPTION_SCIENCE.map((item, i) => (
            <div key={i} className="bg-[#F4EDE0] dark:bg-[#25302A] border border-[#DDD1BE] dark:border-[#33423A] p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#2C2926] dark:text-[#FAF7F0] mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] font-hand text-base text-[#7A4B28] dark:text-[#D1B88D] mb-2">
                  — {item.subtitle}
                </p>
                <p className="text-xs text-[#524B3F] dark:text-[#BDB2A2] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
