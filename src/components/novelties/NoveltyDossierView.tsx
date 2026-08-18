import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Sparkles, 
  CheckCircle, 
  Check, 
  Wrench, 
  Play, 
  Pause, 
  RotateCcw, 
  Pencil, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Brain,
  Compass,
  Eye,
  Coffee,
  Feather,
  Heart,
  Ear
} from 'lucide-react';
import confetti from 'canvas-confetti';
import gsap from 'gsap';
import { MicroNovelty, SensoryCue } from '../../types';
import { MICRO_NOVELTIES_CATALOG, SENSORY_CUE_METADATA } from '../../data/microNoveltiesCatalog';
import { soundEngine } from '../../utils/soundEngine';
import { hapticsEngine } from '../../utils/hapticsEngine';

interface NoveltyDossierViewProps {
  noveltyId: string;
  customNovelties: MicroNovelty[];
  activeNovelty: MicroNovelty;
  completedNoveltyIds: string[];
  onSelectActiveNovelty: (novelty: MicroNovelty) => void;
  onToggleComplete: (noveltyId: string) => void;
  onNavigateBack: () => void;
  onNavigateToWorkshop: (noveltyId?: string) => void;
  onNavigateToJournalWithNovelty: (novelty: MicroNovelty) => void;
  onNavigateToDossierId: (noveltyId: string) => void;
}

const ICON_MAP = {
  compass: Compass,
  eye: Eye,
  feather: Feather,
  cup: Coffee,
  sparkle: Sparkles,
  heart: Heart,
  clock: Clock,
  ear: Ear
};

