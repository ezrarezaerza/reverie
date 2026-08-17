import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Eye, 
  Coffee, 
  Feather, 
  Heart, 
  Clock, 
  CheckCircle, 
  Shuffle, 
  Info, 
  Check,
  Search,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroNovelty, NoveltyCategory, SensoryCue } from '../types';
import { MICRO_NOVELTIES_CATALOG, SENSORY_CUE_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';

import { BentoGridAnimations } from './BentoGridAnimations';

interface MicroNoveltyDeckProps {
  activeNovelty: MicroNovelty;
  onSelectActiveNovelty: (novelty: MicroNovelty) => void;
  completedNoveltyIds: string[];
  onToggleComplete: (noveltyId: string) => void;
  onNavigateToJournal: () => void;
}

export const MicroNoveltyDeck: React.FC<MicroNoveltyDeckProps> = ({
  activeNovelty,
  onSelectActiveNovelty,
  completedNoveltyIds,
  onToggleComplete,
  onNavigateToJournal
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoveltyForModal, setSelectedNoveltyForModal] = useState<MicroNovelty | null>(null);

  const categories: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Decks', icon: '✨' },
    { id: 'routine_breaker', label: 'Routine Breakers', icon: '🧭' },
    { id: 'sensory', label: 'Sensory Awakening', icon: '🌿' },
    { id: 'curiosity', label: 'Observation', icon: '👁️' },
    { id: 'stillness', label: 'Mindful Stillness', icon: '🍵' },
    { id: 'nature', label: 'Natural World', icon: '🍃' },
    { id: 'connection', label: 'Micro-Connection', icon: '💬' }
  ];

  const filteredNovelties = MICRO_NOVELTIES_CATALOG.filter(nov => {
    const matchesCat = selectedCategory === 'all' || nov.category === selectedCategory;
    const matchesSearch = 
      nov.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nov.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nov.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleShuffleDaily = () => {
    soundEngine.playPaperTurnSound();
    const randomIndex = Math.floor(Math.random() * MICRO_NOVELTIES_CATALOG.length);
    const newPick = MICRO_NOVELTIES_CATALOG[randomIndex];
    onSelectActiveNovelty(newPick);
  };

  const handleCompleteWithConfetti = (e: React.MouseEvent, nov: MicroNovelty) => {
    e.stopPropagation();
    soundEngine.playPencilScratchSound();
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 22,
      spread: 40,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#2E6B4E', '#D9A74A', '#A8382A']
    });
    onToggleComplete(nov.id);
  };

  const isCurrentActive = (id: string) => activeNovelty.id === id;
  const isDone = (id: string) => completedNoveltyIds.includes(id);

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Featured Hero Card: Today's Drawn Novelty */}
      <div className="relative bg-[#FAF6EE] paper-shadow-lifted rounded-xl border border-[#D9CEBC] p-6 sm:p-8 mb-8 overflow-hidden">
        {/* Washi tape on corner */}
        <div className="washi-tape washi-ochre absolute -top-3 right-8 w-28 h-6 flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-[#4A320A] tracking-wider uppercase">
            TODAY'S SEED
          </span>
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A]">
              Micro-Novelty of the Day
            </span>
            <span className="text-xs text-[#827766]">•</span>
            <span className="text-xs text-[#827766] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {activeNovelty.estimatedMinutes} mins
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#282522] mb-1">
            {activeNovelty.title}
          </h2>
          <p className="font-hand text-xl text-[#6B5738] mb-4">
            — {activeNovelty.tagline}
          </p>

          <div className="bg-[#F2ECE0] border-l-4 border-[#2E6B4E] p-4 rounded-r-md mb-5 text-sm text-[#38332B] leading-relaxed">
            {activeNovelty.instruction}
          </div>

          {/* Neurocognitive explanation */}
          <div className="bg-[#FAF7F2] border border-[#E3D8C6] p-3.5 rounded-lg mb-6 text-xs text-[#5E5444] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#2E6B4E] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#2C2926]">Why this slows down time perception: </span>
              {activeNovelty.whyItSlowsTime}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={(e) => handleCompleteWithConfetti(e, activeNovelty)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm ${
                isDone(activeNovelty.id)
                  ? 'bg-[#2E6B4E] text-[#FAF7F0]'
                  : 'bg-[#A8382A] hover:bg-[#8F2F23] text-[#FAF7F0]'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isDone(activeNovelty.id) ? 'Completed Today!' : 'Mark Completed'}</span>
            </button>

            <button
              onClick={handleShuffleDaily}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EFE7D8] hover:bg-[#E5DBC8] text-[#423B30] text-xs sm:text-sm font-medium border border-[#D9CEBA] transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Draw Another Card</span>
            </button>

            <button
              onClick={onNavigateToJournal}
              className="text-xs font-semibold text-[#1C355E] hover:underline underline-offset-2 ml-auto"
            >
              Write Reflection in Journal →
            </button>
          </div>
        </div>
      </div>

      {/* Catalog Section Header & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-xl text-[#FAF7F0]">
              The Micro-Novelty Catalog
            </h3>
            <p className="text-xs text-[#C5BBAA]">
              Choose from 5-minute routine interruptions designed to disrupt temporal compression.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8474]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search prompts or sensory cues..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6EE] border border-[#DDD0BC] rounded-lg text-xs text-[#2C2926] placeholder-[#8F8474] outline-none focus:ring-1 focus:ring-[#2E6B4E]"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                soundEngine.playPencilScratchSound();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#EAE0CE] text-[#1E3A8A] font-semibold border border-[#D0C2A8]'
                  : 'bg-[#373F3A] text-[#DDD5C7] hover:bg-[#434D47] border border-transparent'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Cards Grid Wrapped in GSAP Bento Stagger & Hover Manager */}
      <BentoGridAnimations className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNovelties.map((nov) => {
          const active = isCurrentActive(nov.id);
          const done = isDone(nov.id);

          return (
            <div
              key={nov.id}
              onClick={() => setSelectedNoveltyForModal(nov)}
              className={`bento-card-item relative bg-[#FAF7F1] rounded-xl border p-5 cursor-pointer transition-colors flex flex-col justify-between ${
                active
                  ? 'border-[#2E6B4E] ring-2 ring-[#2E6B4E]/30 bg-[#FBF9F4]'
                  : 'border-[#DED3C2]'
              }`}
            >
              {/* Top meta */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8382A] bg-[#F2E8DC] px-2 py-0.5 rounded">
                    {nov.category.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-[#7C7160]">
                    <Clock className="w-3 h-3" />
                    <span>{nov.estimatedMinutes}m</span>
                  </div>
                </div>

                <h4 className="font-display font-bold text-base text-[#2C2926] mb-1">
                  {nov.title}
                </h4>
                
                <p className="text-xs text-[#5D5446] line-clamp-3 leading-relaxed mb-3">
                  {nov.instruction}
                </p>
              </div>

              {/* Sensory focus pills and action footer */}
              <div>
                <div className="flex items-center gap-1 mb-3">
                  {nov.sensoryFocus.map(cue => (
                    <span
                      key={cue}
                      className="text-[10px] px-1.5 py-0.5 bg-[#EAE1D1] text-[#4A4235] rounded font-medium"
                      title={SENSORY_CUE_METADATA[cue]?.label}
                    >
                      {SENSORY_CUE_METADATA[cue]?.icon} {cue}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DFCFA] text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectActiveNovelty(nov);
                      soundEngine.playPaperTurnSound();
                    }}
                    className={`font-semibold text-[11px] ${
                      active ? 'text-[#2E6B4E]' : 'text-[#8A5034] hover:text-[#5B301D]'
                    }`}
                  >
                    {active ? '● Active Today' : 'Make Today’s Goal'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleCompleteWithConfetti(e, nov)}
                    className={`p-1 rounded-full transition-colors ${
                      done
                        ? 'bg-[#2E6B4E] text-[#FAF7F0]'
                        : 'bg-[#E8DFCFA] text-[#786D5C] hover:bg-[#DDD2BE]'
                    }`}
                    title={done ? 'Completed' : 'Mark complete'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </BentoGridAnimations>

      {/* Novelty Detail Modal */}
      {selectedNoveltyForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative bg-[#FAF7F1] paper-shadow-lifted rounded-xl border border-[#D9CEBC] max-w-lg w-full p-6 sm:p-8">
            <div className="washi-tape washi-sage absolute -top-3 left-8 w-24 h-5 text-[9px] text-[#2C4A32] font-bold flex items-center justify-center">
              CARD DETAILS
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A]">
                {selectedNoveltyForModal.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-[#7A6F5E]">
                ~{selectedNoveltyForModal.estimatedMinutes} minutes
              </span>
            </div>

            <h3 className="font-display font-bold text-2xl text-[#2B2723] mb-1">
              {selectedNoveltyForModal.title}
            </h3>
            <p className="font-hand text-lg text-[#6B5738] mb-4">
              "{selectedNoveltyForModal.tagline}"
            </p>

            <div className="bg-[#F4EEE2] border-l-3 border-[#2E6B4E] p-4 rounded-r text-sm text-[#38332B] leading-relaxed mb-4">
              {selectedNoveltyForModal.instruction}
            </div>

            <div className="bg-[#F8F5EE] border border-[#E0D5C3] p-3.5 rounded-lg mb-6 text-xs text-[#5D5344]">
              <span className="font-semibold text-[#2C2926]">Neurocognitive Mechanism: </span>
              {selectedNoveltyForModal.whyItSlowsTime}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E3D8C6]">
              <button
                onClick={() => setSelectedNoveltyForModal(null)}
                className="px-4 py-1.5 rounded-md text-xs text-[#5A5040] hover:bg-[#EAE0CE] transition-colors"
              >
                Close
              </button>
              
              <button
                onClick={() => {
                  onSelectActiveNovelty(selectedNoveltyForModal);
                  setSelectedNoveltyForModal(null);
                  soundEngine.playPaperTurnSound();
                }}
                className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[#2E6B4E] text-[#FAF7F0] hover:bg-[#25563E] transition-colors"
              >
                Set as Today's Focus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
