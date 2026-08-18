import React, { useState, useEffect, useRef } from 'react';
import { ModalPortal } from './ModalPortal';
import { 
  X, 
  Sparkles, 
  Compass, 
  Eye, 
  Coffee, 
  Feather, 
  Heart, 
  Clock, 
  Ear,
  Wrench,
  Lightbulb,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { MicroNovelty, NoveltyCategory, SensoryCue } from '../types';
import { SENSORY_CUE_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';
import { hapticsEngine } from '../utils/hapticsEngine';
import gsap from 'gsap';

interface CustomNoveltyWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNovelty: (novelty: MicroNovelty, setAsActiveToday?: boolean) => void;
  editingNovelty?: MicroNovelty | null;
}

const CATEGORY_OPTIONS: { id: NoveltyCategory; label: string; icon: string; desc: string }[] = [
  { id: 'routine_breaker', label: 'Routine Breaker', icon: '🧭', desc: 'Interrupt automatic motor and daily habits' },
  { id: 'sensory', label: 'Sensory Awakening', icon: '🌿', desc: 'Savor textures, scents, sounds, and physical details' },
  { id: 'curiosity', label: 'Observation & Eye', icon: '👁️', desc: 'Notice details usually filtered out by the brain' },
  { id: 'stillness', label: 'Mindful Stillness', icon: '🍵', desc: 'Pause the rush of time with calm somatic pauses' },
  { id: 'nature', label: 'Natural World', icon: '🍃', desc: 'Re-align with organic rhythms and living elements' },
  { id: 'connection', label: 'Micro-Connection', icon: '💬', desc: 'Brief, warm, serendipitous human interactions' }
];

const ICON_OPTIONS: { id: MicroNovelty['iconType']; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'compass', label: 'Compass', Icon: Compass },
  { id: 'eye', label: 'Eye', Icon: Eye },
  { id: 'feather', label: 'Feather', Icon: Feather },
  { id: 'cup', label: 'Cup', Icon: Coffee },
  { id: 'sparkle', label: 'Sparkle', Icon: Sparkles },
  { id: 'heart', label: 'Heart', Icon: Heart },
  { id: 'clock', label: 'Clock', Icon: Clock },
  { id: 'ear', label: 'Ear', Icon: Ear }
];

const TIME_OPTIONS = [1, 2, 3, 5, 10, 15];

const INSPIRATION_RECIPES: Partial<MicroNovelty>[] = [
  {
    title: 'The Non-Dominant Pour',
    tagline: 'Shatter muscle memory during morning routine',
    instruction: 'Prepare your morning tea, coffee, or breakfast using strictly your non-dominant hand. Notice how each micro-movement requires deliberate neural presence.',
    category: 'routine_breaker',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['touch', 'sight'],
    whyItSlowsTime: 'Forcing the non-dominant motor cortex to take control prevents automatic subconscious autopilot, lengthening the perceived duration of the morning.',
    iconType: 'compass'
  },
  {
    title: 'The Unfamiliar Alley Detour',
    tagline: 'Take the scenic or opposite pathway home',
    instruction: 'On your commute or daily stroll, take the first unexpected side street, alleyway, or staircase you have never walked before. Look at the architecture on the second floor.',
    category: 'routine_breaker',
    estimatedMinutes: 5,
    difficulty: 'gentle',
    sensoryFocus: ['sight', 'serendipity'],
    whyItSlowsTime: 'Spatial novelty triggers the hippocampus to encode fresh landmark memories rather than compressing the journey into a routine blur.',
    iconType: 'compass'
  },
  {
    title: 'Three-Texture Somatic Scan',
    tagline: 'Feel three distinct materials with eyes shut',
    instruction: 'Close your eyes and touch three contrasting surfaces in your immediate surroundings (e.g. cold glass, woven linen, rough brick). Breathe for 15 seconds on each.',
    category: 'sensory',
    estimatedMinutes: 2,
    difficulty: 'gentle',
    sensoryFocus: ['touch'],
    whyItSlowsTime: 'Tactile discrimination fires somatic sensory receptors, grounding attention in immediate physical reality rather than conceptual thoughts.',
    iconType: 'feather'
  },
  {
    title: 'The 3:00 PM Cloud Taxonomy',
    tagline: 'Catalogue three sky formations in the afternoon',
    instruction: 'Step outside or look out the tallest window at 3 PM. Find three distinct cloud shapes or light gradients. Give each one a poetic or humorous personal name.',
    category: 'curiosity',
    estimatedMinutes: 3,
    difficulty: 'playful',
    sensoryFocus: ['sight'],
    whyItSlowsTime: 'Scanning natural fractal patterns stimulates alpha brain waves, creating an expansive psychological break in the afternoon schedule.',
    iconType: 'eye'
  },
  {
    title: 'Silent Receipt Micro-Poem',
    tagline: 'Turn mundane paper into a quick artifact',
    instruction: 'Take a paper receipt, ticket, or scrap paper. Inscribe a 3-line observation about the sounds or light in this exact room before discarding or pocketing it.',
    category: 'stillness',
    estimatedMinutes: 4,
    difficulty: 'deep',
    sensoryFocus: ['touch', 'sight'],
    whyItSlowsTime: 'Transforming disposable commercial artifacts into deliberate creative records anchors mundane moments as core memories.',
    iconType: 'feather'
  }
];

