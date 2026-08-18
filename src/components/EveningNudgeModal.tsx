import React, { useMemo } from 'react';
import { ModalPortal } from './ModalPortal';
import { X, Sparkles, Feather, ArrowRight, Shuffle, PenLine, Check } from 'lucide-react';
import { EVENING_REFLECTION_PROMPTS } from '../data/reflectionPromptsCatalog';
import { memoryStorage } from '../utils/storage';
import { soundEngine } from '../utils/soundEngine';
import { format } from 'date-fns';

interface EveningNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTodayJournal: (promptIndex: number, promptText: string) => void;
  hasWrittenToday?: boolean;
}

export const EveningNudgeModal: React.FC<EveningNudgeModalProps> = ({
  isOpen,
  onClose,
  onJumpToTodayJournal,
  hasWrittenToday: propHasWrittenToday
}) => {
  const [promptIdx, setPromptIdx] = React.useState(0);

  // Determine if user has already written in today's journal entry
  const hasWritten = useMemo(() => {
    if (typeof propHasWrittenToday === 'boolean') {
      return propHasWrittenToday;
    }
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const entries = memoryStorage.getEntries();
    return entries.some(
      (e) => e.date === todayStr && ((e.body && e.body.trim().length > 0) || (e.title && e.title.trim().length > 0))
    );
  }, [propHasWrittenToday, isOpen]);

  if (!isOpen) return null;

  const currentPrompt = EVENING_REFLECTION_PROMPTS[promptIdx];

  const handleShuffle = () => {
    soundEngine.playPaperTurnSound();
    setPromptIdx((prev) => (prev + 1) % EVENING_REFLECTION_PROMPTS.length);
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
        <div className="relative bg-[#FAF7F1] ruled-paper paper-shadow-lifted rounded-xl border border-[#D5C7B4] max-w-lg w-full p-6 sm:p-8">
        
        {/* Washi Tape Header */}
        <div className="washi-tape washi-terracotta absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 flex items-center justify-center text-[10px] font-mono font-bold text-[#4D231E]">
          NIGHTLY NUDGE
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-[#7D7260] hover:text-[#2C2926] hover:bg-[#EAE0CE] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pt-2 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Evening Check-In</span>
            </span>

            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 text-[11px] text-[#695D4A] hover:text-[#2C2926] bg-[#EAE0CE] px-2 py-0.5 rounded transition-colors cursor-pointer"
            >
              <Shuffle className="w-3 h-3" />
              <span>Draw Another</span>
            </button>
          </div>

          <h3 className="font-display font-bold text-2xl text-[#2B2723] mb-2 leading-snug">
            "{currentPrompt.promptText}"
          </h3>

          <p className="text-xs text-[#6E6454] italic mb-4">
            {currentPrompt.subtext}
          </p>

          <div className="bg-[#F3ECE0] border-l-3 border-[#2E6B4E] p-3.5 rounded-r text-xs text-[#4A4234] leading-relaxed">
            Taking 90 seconds to capture this simple observation halts the brain's automatic consolidation dump, turning an otherwise forgotten day into a permanent memory landmark.
          </div>
        </div>

        {/* Today's Writing Status Gentle Banner */}
        {!hasWritten ? (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded bg-[#F4EADB] border border-[#E0D2BE] text-[11px] text-[#7A4B29]">
            <PenLine className="w-3.5 h-3.5 shrink-0 text-[#A8382A]" />
            <span>Today's page is waiting for your pen — pause for 90 seconds to preserve today.</span>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded bg-[#EBF3ED] border border-[#CFE1D5] text-[11px] text-[#2E6B4E]">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>You have already recorded reflections for today. Add more anytime.</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-[#DED2BF]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#6B5F4E] hover:text-[#2C2926] cursor-pointer"
          >
            Maybe Later
          </button>

          <button
            onClick={() => {
              onClose();
              onJumpToTodayJournal(promptIdx, currentPrompt.promptText);
              soundEngine.playPencilScratchSound();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
              !hasWritten
                ? 'bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] animate-gentle-pulse ring-2 ring-[#2E6B4E]/40'
                : 'bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0]'
            }`}
            title={!hasWritten ? "Today's journal has not been written yet" : 'Inscribe this reflection'}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Inscribe in Journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
    </ModalPortal>
  );
};

