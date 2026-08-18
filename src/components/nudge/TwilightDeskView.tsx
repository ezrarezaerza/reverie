import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Feather, 
  Shuffle, 
  PenLine, 
  Check, 
  BookOpen, 
  Clock, 
  Brain,
  Quote,
  Lightbulb,
  CheckCircle
} from 'lucide-react';
import gsap from 'gsap';
import { EVENING_REFLECTION_PROMPTS } from '../../data/reflectionPromptsCatalog';
import { soundEngine } from '../../utils/soundEngine';
import { hapticsEngine } from '../../utils/hapticsEngine';
import { format } from 'date-fns';

interface TwilightDeskViewProps {
  hasWrittenToday: boolean;
  onInscribePromptToJournal: (promptIndex: number, promptText: string) => void;
  onNavigateBack: () => void;
  initialPromptIndex?: number;
}

export const TwilightDeskView: React.FC<TwilightDeskViewProps> = ({
  hasWrittenToday,
  onInscribePromptToJournal,
  onNavigateBack,
  initialPromptIndex = 0
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const parchmentRef = useRef<HTMLDivElement>(null);

  const [promptIdx, setPromptIdx] = useState<number>(initialPromptIndex);
  const currentPrompt = EVENING_REFLECTION_PROMPTS[promptIdx] || EVENING_REFLECTION_PROMPTS[0];

  useEffect(() => {
    if (parchmentRef.current) {
      gsap.fromTo(
        parchmentRef.current,
        { opacity: 0, y: 10, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [promptIdx]);

  const handleDrawNextPrompt = () => {
    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('flutter');
    setPromptIdx((prev) => (prev + 1) % EVENING_REFLECTION_PROMPTS.length);
  };

  const handleSelectPrompt = (index: number) => {
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('click');
    setPromptIdx(index);
  };

  const handleInscribe = () => {
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('completion');
    onInscribePromptToJournal(promptIdx, currentPrompt.promptText);
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#1E2723] text-[#423B30] dark:text-[#EAE5D9] hover:bg-[#EFE7D8] dark:hover:bg-[#28352F] text-xs font-semibold border border-[#D9CEBA] dark:border-[#384A40] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Journal</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDrawNextPrompt}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#232F2A] hover:bg-[#EAE2D2] text-[#A8382A] dark:text-[#F08A7D] text-xs font-bold border border-[#D5C7B2] dark:border-[#384A40] transition-colors cursor-pointer shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Draw Next Evening Seed</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A] dark:text-[#F08A7D] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Twilight Reflection Desk</span>
          </span>
          <span className="text-xs text-[#827766]">•</span>
          <span className="text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
            Nightly Cognitive Anchoring
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#FAF7F0] mt-1">
          Evening Reflection Inscriptions
        </h1>
        <p className="text-xs sm:text-sm text-[#C5BBAA] mt-1 max-w-3xl">
          Taking 90 seconds before sleep to capture a single sensory or emotional detail prevents the brain's automatic nightly consolidation filter from sweeping today into a generic blur.
        </p>
      </div>

      {/* Main Focus Parchment Card */}
      <div 
        ref={parchmentRef}
        className="relative bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-2xl border border-[#D9CEBC] dark:border-[#384A40] p-6 sm:p-10 mb-8 overflow-hidden"
      >
        {/* Top washi tape */}
        <div className="washi-tape washi-terracotta absolute -top-3 right-10 w-36 h-6 flex items-center justify-center text-[10px] font-mono font-bold text-[#4D231E]">
          TWILIGHT SEED #{promptIdx + 1}
        </div>

        {/* Current status banner */}
        <div className="mb-6">
          {!hasWrittenToday ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F4EADB] dark:bg-[#2E201E] border border-[#E0D2BE] dark:border-[#4B322E] text-xs font-medium text-[#7A4B29] dark:text-[#F08A7D]">
              <PenLine className="w-4 h-4 text-[#A8382A] shrink-0" />
              <span>Today's page is blank and waiting — anchor today with a 90-second entry.</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#EBF3ED] dark:bg-[#1E2E25] border border-[#CFE1D5] dark:border-[#325240] text-xs font-medium text-[#2E6B4E] dark:text-[#6CB28E]">
              <Check className="w-4 h-4 shrink-0" />
              <span>You have already inscribed memories for today. Adding this prompt is always welcome.</span>
            </div>
          )}
        </div>

        {/* Prompt Inscription Display */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#827766] uppercase tracking-wider mb-2">
            <Quote className="w-3.5 h-3.5 text-[#2E6B4E]" />
            <span>Prompt Focus #{promptIdx + 1} of {EVENING_REFLECTION_PROMPTS.length}</span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#24211E] dark:text-[#FAF7F0] tracking-tight mb-3">
            "{currentPrompt.promptText}"
          </h2>

          <p className="font-hand text-xl sm:text-2xl text-[#6B5738] dark:text-[#DEAC5D] leading-relaxed">
            ~ {currentPrompt.subtext}
          </p>
        </div>

        {/* Neuroscience Explanation Box */}
        <div className="bg-[#F4EEE2] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Brain className="w-4 h-4 text-[#2E6B4E] dark:text-[#5BA87E]" />
            <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2C2926] dark:text-[#FAF7F0]">
              Neurocognitive Principle
            </h4>
          </div>
          <p className="text-xs text-[#5D5344] dark:text-[#C5BBAE] leading-relaxed">
            When you recall a specific sensory or emotional moment at night, your brain re-activates the hippocampus and encodes the experience with rich episodic context. Without this deliberate review, repetitive days are merged and deleted from long-term autobiographical memory.
          </p>
        </div>

        {/* Action Button Dock */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-[#E3D8C6] dark:border-[#2C3831]">
          <button
            type="button"
            onClick={handleDrawNextPrompt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FAF8F3] dark:bg-[#232F2A] hover:bg-[#EAE2D2] text-[#423B30] dark:text-[#EAE5D9] text-xs sm:text-sm font-semibold border border-[#D5C7B2] dark:border-[#384A40] transition-colors cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-[#A8382A]" />
            <span>Draw Another Prompt</span>
          </button>

          <button
            type="button"
            onClick={handleInscribe}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Feather className="w-4 h-4" />
            <span>Inscribe This Prompt to Today's Journal →</span>
          </button>
        </div>

      </div>

      {/* Prompt Deck Matrix */}
      <div className="bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-xl border border-[#D9CEBC] dark:border-[#384A40] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-[#D9A74A]" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#2C2926] dark:text-[#FAF7F0]">
            Browse All Twilight Reflection Seeds
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EVENING_REFLECTION_PROMPTS.map((prompt, idx) => {
            const isSelected = promptIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPrompt(idx)}
                className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAE0CE] dark:bg-[#2C3831] border-[#2E6B4E] dark:border-[#5BA87E] ring-1 ring-[#2E6B4E]'
                    : 'bg-[#FCFAF5] dark:bg-[#222E28] border-[#DDD0BC] dark:border-[#384A40] hover:bg-[#F4EEE2]'
                }`}
              >
                <div className="text-[10px] font-mono font-bold text-[#A8382A] dark:text-[#F08A7D] mb-1">
                  SEED #{idx + 1}
                </div>
                <h4 className="font-display font-bold text-xs text-[#2C2926] dark:text-[#FAF7F0] leading-snug line-clamp-2">
                  "{prompt.promptText}"
                </h4>
                <p className="text-[11px] text-[#6E6454] dark:text-[#A89E8F] truncate mt-1">
                  {prompt.subtext}
                </p>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