export const NoveltyDossierView: React.FC<NoveltyDossierViewProps> = ({
  noveltyId,
  customNovelties,
  activeNovelty,
  completedNoveltyIds,
  onSelectActiveNovelty,
  onToggleComplete,
  onNavigateBack,
  onNavigateToWorkshop,
  onNavigateToJournalWithNovelty,
  onNavigateToDossierId
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Combine standard and custom catalog
  const allNovelties = [...customNovelties, ...MICRO_NOVELTIES_CATALOG];
  const currentIndex = allNovelties.findIndex(n => n.id === noveltyId);
  const novelty = currentIndex !== -1 ? allNovelties[currentIndex] : (allNovelties[0] || MICRO_NOVELTIES_CATALOG[0]);

  // Practice Timer State
  const initialSeconds = (novelty.estimatedMinutes || 3) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Reset timer when novelty changes
  useEffect(() => {
    setIsTimerRunning(false);
    setSecondsRemaining((novelty.estimatedMinutes || 3) * 60);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, [novelty.id, novelty.estimatedMinutes]);

  // Timer Tick
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            soundEngine.playPaperTurnSound();
            hapticsEngine.triggerHaptic('completion');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  // GSAP Smooth Entrance Animation
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 12, scale: 0.99 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [novelty.id]);

  // Keyboard navigation (Esc to go back, Left/Right arrow to flip)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNavigateBack();
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (currentIndex - 1 + allNovelties.length) % allNovelties.length;
        onNavigateToDossierId(allNovelties[prevIdx].id);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentIndex + 1) % allNovelties.length;
        onNavigateToDossierId(allNovelties[nextIdx].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allNovelties, onNavigateBack, onNavigateToDossierId]);

  const isCurrentActive = activeNovelty.id === novelty.id;
  const isDone = completedNoveltyIds.includes(novelty.id);

  const handleToggleTimer = () => {
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('click');
    setIsTimerRunning(!isTimerRunning);
  };

  const handleResetTimer = () => {
    soundEngine.playPencilScratchSound();
    setIsTimerRunning(false);
    setSecondsRemaining((novelty.estimatedMinutes || 3) * 60);
  };

  const handleCompleteWithCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('completion');

    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 30,
      spread: 50,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#2E6B4E', '#D9A74A', '#A8382A', '#1E3A8A']
    });

    onToggleComplete(novelty.id);
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timerProgress = 1 - secondsRemaining / ((novelty.estimatedMinutes || 3) * 60);
  const IconComponent = ICON_MAP[novelty.iconType] || Compass;

  const prevNovelty = allNovelties[(currentIndex - 1 + allNovelties.length) % allNovelties.length];
  const nextNovelty = allNovelties[(currentIndex + 1) % allNovelties.length];

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
      
      {/* Top Breadcrumb & Deck Navigation Bar */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#1E2723] text-[#423B30] dark:text-[#EAE5D9] hover:bg-[#EFE7D8] dark:hover:bg-[#28352F] text-xs font-semibold border border-[#D9CEBA] dark:border-[#384A40] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2">
          {novelty.isCustom && (
            <button
              type="button"
              onClick={() => onNavigateToWorkshop(novelty.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#232F2A] hover:bg-[#EAE2D2] dark:hover:bg-[#2C3B34] text-[#A8382A] dark:text-[#F08A7D] text-xs font-bold border border-[#D5C7B2] dark:border-[#384A40] transition-colors cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              <span className="hidden sm:inline">Refine Blueprint</span>
            </button>
          )}

          <div className="flex items-center bg-[#FAF6EE] dark:bg-[#1E2723] border border-[#D9CEBA] dark:border-[#384A40] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => onNavigateToDossierId(prevNovelty.id)}
              title={`Previous: ${prevNovelty.title}`}
              className="p-1.5 hover:bg-[#EAE0CE] dark:hover:bg-[#2C3831] rounded text-[#5D5344] dark:text-[#C5BBAE] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-semibold text-[#7A6F5E] dark:text-[#A89E8F] px-2">
              {currentIndex + 1} / {allNovelties.length}
            </span>
            <button
              type="button"
              onClick={() => onNavigateToDossierId(nextNovelty.id)}
              title={`Next: ${nextNovelty.title}`}
              className="p-1.5 hover:bg-[#EAE0CE] dark:hover:bg-[#2C3831] rounded text-[#5D5344] dark:text-[#C5BBAE] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Physical Field Card Folio */}
      <div 
        ref={cardRef}
        className="relative bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-2xl border border-[#D9CEBC] dark:border-[#384A40] p-6 sm:p-10 overflow-hidden"
      >
        {/* Top Washi Tape Corner */}
        <div className="washi-tape washi-ochre absolute -top-3 right-8 w-36 h-6 flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-[#4A320A] tracking-wider uppercase">
            {novelty.isCustom ? '★ CUSTOM SEED' : `FIELD CARD #${String(currentIndex + 1).padStart(2, '0')}`}
          </span>
        </div>

        {/* Header Metadata */}
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A] dark:text-[#F08A7D] bg-[#F2E8DC] dark:bg-[#2E201E] px-2.5 py-1 rounded-md">
            {novelty.category.replace('_', ' ')}
          </span>

          <span className="text-xs text-[#827766]">•</span>

          <span className="text-xs text-[#7A6F5E] dark:text-[#A89E8F] flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#A8382A] dark:text-[#F08A7D]" />
            ~{novelty.estimatedMinutes} minutes duration
          </span>

          <span className="text-xs text-[#827766]">•</span>

          <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#EAE0CE] dark:bg-[#2C3831] text-[#6B5F4E] dark:text-[#C5BBAE]">
            {novelty.difficulty} pace
          </span>
        </div>

        {/* Title and Tagline */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F0E6D4] dark:bg-[#26332C] text-[#2E6B4E] dark:text-[#6CB28E] flex items-center justify-center shrink-0 border border-[#DCD0BE] dark:border-[#384A40] mt-1 shadow-xs">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#24211E] dark:text-[#FAF7F0] tracking-tight">
              {novelty.title}
            </h1>
            <p className="font-hand text-xl sm:text-2xl text-[#6B5738] dark:text-[#DEAC5D] mt-1">
              "{novelty.tagline}"
            </p>
          </div>
        </div>

        {/* Step-by-Step Exercise Instructions (College-ruled styling) */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#2E6B4E] dark:text-[#5BA87E]" />
            <span>Field Instructions & Action Blueprint</span>
          </h3>
          <div className="ruled-paper bg-[#FCFAF5] dark:bg-[#232F2A] border border-[#DDD0BC] dark:border-[#334239] rounded-xl p-5 sm:p-6 text-sm sm:text-base text-[#38332B] dark:text-[#E2DBCF] leading-relaxed font-sans shadow-inner">
            <p className="whitespace-pre-line">
              {novelty.instruction}
            </p>
          </div>
        </div>

        {/* Interactive Practice Stopwatch / Timer */}
        <div className="bg-[#F4EEE2] dark:bg-[#222E28] border border-[#DDD1BE] dark:border-[#384A40] rounded-xl p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#A8382A] dark:text-[#F08A7D]" />
                <h4 className="font-display font-bold text-sm text-[#2C2926] dark:text-[#FAF7F0]">
                  Practice Focus Timer
                </h4>
              </div>
              <p className="text-xs text-[#7A6F5E] dark:text-[#A89E8F] mt-0.5">
                Take a dedicated {novelty.estimatedMinutes}-minute pause right now to disrupt your routine autopilot.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="font-mono text-2xl font-bold tracking-wider text-[#1E3A8A] dark:text-[#9EC0F4] bg-[#FAF7F1] dark:bg-[#18211D] px-3.5 py-1.5 rounded-lg border border-[#D5C7B2] dark:border-[#384A40] shadow-inner">
                {formatTimer(secondsRemaining)}
              </div>

              <button
                type="button"
                onClick={handleToggleTimer}
                className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  isTimerRunning
                    ? 'bg-[#A8382A] hover:bg-[#8F2F23] text-[#FAF7F0]'
                    : 'bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0]'
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                title="Reset timer"
                className="p-2 rounded-lg text-[#6E6454] dark:text-[#A89E8F] hover:bg-[#EAE0CE] dark:hover:bg-[#2C3831] border border-[#DDD1BE] dark:border-[#384A40] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E5DCcb] dark:bg-[#18211D] h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-[#2E6B4E] dark:bg-[#5BA87E] h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, timerProgress * 100))}%` }}
            />
          </div>
        </div>

        {/* Neurocognitive Mechanism Analysis & Sensory Focus Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Neuroscience explanation */}
          <div className="md:col-span-2 bg-[#F8F5EE] dark:bg-[#19221E] border border-[#E0D5C3] dark:border-[#2E3C34] p-4 sm:p-5 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-[#2E6B4E] dark:text-[#5BA87E]" />
              <h4 className="font-display font-bold text-sm text-[#2C2926] dark:text-[#FAF7F0]">
                Neurocognitive Mechanism
              </h4>
            </div>
            <p className="text-xs text-[#5D5344] dark:text-[#C5BBAE] leading-relaxed">
              {novelty.whyItSlowsTime}
            </p>
          </div>

          {/* Sensory Cues Breakdown */}
          <div className="bg-[#F8F5EE] dark:bg-[#19221E] border border-[#E0D5C3] dark:border-[#2E3C34] p-4 sm:p-5 rounded-xl flex flex-col justify-between">
            <div>
              <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2.5">
                Activated Sensory Cues
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {novelty.sensoryFocus.map(cue => (
                  <span
                    key={cue}
                    className="text-xs px-2.5 py-1 bg-[#EAE1D1] dark:bg-[#2A3630] text-[#3D3529] dark:text-[#E2DBCF] rounded-lg font-medium border border-[#D5C9B6] dark:border-[#384A40]"
                  >
                    {SENSORY_CUE_METADATA[cue]?.icon} {cue}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-[#867B6B] dark:text-[#8E8373] mt-3 pt-2 border-t border-[#E5DAC8] dark:border-[#2C3831]">
              Multi-sensory encoding solidifies hippocampus recall.
            </div>
          </div>
        </div>

        {/* Primary Action Dock */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-[#E3D8C6] dark:border-[#2C3831]">
          
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCompleteWithCelebration}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ${
                isDone
                  ? 'bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0]'
                  : 'bg-[#A8382A] hover:bg-[#8F2F23] text-[#FAF7F0]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isDone ? 'Completed Today!' : 'Mark Completed'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onSelectActiveNovelty(novelty);
                soundEngine.playPaperTurnSound();
              }}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors cursor-pointer ${
                isCurrentActive
                  ? 'bg-[#EAE0CE] dark:bg-[#2A3831] text-[#2E6B4E] dark:text-[#6CB28E] border-[#2E6B4E]/40 font-bold'
                  : 'bg-[#F2ECE0] dark:bg-[#232F2A] hover:bg-[#EAE0CE] text-[#423B30] dark:text-[#EAE5D9] border-[#D9CEBA] dark:border-[#384A40]'
              }`}
            >
              {isCurrentActive ? '★ Today’s Active Focus' : 'Set as Today’s Goal'}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToJournalWithNovelty(novelty)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1C355E] hover:bg-[#162A4B] text-[#FAF7F0] text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Inscribe in Journal →</span>
          </button>

        </div>

      </div>

    </div>
  );
};
