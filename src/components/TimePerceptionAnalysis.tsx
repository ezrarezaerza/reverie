import React from 'react';
import { Hourglass, Brain, Sparkles, Compass, Eye, ShieldCheck, TrendingUp, Calendar, Zap } from 'lucide-react';
import { MemoryEntry, NoveltyLog } from '../types';
import { TIME_PACING_METADATA, SENSORY_CUE_METADATA } from '../data/microNoveltiesCatalog';
import { TIME_PERCEPTION_SCIENCE } from '../data/reflectionPromptsCatalog';
import { BentoGridAnimations } from './BentoGridAnimations';

interface TimePerceptionAnalysisProps {
  entries: MemoryEntry[];
  noveltyLogs: NoveltyLog[];
}

export const TimePerceptionAnalysis: React.FC<TimePerceptionAnalysisProps> = ({
  entries,
  noveltyLogs
}) => {
  const totalEntries = entries.length;
  const totalNovelties = noveltyLogs.length;

  // Calculate pacing counts
  const pacingCounts = {
    slow: entries.filter(e => e.timePacing === 'slow').length,
    flow: entries.filter(e => e.timePacing === 'flow').length,
    fleeting: entries.filter(e => e.timePacing === 'fleeting').length,
    stillness: entries.filter(e => e.timePacing === 'stillness').length
  };

  // Sensory counts
  const sensoryCounts: Record<string, number> = {
    sight: 0,
    sound: 0,
    scent: 0,
    taste: 0,
    touch: 0,
    serendipity: 0
  };

  entries.forEach(e => {
    e.sensoryCues?.forEach(cue => {
      if (sensoryCounts[cue] !== undefined) {
        sensoryCounts[cue]++;
      }
    });
  });

  const slowOrStillDays = pacingCounts.slow + pacingCounts.stillness;
  const expansionPercentage = totalEntries > 0 ? Math.round((slowOrStillDays / totalEntries) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-[#FAF7F0] flex items-center gap-2">
          <span>Time Velocity & Cognitive Dilation</span>
        </h2>
        <p className="text-xs text-[#C8BDAE]">
          How micro-novelties and sensory granularity de-compress your perception of life.
        </p>
      </div>

      {/* Primary Metric Highlights (Analog planner cards with GSAP Stagger) */}
      <BentoGridAnimations className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Metric 1 */}
        <div className="bento-card-item bg-[#FAF7F1] paper-shadow rounded-xl border border-[#DCD0BD] p-5 relative overflow-hidden">
          <div className="washi-tape washi-sage absolute -top-2.5 right-4 w-20 h-4 flex items-center justify-center text-[8px] font-mono text-[#25422B] font-bold">
            TEMPORAL FLOW
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8382A]">
            Slow Time Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1 mb-1">
            <span className="font-display text-3xl font-bold text-[#2C2926]">
              {expansionPercentage}%
            </span>
            <span className="text-xs text-[#6B6150]">of inscribed days</span>
          </div>
          <p className="text-xs text-[#6D6352] leading-relaxed">
            {slowOrStillDays} out of {totalEntries} days recorded felt spacious, stillness-rich, or deliberately slowed.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bento-card-item bg-[#FAF7F1] paper-shadow rounded-xl border border-[#DCD0BD] p-5 relative overflow-hidden">
          <div className="washi-tape washi-ochre absolute -top-2.5 right-4 w-20 h-4 flex items-center justify-center text-[8px] font-mono text-[#4A340C] font-bold">
            ROUTINE BREAKS
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#B5743D]">
            Micro-Novelties Done
          </span>
          <div className="flex items-baseline gap-2 mt-1 mb-1">
            <span className="font-display text-3xl font-bold text-[#2C2926]">
              {totalNovelties}
            </span>
            <span className="text-xs text-[#6B6150]">routine interruptions</span>
          </div>
          <p className="text-xs text-[#6D6352] leading-relaxed">
            Each novelty created a fresh hippocampal bookmark in your long-term memory.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bento-card-item bg-[#FAF7F1] paper-shadow rounded-xl border border-[#DCD0BD] p-5 relative overflow-hidden">
          <div className="washi-tape washi-terracotta absolute -top-2.5 right-4 w-20 h-4 flex items-center justify-center text-[8px] font-mono text-[#4F251F] font-bold">
            SENSORY FLAGS
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1C355E]">
            Somatosensory Anchors
          </span>
          <div className="flex items-baseline gap-2 mt-1 mb-1">
            <span className="font-display text-3xl font-bold text-[#2C2926]">
              {Object.values(sensoryCounts).reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-xs text-[#6B6150]">sensory coordinates</span>
          </div>
          <p className="text-xs text-[#6D6352] leading-relaxed">
            Smell, texture, taste, and audio markers permanently bound to autobiographical episodes.
          </p>
        </div>

      </BentoGridAnimations>

      {/* Two-Column Deep Breakdown: Pacing Distribution & Sensory Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Pacing Distribution */}
        <div className="bg-[#FAF8F3] paper-shadow rounded-xl border border-[#DCD0BD] p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DAC8]">
            <h3 className="font-display font-bold text-base text-[#2C2926]">
              Subjective Pace Distribution
            </h3>
            <span className="text-xs text-[#807462]">Memory Density</span>
          </div>

          <div className="space-y-3.5">
            {(Object.keys(TIME_PACING_METADATA) as (keyof typeof pacingCounts)[]).map(key => {
              const meta = TIME_PACING_METADATA[key];
              const count = pacingCounts[key] || 0;
              const percent = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-[#383228]">
                      <span>{meta.symbol}</span>
                      <span>{meta.label}</span>
                    </div>
                    <span className="font-mono text-[#665D4F]">{count} days ({percent}%)</span>
                  </div>

                  {/* Tactile progress bar */}
                  <div className="w-full h-2.5 bg-[#EAE0CE] rounded-full overflow-hidden">
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
        <div className="bg-[#FAF8F3] paper-shadow rounded-xl border border-[#DCD0BD] p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E5DAC8]">
            <h3 className="font-display font-bold text-base text-[#2C2926]">
              Sensory Coordinate Channels
            </h3>
            <span className="text-xs text-[#807462]">Anchors Recorded</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.keys(SENSORY_CUE_METADATA).map(cue => {
              const meta = SENSORY_CUE_METADATA[cue];
              const count = sensoryCounts[cue] || 0;

              return (
                <div 
                  key={cue}
                  className="bg-[#F3ECE0] border border-[#DDD1BE] rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{meta.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-[#2C2926] capitalize">{cue}</div>
                      <div className="text-[10px] text-[#7A6F5D]">{meta.label}</div>
                    </div>
                  </div>
                  <span className="font-display font-bold text-base text-[#1C355E]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* The Neuroscience Principles (Analog Folio Guide) */}
      <div className="bg-[#FAF7F1] paper-shadow rounded-xl border border-[#DCD0BD] p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-[#A8382A]" />
          <h3 className="font-display font-bold text-lg text-[#2C2926]">
            The Cognitive Neuroscience of Temporal Dilation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIME_PERCEPTION_SCIENCE.map((item, i) => (
            <div key={i} className="bg-[#F4EDE0] border border-[#DDD1BE] p-4 rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="font-display font-bold text-sm text-[#2C2926] mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] font-hand text-base text-[#7A4B28] mb-2">
                  — {item.subtitle}
                </p>
                <p className="text-xs text-[#524B3F] leading-relaxed">
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
