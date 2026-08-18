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
  Filter,
  Wrench,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MicroNovelty, NoveltyCategory, SensoryCue } from '../types';
import { MICRO_NOVELTIES_CATALOG, SENSORY_CUE_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';
import { hapticsEngine } from '../utils/hapticsEngine';
import { BentoGridAnimations } from './BentoGridAnimations';

interface MicroNoveltyDeckProps {
  activeNovelty: MicroNovelty;
  onSelectActiveNovelty: (novelty: MicroNovelty) => void;
  completedNoveltyIds: string[];
  onToggleComplete: (noveltyId: string) => void;
  onNavigateToJournal: () => void;
  customNovelties?: MicroNovelty[];
  onDeleteCustomNovelty?: (noveltyId: string) => void;
  onOpenDossier: (noveltyId: string) => void;
  onOpenWorkshop: (noveltyId?: string) => void;
}

export const MicroNoveltyDeck: React.FC<MicroNoveltyDeckProps> = ({
  activeNovelty,
  onSelectActiveNovelty,
  completedNoveltyIds,
  onToggleComplete,
  onNavigateToJournal,
  customNovelties = [],
  onDeleteCustomNovelty,
  onOpenDossier,
  onOpenWorkshop
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: string; label: string; icon: string; count?: number }[] = [
    { id: 'all', label: 'All Decks', icon: '✨' },
    { id: 'workshop', label: 'My Workshop', icon: '🛠️', count: customNovelties.length },
    { id: 'routine_breaker', label: 'Routine Breakers', icon: '🧭' },
    { id: 'sensory', label: 'Sensory Awakening', icon: '🌿' },
    { id: 'curiosity', label: 'Observation', icon: '👁️' },
    { id: 'stillness', label: 'Mindful Stillness', icon: '🍵' },
    { id: 'nature', label: 'Natural World', icon: '🍃' },
    { id: 'connection', label: 'Micro-Connection', icon: '💬' }
  ];

  // Combined full novelties list (Standard Catalog + User Handcrafted Custom Workshop items)
  const allNovelties = [...customNovelties, ...MICRO_NOVELTIES_CATALOG];

  const filteredNovelties = allNovelties.filter(nov => {
    let matchesCat = true;
    if (selectedCategory === 'workshop') {
      matchesCat = Boolean(nov.isCustom);
    } else if (selectedCategory !== 'all') {
      matchesCat = nov.category === selectedCategory;
    }

    const matchesSearch = 
      nov.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nov.instruction.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nov.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleShuffleDaily = () => {
    soundEngine.playPaperTurnSound();
    const randomIndex = Math.floor(Math.random() * allNovelties.length);
    const newPick = allNovelties[randomIndex];
    onSelectActiveNovelty(newPick);
  };

  const handleCompleteWithConfetti = (e: React.MouseEvent, nov: MicroNovelty) => {
    e.stopPropagation();
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('completion');
    const rect = e.currentTarget.getBoundingClientRect();
    confetti({
      particleCount: 24,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight
      },
      colors: ['#2E6B4E', '#D9A74A', '#A8382A', '#1E3A8A']
    });
    onToggleComplete(nov.id);
  };

  const handleDeleteCustom = (e: React.MouseEvent, novId: string) => {
    e.stopPropagation();
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('stamp');
    if (onDeleteCustomNovelty) {
      onDeleteCustomNovelty(novId);
    }
  };

  const isCurrentActive = (id: string) => activeNovelty.id === id;
  const isDone = (id: string) => completedNoveltyIds.includes(id);

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-3 sm:px-6">
      
      {/* Featured Hero Card: Today's Drawn Novelty */}
      <div className="relative bg-[#FAF6EE] dark:bg-[#1C2521] paper-shadow-lifted rounded-xl border border-[#D9CEBC] dark:border-[#384A40] p-6 sm:p-8 mb-8 overflow-hidden">
        {/* Washi tape on corner */}
        <div className="washi-tape washi-ochre absolute -top-3 right-8 w-32 h-6 flex items-center justify-center">
          <span className="text-[10px] font-mono font-bold text-[#4A320A] tracking-wider uppercase">
            {activeNovelty.isCustom ? '★ CUSTOM SEED' : "TODAY'S SEED"}
          </span>
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A] dark:text-[#F08A7D]">
              Micro-Novelty of the Day
            </span>
            <span className="text-xs text-[#827766]">•</span>
            <span className="text-xs text-[#827766] dark:text-[#A89E8F] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#A8382A] dark:text-[#F08A7D]" /> {activeNovelty.estimatedMinutes} mins
            </span>
            {activeNovelty.isCustom && (
              <>
                <span className="text-xs text-[#827766]">•</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#EAE0CE] dark:bg-[#2C3831] text-[#786D5C] dark:text-[#C5BBAE] font-semibold">
                  Handcrafted
                </span>
              </>
            )}
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#282522] dark:text-[#FAF7F0] mb-1">
            {activeNovelty.title}
          </h2>
          <p className="font-hand text-xl text-[#6B5738] dark:text-[#DEAC5D] mb-4">
            — {activeNovelty.tagline}
          </p>

          <div className="bg-[#F2ECE0] dark:bg-[#232F2A] border-l-4 border-[#2E6B4E] dark:border-[#5BA87E] p-4 rounded-r-md mb-5 text-sm text-[#38332B] dark:text-[#E2DBCF] leading-relaxed">
            {activeNovelty.instruction}
          </div>

          {/* Neurocognitive explanation */}
          <div className="bg-[#FAF7F2] dark:bg-[#18211D] border border-[#E3D8C6] dark:border-[#2C3831] p-3.5 rounded-lg mb-6 text-xs text-[#5E5444] dark:text-[#A89E8F] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#2E6B4E] dark:text-[#5BA87E] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#2C2926] dark:text-[#FAF7F0]">Why this slows down time perception: </span>
              {activeNovelty.whyItSlowsTime}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={(e) => handleCompleteWithConfetti(e, activeNovelty)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ${
                isDone(activeNovelty.id)
                  ? 'bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0]'
                  : 'bg-[#A8382A] hover:bg-[#8F2F23] text-[#FAF7F0]'
              }`}
              title={isDone(activeNovelty.id) ? 'Completed (Click to uncheck)' : 'Click to mark as complete'}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isDone(activeNovelty.id) ? 'Completed Today!' : 'Mark Completed'}</span>
            </button>

            <button
              onClick={() => onOpenDossier(activeNovelty.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1C355E] hover:bg-[#162A4B] text-[#FAF7F0] text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Field Dossier & Timer</span>
            </button>

            <button
              onClick={handleShuffleDaily}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#EFE7D8] dark:bg-[#2A3630] hover:bg-[#E5DBC8] dark:hover:bg-[#34443C] text-[#423B30] dark:text-[#EAE5D9] text-xs sm:text-sm font-medium border border-[#D9CEBA] dark:border-[#3D4E45] transition-colors cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Draw Another Card</span>
            </button>

            <button
              onClick={onNavigateToJournal}
              className="text-xs font-semibold text-[#1C355E] dark:text-[#88B2F8] hover:underline underline-offset-2 ml-auto cursor-pointer"
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
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-xl text-[#FAF7F0]">
                The Micro-Novelty Catalog
              </h3>
              <button
                type="button"
                onClick={() => onOpenWorkshop()}
                className="px-3 py-1 bg-[#D9A74A] hover:bg-[#C89437] text-[#332205] text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Craft Routine-Breaker</span>
              </button>
            </div>
            <p className="text-xs text-[#C5BBAA] mt-0.5">
              Choose or design 5-minute routine interruptions designed to disrupt temporal compression.
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
              className="w-full pl-8 pr-3 py-1.5 bg-[#FAF6EE] dark:bg-[#1E2723] border border-[#DDD0BC] dark:border-[#384A40] rounded-lg text-xs text-[#2C2926] dark:text-[#FAF7F0] placeholder-[#8F8474] outline-none focus:ring-1 focus:ring-[#2E6B4E]"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  soundEngine.playPencilScratchSound();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EAE0CE] dark:bg-[#34443C] text-[#1E3A8A] dark:text-[#FAF7F0] font-semibold border border-[#D0C2A8] dark:border-[#4B5E54]'
                    : 'bg-[#373F3A] text-[#DDD5C7] hover:bg-[#434D47] border border-transparent'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                {cat.count !== undefined && cat.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-[#1E3A8A] text-white' : 'bg-[#4B554F] text-[#DDD5C7]'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State for Handcrafted Workshop */}
      {filteredNovelties.length === 0 && selectedCategory === 'workshop' && (
        <div className="bg-[#FAF6EE] dark:bg-[#1C2521] border-2 border-dashed border-[#D9CEBC] dark:border-[#384A40] rounded-2xl p-8 text-center max-w-lg mx-auto my-6">
          <div className="w-12 h-12 rounded-full bg-[#EAE0CE] dark:bg-[#28352F] text-[#A8382A] dark:text-[#F08A7D] flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-6 h-6" />
          </div>
          <h4 className="font-display font-bold text-lg text-[#2C2926] dark:text-[#FAF7F0] mb-1">
            Your Workshop Is Empty
          </h4>
          <p className="text-xs text-[#7A6F5E] dark:text-[#A89E8F] mb-4 leading-relaxed">
            Craft your first personal routine-breaker (e.g. an unfamiliar walking route, a non-dominant hand challenge, or a silent tactile observation).
          </p>
          <button
            type="button"
            onClick={() => onOpenWorkshop()}
            className="px-4 py-2 bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Craft Your First Novelty</span>
          </button>
        </div>
      )}

      {/* Catalog Cards Grid Wrapped in GSAP Bento Stagger & Hover Manager */}
      <BentoGridAnimations className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNovelties.map((nov) => {
          const active = isCurrentActive(nov.id);
          const done = isDone(nov.id);

          return (
            <div
              key={nov.id}
              onClick={() => onOpenDossier(nov.id)}
              className={`bento-card-item relative bg-[#FAF7F1] dark:bg-[#1C2521] rounded-xl border p-5 cursor-pointer transition-colors flex flex-col justify-between group ${
                active
                  ? 'border-[#2E6B4E] dark:border-[#5BA87E] ring-2 ring-[#2E6B4E]/30 bg-[#FBF9F4] dark:bg-[#222E28]'
                  : 'border-[#DED3C2] dark:border-[#384A40]'
              }`}
            >
              {/* Custom Badge on Handcrafted Items */}
              {nov.isCustom && (
                <div className="washi-tape washi-ochre absolute -top-2.5 right-4 w-24 h-4.5 text-[8.5px] font-mono font-bold text-[#4A320A] flex items-center justify-center">
                  HANDCRAFTED
                </div>
              )}

              {/* Top meta */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8382A] dark:text-[#F08A7D] bg-[#F2E8DC] dark:bg-[#2E201E] px-2 py-0.5 rounded">
                    {nov.category.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-[#7C7160] dark:text-[#A89E8F]">
                      <Clock className="w-3 h-3" />
                      <span>{nov.estimatedMinutes}m</span>
                    </div>

                    {/* Edit and delete tools for custom novelties */}
                    {nov.isCustom && (
                      <div className="flex items-center gap-1 ml-1" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenWorkshop(nov.id);
                          }}
                          className="p-1 text-[#7C7160] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] rounded hover:bg-[#EAE0CE] dark:hover:bg-[#2C3831] transition-colors cursor-pointer"
                          title="Edit Custom Routine-Breaker"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, nov.id)}
                          className="p-1 text-[#A8382A] hover:text-[#802216] rounded hover:bg-[#F2E8DC] dark:hover:bg-[#2E201E] transition-colors cursor-pointer"
                          title="Delete Custom Routine-Breaker"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h4 className="font-display font-bold text-base text-[#2C2926] dark:text-[#FAF7F0] mb-1 group-hover:text-[#A8382A] dark:group-hover:text-[#F08A7D] transition-colors">
                  {nov.title}
                </h4>
                
                <p className="text-xs text-[#5D5446] dark:text-[#C5BBAE] line-clamp-3 leading-relaxed mb-3">
                  {nov.instruction}
                </p>
              </div>

              {/* Sensory focus pills and action footer */}
              <div>
                <div className="flex items-center gap-1 mb-3 flex-wrap">
                  {nov.sensoryFocus.map(cue => (
                    <span
                      key={cue}
                      className="text-[10px] px-1.5 py-0.5 bg-[#EAE1D1] dark:bg-[#2A3630] text-[#4A4235] dark:text-[#D1C7BA] rounded font-medium"
                      title={SENSORY_CUE_METADATA[cue]?.label}
                    >
                      {SENSORY_CUE_METADATA[cue]?.icon} {cue}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E8DFCFA] dark:border-[#2C3831] text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectActiveNovelty(nov);
                      soundEngine.playPaperTurnSound();
                    }}
                    className={`font-semibold text-[11px] cursor-pointer ${
                      active ? 'text-[#2E6B4E] dark:text-[#6CB28E]' : 'text-[#8A5034] dark:text-[#DEAC5D] hover:text-[#5B301D]'
                    }`}
                  >
                    {active ? '● Active Today' : 'Make Today’s Goal'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-[#7A6F5E] dark:text-[#A89E8F] group-hover:underline flex items-center gap-0.5">
                      Dossier <ArrowRight className="w-2.5 h-2.5" />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCompleteWithConfetti(e, nov)}
                      className={`p-1 rounded-full transition-colors cursor-pointer ${
                        done
                          ? 'bg-[#2E6B4E] text-[#FAF7F0]'
                          : 'bg-[#E8DFCFA] dark:bg-[#2A3630] text-[#786D5C] dark:text-[#C5BBAE] hover:bg-[#DDD2BE]'
                      }`}
                      title={done ? 'Completed' : 'Mark complete'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </BentoGridAnimations>

    </div>
  );
};
