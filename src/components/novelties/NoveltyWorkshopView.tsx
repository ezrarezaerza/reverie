import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
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
  BookOpen,
  Save,
  Trash2
} from 'lucide-react';
import gsap from 'gsap';
import { MicroNovelty, NoveltyCategory, SensoryCue } from '../../types';
import { SENSORY_CUE_METADATA } from '../../data/microNoveltiesCatalog';
import { soundEngine } from '../../utils/soundEngine';
import { hapticsEngine } from '../../utils/hapticsEngine';

interface NoveltyWorkshopViewProps {
  editingNoveltyId?: string;
  customNovelties: MicroNovelty[];
  onSaveNovelty: (novelty: MicroNovelty, setAsActiveToday?: boolean) => void;
  onDeleteNovelty?: (noveltyId: string) => void;
  onNavigateBack: () => void;
  onNavigateToDossier: (noveltyId: string) => void;
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

const INSPIRATION_BLUEPRINTS: Partial<MicroNovelty>[] = [
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

export const NoveltyWorkshopView: React.FC<NoveltyWorkshopViewProps> = ({
  editingNoveltyId,
  customNovelties,
  onSaveNovelty,
  onDeleteNovelty,
  onNavigateBack,
  onNavigateToDossier
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editingNovelty = editingNoveltyId ? customNovelties.find(n => n.id === editingNoveltyId) : null;

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
  const [isDirty, setIsDirty] = useState(false);

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
    setIsDirty(false);
  }, [editingNoveltyId]);

  // Entrance animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, []);

  const handleApplyBlueprint = (recipe: Partial<MicroNovelty>) => {
    soundEngine.playPencilScratchSound();
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
    setIsDirty(true);
    setFormError(null);
  };

  const handleToggleSensoryCue = (cue: SensoryCue) => {
    soundEngine.playPencilScratchSound();
    setIsDirty(true);
    if (sensoryFocus.includes(cue)) {
      if (sensoryFocus.length > 1) {
        setSensoryFocus(sensoryFocus.filter(c => c !== cue));
      }
    } else {
      setSensoryFocus([...sensoryFocus, cue]);
    }
  };

  const handleResetForm = () => {
    soundEngine.playPencilScratchSound();
    setTitle('');
    setTagline('');
    setInstruction('');
    setCategory('routine_breaker');
    setEstimatedMinutes(3);
    setDifficulty('gentle');
    setSensoryFocus(['touch']);
    setWhyItSlowsTime('');
    setIconType('compass');
    setIsDirty(false);
    setFormError(null);
  };

  const handleSave = (setAsActiveToday = false) => {
    if (!title.trim()) {
      setFormError('Please inscribe a title for your routine breaker.');
      soundEngine.playPencilScratchSound();
      return;
    }
    if (!instruction.trim()) {
      setFormError('Please detail the step-by-step exercise instructions.');
      soundEngine.playPencilScratchSound();
      return;
    }

    soundEngine.playStampSound();
    hapticsEngine.triggerHaptic('stamp');

    const noveltyPayload: MicroNovelty = {
      id: editingNovelty ? editingNovelty.id : `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      tagline: tagline.trim() || 'A personal deliberate break in the routine.',
      instruction: instruction.trim(),
      category,
      estimatedMinutes,
      difficulty,
      sensoryFocus,
      whyItSlowsTime: whyItSlowsTime.trim() || 'Disrupting habitual autopilot forces deliberate neural encoding.',
      iconType,
      isCustom: true,
      createdAt: editingNovelty?.createdAt || new Date().toISOString()
    };

    onSaveNovelty(noveltyPayload, setAsActiveToday);
    setIsDirty(false);
    onNavigateToDossier(noveltyPayload.id);
  };

  const handleDelete = () => {
    if (editingNovelty && onDeleteNovelty) {
      soundEngine.playPencilScratchSound();
      onDeleteNovelty(editingNovelty.id);
      onNavigateBack();
    }
  };

  // Live Card Preview Data
  const previewNovelty: MicroNovelty = {
    id: editingNovelty?.id || 'preview',
    title: title.trim() || 'The Non-Dominant Ritual',
    tagline: tagline.trim() || 'A conscious break from autopilot muscle memory',
    instruction: instruction.trim() || 'Inscribe your step-by-step instructions on the drafting canvas to preview how this routine-breaker appears in your physical deck.',
    category,
    estimatedMinutes,
    difficulty,
    sensoryFocus,
    whyItSlowsTime: whyItSlowsTime.trim() || 'Disrupting habitual autopilot forces deliberate neural encoding.',
    iconType,
    isCustom: true
  };

  const IconComponent = ICON_OPTIONS.find(i => i.id === iconType)?.Icon || Compass;

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto py-3 sm:py-6 px-3 sm:px-6">
      
      {/* Header & Back Navigation */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF6EE] dark:bg-[#1E2723] text-[#423B30] dark:text-[#EAE5D9] hover:bg-[#EFE7D8] dark:hover:bg-[#28352F] text-xs font-semibold border border-[#D9CEBA] dark:border-[#384A40] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          {editingNovelty && onDeleteNovelty && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[#A8382A] dark:text-[#F08A7D] hover:bg-[#F2E8DC] dark:hover:bg-[#2E201E] text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Blueprint</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[#7A6F5E] dark:text-[#A89E8F] hover:bg-[#EAE0CE] dark:hover:bg-[#2C3831] text-xs font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Canvas</span>
          </button>
        </div>
      </div>

      {/* Main Studio Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#A8382A] dark:text-[#F08A7D]">
            The Alchemist's Workshop
          </span>
          <span className="text-xs text-[#827766]">•</span>
          <span className="text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
            {editingNovelty ? 'Refining Existing Blueprint' : 'Drafting New Routine-Breaker'}
          </span>
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#FAF7F0] mt-1">
          {editingNovelty ? `Refine: ${editingNovelty.title}` : 'Craft a Micro-Novelty Blueprint'}
        </h1>
        <p className="text-xs sm:text-sm text-[#C5BBAA] mt-1 max-w-3xl">
          Design your own 2-to-15 minute routine interruption to prevent the adult brain from compressing days into blurry autopilot loops.
        </p>
      </div>

      {/* Quick Inspiration Blueprints Drawer */}
      <div className="bg-[#FAF7F1] dark:bg-[#1C2521] border border-[#D9CEBC] dark:border-[#384A40] rounded-xl p-4 sm:p-5 mb-8 paper-shadow-lifted">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#D9A74A]" />
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#2C2926] dark:text-[#FAF7F0]">
            Quick Inspiration Presets (1-Click Blueprints)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {INSPIRATION_BLUEPRINTS.map((bp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyBlueprint(bp)}
              className="text-left p-2.5 rounded-lg bg-[#F4EEE2] dark:bg-[#232F2A] hover:bg-[#EAE2D2] dark:hover:bg-[#2C3B34] border border-[#DDD0BC] dark:border-[#384A40] transition-colors cursor-pointer group"
            >
              <div className="text-xs font-bold text-[#2C2926] dark:text-[#FAF7F0] group-hover:text-[#A8382A] dark:group-hover:text-[#F08A7D] flex items-center justify-between">
                <span>{bp.title}</span>
                <span className="text-[10px] font-mono text-[#827766]">~{bp.estimatedMinutes}m</span>
              </div>
              <p className="text-[11px] text-[#6E6454] dark:text-[#A89E8F] truncate mt-0.5">
                {bp.tagline}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: The Drafting Board (7 cols) */}
        <div className="lg:col-span-7 bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-2xl border border-[#D9CEBC] dark:border-[#384A40] p-6 sm:p-8">
          
          {formError && (
            <div className="mb-5 p-3 rounded-lg bg-[#FBEBE8] border border-[#F2B8B1] text-[#A8382A] text-xs font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-6">
            
            {/* Title & Tagline */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-1.5">
                Recipe Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setIsDirty(true); }}
                placeholder="e.g., The Non-Dominant Pour, Backward Commute Walk"
                className="w-full px-3.5 py-2.5 bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl text-sm font-semibold text-[#1C355E] dark:text-[#88B2F8] placeholder-[#9E9280] outline-none focus:ring-2 focus:ring-[#2E6B4E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-1.5">
                Poetic Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => { setTagline(e.target.value); setIsDirty(true); }}
                placeholder="e.g., Shatter muscle memory during morning routine"
                className="w-full px-3.5 py-2 bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl text-sm text-[#4A4235] dark:text-[#E2DBCF] placeholder-[#9E9280] outline-none focus:ring-2 focus:ring-[#2E6B4E]"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setCategory(cat.id); soundEngine.playPencilScratchSound(); setIsDirty(true); }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      category === cat.id
                        ? 'bg-[#EAE0CE] dark:bg-[#2A3831] border-[#2E6B4E] dark:border-[#5BA87E] ring-1 ring-[#2E6B4E]'
                        : 'bg-[#FCFAF5] dark:bg-[#222E28] border-[#DDD0BC] dark:border-[#384A40] hover:bg-[#F4EEE2]'
                    }`}
                  >
                    <div className="text-base">{cat.icon}</div>
                    <div className="text-xs font-bold text-[#2C2926] dark:text-[#FAF7F0] mt-1">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-1.5">
                Step-by-Step Exercise Instructions *
              </label>
              <textarea
                rows={4}
                value={instruction}
                onChange={e => { setInstruction(e.target.value); setIsDirty(true); }}
                placeholder="Describe specifically what the user should physically do, look for, or feel..."
                className="w-full px-3.5 py-2.5 bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl text-sm text-[#2C2926] dark:text-[#FAF7F0] placeholder-[#9E9280] leading-relaxed outline-none focus:ring-2 focus:ring-[#2E6B4E]"
              />
            </div>

            {/* Neurocognitive Mechanism */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-1.5">
                Neurocognitive Mechanism (Why It Slows Time)
              </label>
              <textarea
                rows={2}
                value={whyItSlowsTime}
                onChange={e => { setWhyItSlowsTime(e.target.value); setIsDirty(true); }}
                placeholder="Explain the cognitive principle (e.g., Hippocampus landmark encoding, tactile grounding, sensory novelty)..."
                className="w-full px-3.5 py-2.5 bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl text-xs text-[#5D5344] dark:text-[#C5BBAE] placeholder-[#9E9280] outline-none focus:ring-2 focus:ring-[#2E6B4E]"
              />
            </div>

            {/* Time & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2">
                  Estimated Minutes
                </label>
                <div className="flex items-center gap-1.5">
                  {TIME_OPTIONS.map(time => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => { setEstimatedMinutes(time); soundEngine.playPencilScratchSound(); setIsDirty(true); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        estimatedMinutes === time
                          ? 'bg-[#2E6B4E] text-[#FAF7F0]'
                          : 'bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] text-[#5D5344] dark:text-[#C5BBAE] hover:bg-[#F2ECE0]'
                      }`}
                    >
                      {time}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2">
                  Difficulty Pace
                </label>
                <div className="flex items-center gap-1.5">
                  {(['gentle', 'playful', 'deep'] as const).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => { setDifficulty(diff); soundEngine.playPencilScratchSound(); setIsDirty(true); }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                        difficulty === diff
                          ? 'bg-[#1C355E] text-[#FAF7F0]'
                          : 'bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] text-[#5D5344] dark:text-[#C5BBAE] hover:bg-[#F2ECE0]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sensory Focus & Icon Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2">
                  Sensory Focus (Select 1+)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['sight', 'sound', 'scent', 'taste', 'touch', 'serendipity'] as SensoryCue[]).map(cue => {
                    const isSelected = sensoryFocus.includes(cue);
                    return (
                      <button
                        key={cue}
                        type="button"
                        onClick={() => handleToggleSensoryCue(cue)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#2E6B4E] text-[#FAF7F0]'
                            : 'bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] text-[#5D5344] dark:text-[#C5BBAE]'
                        }`}
                      >
                        <span>{SENSORY_CUE_METADATA[cue]?.icon}</span>
                        <span>{cue}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#7A6F5E] dark:text-[#A89E8F] mb-2">
                  Card Emblem
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {ICON_OPTIONS.map(opt => {
                    const isSelected = iconType === opt.id;
                    const OptIcon = opt.Icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setIconType(opt.id); soundEngine.playPencilScratchSound(); setIsDirty(true); }}
                        title={opt.label}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#D9A74A] text-[#2C2926] shadow-xs'
                            : 'bg-[#FCFAF5] dark:bg-[#222E28] border border-[#DDD0BC] dark:border-[#384A40] text-[#5D5344] dark:text-[#C5BBAE] hover:bg-[#F2ECE0]'
                        }`}
                      >
                        <OptIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-8 mt-6 border-t border-[#E3D8C6] dark:border-[#2C3831]">
            <button
              type="button"
              onClick={onNavigateBack}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#5D5344] dark:text-[#C5BBAE] hover:bg-[#EAE0CE] dark:hover:bg-[#2C3831] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#232F2A] hover:bg-[#EAE2D2] text-[#2E6B4E] dark:text-[#6CB28E] border border-[#2E6B4E]/40 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Inscribe to Workshop</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Set as Today's Goal</span>
            </button>
          </div>

        </div>

        {/* Right Column: Live Stationery Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FAF7F0]">
              Live Stationery Card Preview
            </span>
            <span className="text-[10px] font-mono text-[#D9A74A]">
              ● REAL-TIME BLUEPRINT
            </span>
          </div>

          {/* Card Preview Folio */}
          <div className="relative bg-[#FAF7F1] dark:bg-[#1C2521] paper-shadow-lifted rounded-2xl border border-[#D9CEBC] dark:border-[#384A40] p-6 overflow-hidden">
            
            {/* Washi Tape */}
            <div className="washi-tape washi-sage absolute -top-3 left-6 w-32 h-5 text-[9px] text-[#2C4A32] font-bold flex items-center justify-center">
              ★ HANDCRAFTED SEED
            </div>

            <div className="flex items-center justify-between mt-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8382A] dark:text-[#F08A7D]">
                {previewNovelty.category.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-[#7A6F5E] dark:text-[#A89E8F] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#A8382A] dark:text-[#F08A7D]" />
                ~{previewNovelty.estimatedMinutes}m
              </span>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F0E6D4] dark:bg-[#26332C] text-[#2E6B4E] dark:text-[#6CB28E] flex items-center justify-center shrink-0 border border-[#DCD0BE] dark:border-[#384A40] shadow-xs">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-[#24211E] dark:text-[#FAF7F0]">
                  {previewNovelty.title}
                </h3>
                <p className="font-hand text-base text-[#6B5738] dark:text-[#DEAC5D]">
                  "{previewNovelty.tagline}"
                </p>
              </div>
            </div>

            <div className="ruled-paper bg-[#FCFAF5] dark:bg-[#232F2A] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl p-4 text-xs sm:text-sm text-[#38332B] dark:text-[#E2DBCF] leading-relaxed mb-4 shadow-inner">
              {previewNovelty.instruction}
            </div>

            <div className="bg-[#F8F5EE] dark:bg-[#19221E] border border-[#E0D5C3] dark:border-[#2E3C34] p-3 rounded-lg mb-4 text-[11px] text-[#5D5344] dark:text-[#C5BBAE]">
              <span className="font-semibold text-[#2C2926] dark:text-[#FAF7F0]">Mechanism: </span>
              {previewNovelty.whyItSlowsTime}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#E8DFCFA] dark:border-[#2C3831]">
              {previewNovelty.sensoryFocus.map(cue => (
                <span
                  key={cue}
                  className="text-[10px] px-2 py-0.5 bg-[#EAE1D1] dark:bg-[#2A3630] text-[#3D3529] dark:text-[#E2DBCF] rounded font-medium"
                >
                  {SENSORY_CUE_METADATA[cue]?.icon} {cue}
                </span>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