export const CustomNoveltyWorkshopModal: React.FC<CustomNoveltyWorkshopModalProps> = ({
  isOpen,
  onClose,
  onSaveNovelty,
  editingNovelty
}) => {
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [instruction, setInstruction] = useState('');
  const [category, setCategory] = useState<NoveltyCategory>('routine_breaker');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<'gentle' | 'playful' | 'deep'>('gentle');
  const [sensoryFocus, setSensoryFocus] = useState<SensoryCue[]>(['touch']);
  const [whyItSlowsTime, setWhyItSlowsTime] = useState('');
  const [iconType, setIconType] = useState<MicroNovelty['iconType']>('compass');

  const [formError, setFormError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Initialize form state
  useEffect(() => {
    if (editingNovelty) {
      setTitle(editingNovelty.title || '');
      setTagline(editingNovelty.tagline || '');
      setInstruction(editingNovelty.instruction || '');
      setCategory(editingNovelty.category || 'routine_breaker');
      setEstimatedMinutes(editingNovelty.estimatedMinutes || 3);
      setDifficulty(editingNovelty.difficulty || 'gentle');
      setSensoryFocus(editingNovelty.sensoryFocus || ['touch']);
      setWhyItSlowsTime(editingNovelty.whyItSlowsTime || '');
      setIconType(editingNovelty.iconType || 'compass');
    } else {
      // Reset form
      setTitle('');
      setTagline('');
      setInstruction('');
      setCategory('routine_breaker');
      setEstimatedMinutes(3);
      setDifficulty('gentle');
      setSensoryFocus(['touch']);
      setWhyItSlowsTime('');
      setIconType('compass');
    }
    setFormError(null);
  }, [editingNovelty, isOpen]);

  // Entrance animation & body scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      if (modalRef.current && backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.25, ease: 'power2.out' }
        );
        gsap.fromTo(
          modalRef.current,
          { opacity: 0, scale: 0.94, y: 15 },
          { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    soundEngine.playPaperTurnSound();
    if (modalRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.94,
        y: 15,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const toggleSensoryCue = (cue: SensoryCue) => {
    soundEngine.playPencilScratchSound();
    if (sensoryFocus.includes(cue)) {
      if (sensoryFocus.length > 1) {
        setSensoryFocus(sensoryFocus.filter(c => c !== cue));
      }
    } else {
      setSensoryFocus([...sensoryFocus, cue]);
    }
  };

  const applyInspirationRecipe = (recipe: Partial<MicroNovelty>) => {
    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('click');
    if (recipe.title) setTitle(recipe.title);
    if (recipe.tagline) setTagline(recipe.tagline);
    if (recipe.instruction) setInstruction(recipe.instruction);
    if (recipe.category) setCategory(recipe.category);
    if (recipe.estimatedMinutes) setEstimatedMinutes(recipe.estimatedMinutes);
    if (recipe.difficulty) setDifficulty(recipe.difficulty);
    if (recipe.sensoryFocus) setSensoryFocus(recipe.sensoryFocus);
    if (recipe.whyItSlowsTime) setWhyItSlowsTime(recipe.whyItSlowsTime);
    if (recipe.iconType) setIconType(recipe.iconType);
  };

  const handleSave = (setAsActiveToday: boolean = false) => {
    if (!title.trim()) {
      setFormError('Please inscribe a title for your routine-breaker.');
      return;
    }
    if (!instruction.trim()) {
      setFormError('Please write the physical recipe or instruction.');
      return;
    }

    const noveltyToSave: MicroNovelty = {
      id: editingNovelty?.id || `custom-nov-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'A personal routine-breaker',
      instruction: instruction.trim(),
      category,
      estimatedMinutes,
      difficulty,
      sensoryFocus,
      whyItSlowsTime: whyItSlowsTime.trim() || 'Breaks automatic neural habits to create a vivid memory anchor.',
      iconType,
      isCustom: true,
      createdAt: editingNovelty?.createdAt || new Date().toISOString()
    };

    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('completion');
    onSaveNovelty(noveltyToSave, setAsActiveToday);
    onClose();
  };

  return (
    <ModalPortal>
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Dimmed backdrop */}
        <div 
          ref={backdropRef}
          onClick={handleClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />

        <div 
          ref={modalRef}
          className="relative w-full max-w-2xl bg-[#FAF6EE] dark:bg-[#1E2723] border-2 border-[#D6C7B2] dark:border-[#384A40] rounded-2xl paper-shadow-lifted overflow-hidden max-h-[90vh] flex flex-col z-10"
        >
        {/* Washi tape header banner */}
        <div className="washi-tape washi-ochre absolute -top-3 left-1/2 -translate-x-1/2 w-48 h-6 flex items-center justify-center z-10">
          <span className="text-[10px] font-mono font-bold text-[#4A320A] tracking-wider uppercase flex items-center gap-1">
            <Wrench className="w-3 h-3" /> NOVELTY WORKSHOP
          </span>
        </div>

        {/* Modal Header */}
        <div className="px-5 sm:px-7 pt-7 pb-4 border-b border-[#E5DAC8] dark:border-[#2C3831] flex items-center justify-between bg-[#F4EFE3] dark:bg-[#18211D]">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[#2C2926] dark:text-[#FAF7F0] flex items-center gap-2">
              <span>{editingNovelty ? 'Refine Routine-Breaker' : 'Craft a Routine-Breaker'}</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-[#E5DAC8] dark:bg-[#2C3831] text-[#6E6352] dark:text-[#C5BBAE]">
                Handcrafted
              </span>
            </h2>
            <p className="text-xs text-[#7A6F5E] dark:text-[#A89E8F] mt-0.5">
              Design a sensory micro-experiment to shatter autopilot and expand your perception of time.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#7A6F5E] dark:text-[#A89E8F] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] hover:bg-[#EAE1D1] dark:hover:bg-[#28352F] transition-colors cursor-pointer"
            aria-label="Close workshop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Inspiration Recipe Quick Chips (Only when creating new) */}
          {!editingNovelty && (
            <div className="bg-[#EFE8D8] dark:bg-[#25302A] p-3 rounded-xl border border-[#DDD2BE] dark:border-[#384A40] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#6D5A3C] dark:text-[#DEAC5D]">
                <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Quick Inspiration Recipes (Click to load template):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATION_RECIPES.map((recipe, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyInspirationRecipe(recipe)}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF8F3] dark:bg-[#1E2723] hover:bg-[#E6DEC8] dark:hover:bg-[#314038] text-[11px] font-medium text-[#4D4538] dark:text-[#E2D8CA] border border-[#DDD0BC] dark:border-[#3C4E43] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{recipe.title}</span>
                    <span className="text-[10px] text-[#A8382A] dark:text-[#F08A7D]">+{recipe.estimatedMinutes}m</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-[#FDF2F0] dark:bg-[#2E1D1B] border border-[#F5C2BC] dark:border-[#4D2622] rounded-xl text-xs text-[#A8382A] dark:text-[#F08A7D] flex items-center justify-between">
              <span>{formError}</span>
              <button type="button" onClick={() => setFormError(null)} className="font-bold cursor-pointer">✕</button>
            </div>
          )}

          {/* Title & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1">
                Routine-Breaker Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => {
                  setTitle(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. The Left-Handed Morning Brew"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F3] dark:bg-[#18211D] border border-[#D5C7B2] dark:border-[#384A40] rounded-xl font-display font-bold text-sm sm:text-base text-[#2C2926] dark:text-[#FAF7F0] focus:ring-2 focus:ring-[#2E6B4E] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1">
                Catchphrase / Subtitle
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Awaken tactile focus before the workday starts"
                className="w-full px-3.5 py-2 bg-[#FAF8F3] dark:bg-[#18211D] border border-[#D5C7B2] dark:border-[#384A40] rounded-xl font-hand text-base text-[#4A4338] dark:text-[#D1B88D] focus:ring-2 focus:ring-[#2E6B4E] outline-none"
              />
            </div>
          </div>

          {/* Physical Instruction */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1">
              Physical Somatic Recipe / Instructions *
            </label>
            <textarea
              rows={3}
              value={instruction}
              onChange={e => {
                setInstruction(e.target.value);
                setFormError(null);
              }}
              placeholder="Describe the physical actions. What should they touch, where should they walk, or what habit should they invert?"
              className="w-full px-3.5 py-2.5 bg-[#FAF8F3] dark:bg-[#18211D] border border-[#D5C7B2] dark:border-[#384A40] rounded-xl font-display text-xs sm:text-sm text-[#2C2926] dark:text-[#FAF7F0] leading-relaxed focus:ring-2 focus:ring-[#2E6B4E] outline-none resize-y"
            />
          </div>

          {/* Category & Time Investment Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1.5">
                Archetype Domain
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playPencilScratchSound();
                      setCategory(cat.id);
                    }}
                    className={`px-2.5 py-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-1.5 ${
                      category === cat.id
                        ? 'bg-[#2E6B4E] text-[#FAF7F0] border-[#2E6B4E] shadow-xs font-bold'
                        : 'bg-[#FAF8F3] dark:bg-[#18211D] text-[#554C3E] dark:text-[#C5BBAE] border-[#D8CDBC] dark:border-[#384A40] hover:bg-[#EAE2D2] dark:hover:bg-[#28352F]'
                    }`}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-[11px] truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Minutes & Difficulty */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1.5">
                  Time Commitment
                </label>
                <div className="flex gap-1.5">
                  {TIME_OPTIONS.map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => {
                        soundEngine.playPencilScratchSound();
                        setEstimatedMinutes(mins);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer text-center ${
                        estimatedMinutes === mins
                          ? 'bg-[#A8382A] text-[#FAF7F0] border-[#A8382A]'
                          : 'bg-[#FAF8F3] dark:bg-[#18211D] text-[#554C3E] dark:text-[#C5BBAE] border-[#D8CDBC] dark:border-[#384A40] hover:bg-[#EAE2D2]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1.5">
                  Energy Vibe
                </label>
                <div className="flex gap-2">
                  {(['gentle', 'playful', 'deep'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        soundEngine.playPencilScratchSound();
                        setDifficulty(diff);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer text-center ${
                        difficulty === diff
                          ? 'bg-[#4A320A] text-[#FAF7F0] border-[#4A320A]'
                          : 'bg-[#FAF8F3] dark:bg-[#18211D] text-[#554C3E] dark:text-[#C5BBAE] border-[#D8CDBC] dark:border-[#384A40] hover:bg-[#EAE2D2]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sensory Anchors & Icon Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-[#E5DAC8] dark:border-[#2C3831]">
            
            {/* Sensory Focus Multiselect */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1.5">
                Sensory Anchors Active
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['sight', 'sound', 'scent', 'taste', 'touch', 'serendipity'] as SensoryCue[]).map(cue => {
                  const isChecked = sensoryFocus.includes(cue);
                  const meta = SENSORY_CUE_METADATA[cue];
                  return (
                    <button
                      key={cue}
                      type="button"
                      onClick={() => toggleSensoryCue(cue)}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#FAF8F3] dark:bg-[#1E2723] text-[#2C2926] dark:text-[#FAF7F0] border-[#2E6B4E] ring-1 ring-[#2E6B4E]'
                          : 'bg-[#EDE4D4]/60 dark:bg-[#18211D] text-[#7A6F5E] dark:text-[#8E8373] border-transparent hover:border-[#D5C7B2]'
                      }`}
                    >
                      <span>{meta?.icon}</span>
                      <span className="capitalize">{cue}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1.5">
                Emblem Stamp
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {ICON_OPTIONS.map(opt => {
                  const IconCmp = opt.Icon;
                  const isSelected = iconType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playPencilScratchSound();
                        setIconType(opt.id);
                      }}
                      className={`py-2 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#A8382A] text-[#FAF7F0] border-[#A8382A] shadow-xs'
                          : 'bg-[#FAF8F3] dark:bg-[#18211D] text-[#6E6352] dark:text-[#C5BBAE] border-[#D8CDBC] dark:border-[#384A40] hover:bg-[#EAE2D2]'
                      }`}
                      title={opt.label}
                    >
                      <IconCmp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Cognitive Reason ("Why It Slows Time") */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6352] dark:text-[#C5BBAE] mb-1">
              Cognitive Insight: Why Does This Slow Down Time?
            </label>
            <input
              type="text"
              value={whyItSlowsTime}
              onChange={e => setWhyItSlowsTime(e.target.value)}
              placeholder="e.g. Shifting motor habits forces high hippocampal attention, generating vivid temporal landmarks."
              className="w-full px-3.5 py-2 bg-[#FAF8F3] dark:bg-[#18211D] border border-[#D5C7B2] dark:border-[#384A40] rounded-xl text-xs text-[#554C3E] dark:text-[#C5BBAE] focus:ring-2 focus:ring-[#2E6B4E] outline-none"
            />
          </div>

        </div>

        {/* Modal Action Footer */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-[#E5DAC8] dark:border-[#2C3831] bg-[#F4EFE3] dark:bg-[#18211D] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#7A6F5E] dark:text-[#A89E8F] hover:bg-[#EAE1D1] dark:hover:bg-[#28352F] cursor-pointer transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-[#FAF8F3] dark:bg-[#25332C] hover:bg-[#EFE8D8] text-[#2C2926] dark:text-[#FAF7F0] font-semibold text-xs rounded-xl border border-[#D5C7B2] dark:border-[#3E5246] transition-colors cursor-pointer shadow-xs"
            >
              Inscribe to Deck
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 bg-[#2E6B4E] hover:bg-[#24573F] text-[#FAF7F0] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:shadow flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Inscribe & Draw Today</span>
            </button>
          </div>
        </div>

      </div>
    </div>
    </ModalPortal>
  );
};
