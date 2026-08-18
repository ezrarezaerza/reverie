import React, { useState, useRef } from 'react';
import { 
  X, 
  Printer, 
  BookOpen, 
  Scissors, 
  FileText, 
  Sparkles, 
  Layers, 
  Sliders, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  MapPin,
  CloudSun,
  Flame,
  Zap,
  Star,
  Coffee,
  Sparkle,
  Sun,
  Info,
  Download,
  HelpCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { MemoryEntry, SensoryCue, MoodStamp } from '../types';
import { SENSORY_CUE_METADATA, TIME_PACING_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';
import { hapticsEngine } from '../utils/hapticsEngine';
import { parseLocalDate, formatDisplayDate } from '../utils/dateUtils';

interface PrintableZineModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: MemoryEntry[];
  currentSelectedEntry?: MemoryEntry | null;
  userName?: string;
}

type ZineFormat = 'pocket-zine' | 'field-booklet' | 'archival-card';
type PaperTone = 'parchment' | 'sepia' | 'clean' | 'blueprint';
type FontStyle = 'handwriting' | 'typewriter' | 'editorial';
type DateScope = 'all' | 'recent-8' | 'this-month' | 'favorites' | 'single';

const STAMP_CONFIG: Record<MoodStamp, { label: string; icon: React.FC<{ className?: string }> }> = {
  CORE_MEMORY: { label: 'CORE MEMORY', icon: Zap },
  ROUTINE_BREAKER: { label: 'ROUTINE BREAKER', icon: Sparkles },
  MUNDANE_MAGIC: { label: 'MUNDANE MAGIC', icon: Star },
  QUIET_MOMENT: { label: 'QUIET MOMENT', icon: Coffee },
  SERENDIPITY: { label: 'SERENDIPITY', icon: Sparkle },
  GENTLE_DAY: { label: 'GENTLE DAY', icon: Sun }
};

export const PrintableZineModal: React.FC<PrintableZineModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentSelectedEntry,
  userName = 'Keeper of Moments'
}) => {
  const [zineFormat, setZineFormat] = useState<ZineFormat>('pocket-zine');
  const [dateScope, setDateScope] = useState<DateScope>('all');
  const [paperTone, setPaperTone] = useState<PaperTone>('parchment');
  const [fontStyle, setFontStyle] = useState<FontStyle>('handwriting');
  const [previewTab, setPreviewTab] = useState<'sheet' | 'sequential' | 'guide'>('sheet');
  const [activeSequentialPage, setActiveSequentialPage] = useState<number>(0);

  // Layout customization toggles
  const [showRuledLines, setShowRuledLines] = useState<boolean>(true);
  const [showSensoryStamps, setShowSensoryStamps] = useState<boolean>(true);
  const [showNoveltyBadges, setShowNoveltyBadges] = useState<boolean>(true);
  const [showCoverAndColophon, setShowCoverAndColophon] = useState<boolean>(true);

  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filter and sort entries based on chosen date scope
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getFilteredEntries = (): MemoryEntry[] => {
    if (dateScope === 'single' && currentSelectedEntry) {
      return [currentSelectedEntry];
    }
    if (dateScope === 'favorites') {
      const favs = sortedEntries.filter(e => e.isFavorite);
      return favs.length > 0 ? favs : sortedEntries;
    }
    if (dateScope === 'this-month') {
      const now = new Date();
      const currentYearMonth = format(now, 'yyyy-MM');
      const thisMonthEntries = sortedEntries.filter(e => e.date.startsWith(currentYearMonth));
      return thisMonthEntries.length > 0 ? thisMonthEntries : sortedEntries.slice(-8);
    }
    if (dateScope === 'recent-8' || zineFormat === 'pocket-zine') {
      return sortedEntries.slice(-6); // 6 entries + Cover + Colophon = exactly 8 pages
    }
    return sortedEntries;
  };

  const activeEntries = getFilteredEntries();

  // Paper Tone Background & Text styling
  const getPaperToneClasses = () => {
    switch (paperTone) {
      case 'sepia':
        return 'bg-[#F4EADA] text-[#3D2C1D] border-[#D4C3AB]';
      case 'clean':
        return 'bg-[#FFFFFF] text-[#1A1A1A] border-[#D1D5DB]';
      case 'blueprint':
        return 'bg-[#F0F5FA] text-[#162A45] border-[#CBD8E6]';
      case 'parchment':
      default:
        return 'bg-[#FAF6EE] text-[#2C2926] border-[#DDD0BC]';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontStyle) {
      case 'typewriter':
        return 'font-typewriter tracking-tight';
      case 'editorial':
        return 'font-display';
      case 'handwriting':
      default:
        return 'font-hand';
    }
  };

  const handlePrint = () => {
    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('stamp');
    window.print();
  };

  // Compute stats for colophon
  const totalDays = activeEntries.length;
  const firstDate = activeEntries.length > 0 ? activeEntries[0].date : '2026-01-01';
  const lastDate = activeEntries.length > 0 ? activeEntries[activeEntries.length - 1].date : '2026-12-31';

  return (
    <div 
      id="printable-zine-modal-root"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl bg-[#232A26] rounded-2xl border border-[#3E4D45] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header Bar (Screen Only) */}
        <div className="zine-screen-only flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#35433B] bg-[#1B221E] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2B3831] text-[#D9A74A] border border-[#44564D] shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-[#FAF7F0] flex items-center gap-2">
                <span>Vintage Zine & Bookbinding Studio</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A8382A] text-[#FAF7F0] font-semibold uppercase">
                  Print Ready
                </span>
              </h3>
              <p className="text-xs text-[#A89E8F]">
                Transform your digital memory ledger into printable pocket zines and bindable field notebooks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#2E6B4E] hover:bg-[#255840] active:scale-95 text-[#FAF7F0] text-xs font-semibold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              title="Print directly or save as high-resolution PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playPaperTurnSound();
                onClose();
              }}
              className="p-2 text-[#A89E8F] hover:text-[#FAF7F0] hover:bg-[#2D3832] rounded-xl transition-colors cursor-pointer"
              aria-label="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body: Controls on Left, Live Print Preview on Right */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Configuration Sidebar (Screen Only) */}
          <div className="zine-screen-only lg:col-span-4 p-4 sm:p-5 bg-[#1C231F] border-r border-[#35433B] overflow-y-auto space-y-5 text-xs text-[#C5BBAE]">
            
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-bold text-[#FAF7F0] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-[#D9A74A]" />
                <span>Publication Format</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setZineFormat('pocket-zine');
                    soundEngine.playPaperTurnSound();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    zineFormat === 'pocket-zine'
                      ? 'bg-[#2B3931] border-[#527361] text-[#FAF7F0] shadow-sm'
                      : 'bg-[#181E1B] border-[#303D36] text-[#A89E8F] hover:border-[#405248]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-[#D9A74A]" />
                      <span>8-Page Pocket Zine (Single Sheet)</span>
                    </span>
                    {zineFormat === 'pocket-zine' && <Check className="w-3.5 h-3.5 text-[#5BA87E]" />}
                  </div>
                  <p className="text-[11px] text-[#8E8373] leading-relaxed">
                    1-page landscape imposition. Fold into an authentic 8-page pocket booklet with 1 scissors cut.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZineFormat('field-booklet');
                    soundEngine.playPaperTurnSound();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    zineFormat === 'field-booklet'
                      ? 'bg-[#2B3931] border-[#527361] text-[#FAF7F0] shadow-sm'
                      : 'bg-[#181E1B] border-[#303D36] text-[#A89E8F] hover:border-[#405248]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#D9A74A]" />
                      <span>Field Notebook (Multi-Page Folio)</span>
                    </span>
                    {zineFormat === 'field-booklet' && <Check className="w-3.5 h-3.5 text-[#5BA87E]" />}
                  </div>
                  <p className="text-[11px] text-[#8E8373] leading-relaxed">
                    Full-sized A4/Letter booklet with Cover, Table of Contents, ruled entry folios, and closing Colophon.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZineFormat('archival-card');
                    soundEngine.playPaperTurnSound();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    zineFormat === 'archival-card'
                      ? 'bg-[#2B3931] border-[#527361] text-[#FAF7F0] shadow-sm'
                      : 'bg-[#181E1B] border-[#303D36] text-[#A89E8F] hover:border-[#405248]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-xs mb-1">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#D9A74A]" />
                      <span>Single Keepsake Card (5x7" / A5)</span>
                    </span>
                    {zineFormat === 'archival-card' && <Check className="w-3.5 h-3.5 text-[#5BA87E]" />}
                  </div>
                  <p className="text-[11px] text-[#8E8373] leading-relaxed">
                    A solitary, framed archival memory print suitable for bulletin boards or scrapbook scrapbooking.
                  </p>
                </button>
              </div>
            </div>

            {/* Scope / Filter */}
            <div>
              <label className="block text-xs font-bold text-[#FAF7F0] uppercase tracking-wider mb-2 font-mono">
                Date Span & Entries ({activeEntries.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['all', 'recent-8', 'this-month', 'favorites'] as DateScope[]).map(scope => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => {
                      setDateScope(scope);
                      soundEngine.playPencilScratchSound();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors cursor-pointer ${
                      dateScope === scope
                        ? 'bg-[#2B3931] border-[#5BA87E] text-[#FAF7F0] font-semibold'
                        : 'bg-[#181E1B] border-[#303D36] text-[#A89E8F] hover:bg-[#202723]'
                    }`}
                  >
                    {scope === 'all' ? 'All Memories' : scope === 'recent-8' ? 'Recent 6–8' : scope.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Tone & Font */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#FAF7F0] uppercase tracking-wider mb-1.5 font-mono">
                  Paper Tone
                </label>
                <select
                  value={paperTone}
                  onChange={e => setPaperTone(e.target.value as PaperTone)}
                  className="w-full bg-[#181E1B] border border-[#303D36] rounded-lg px-2.5 py-1.5 text-xs text-[#FAF7F0] outline-none cursor-pointer"
                >
                  <option value="parchment">Warm Parchment</option>
                  <option value="sepia">Vintage Newsprint</option>
                  <option value="clean">High-Contrast White</option>
                  <option value="blueprint">Blueprint Cyan</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#FAF7F0] uppercase tracking-wider mb-1.5 font-mono">
                  Typography
                </label>
                <select
                  value={fontStyle}
                  onChange={e => setFontStyle(e.target.value as FontStyle)}
                  className="w-full bg-[#181E1B] border border-[#303D36] rounded-lg px-2.5 py-1.5 text-xs text-[#FAF7F0] outline-none cursor-pointer"
                >
                  <option value="handwriting">Ballpoint Script</option>
                  <option value="typewriter">1970s Typewriter</option>
                  <option value="editorial">Editorial Serif</option>
                </select>
              </div>
            </div>

            {/* Visual Options */}
            <div className="space-y-2 pt-2 border-t border-[#35433B]">
              <label className="block text-[11px] font-bold text-[#FAF7F0] uppercase tracking-wider mb-1 font-mono">
                Analog Artifact Details
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Show College-Ruled Lines</span>
                <input
                  type="checkbox"
                  checked={showRuledLines}
                  onChange={e => setShowRuledLines(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2E6B4E] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Include Rubber Stamps & Sensory Anchors</span>
                <input
                  type="checkbox"
                  checked={showSensoryStamps}
                  onChange={e => setShowSensoryStamps(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2E6B4E] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Include Micro-Novelty Badges</span>
                <input
                  type="checkbox"
                  checked={showNoveltyBadges}
                  onChange={e => setShowNoveltyBadges(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2E6B4E] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1">
                <span>Include Cover Page & Colophon</span>
                <input
                  type="checkbox"
                  checked={showCoverAndColophon}
                  onChange={e => setShowCoverAndColophon(e.target.checked)}
                  className="w-3.5 h-3.5 accent-[#2E6B4E] cursor-pointer"
                />
              </label>
            </div>

            {/* Folding Instructions Quick Button */}
            {zineFormat === 'pocket-zine' && (
              <div className="pt-2 border-t border-[#35433B]">
                <button
                  type="button"
                  onClick={() => setPreviewTab(previewTab === 'guide' ? 'sheet' : 'guide')}
                  className="w-full py-2 bg-[#26312B] hover:bg-[#303E37] text-[#FAF7F0] border border-[#3E4F46] rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors cursor-pointer"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#D9A74A]" />
                  <span>{previewTab === 'guide' ? 'Hide Folding Guide' : 'How to Fold Your Mini-Zine (Guide)'}</span>
                </button>
              </div>
            )}

          </div>

          {/* Right Preview Viewport */}
          <div className="lg:col-span-8 bg-[#171D1A] p-3 sm:p-5 flex flex-col overflow-y-auto relative">
            
            {/* View Switcher Controls (Screen Only) */}
            <div className="zine-screen-only flex items-center justify-between mb-4 pb-3 border-b border-[#2C3831] shrink-0">
              <div className="flex items-center gap-1 bg-[#1F2723] p-1 rounded-xl border border-[#35433C]">
                {zineFormat === 'pocket-zine' && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab('sheet')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewTab === 'sheet'
                        ? 'bg-[#2E6B4E] text-[#FAF7F0] shadow-xs'
                        : 'text-[#A89E8F] hover:text-[#FAF7F0]'
                    }`}
                  >
                    Imposed Print Sheet (1 Page)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewTab('sequential')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    previewTab === 'sequential'
                      ? 'bg-[#2E6B4E] text-[#FAF7F0] shadow-xs'
                      : 'text-[#A89E8F] hover:text-[#FAF7F0]'
                  }`}
                >
                  Sequential Pages View
                </button>

                {zineFormat === 'pocket-zine' && (
                  <button
                    type="button"
                    onClick={() => setPreviewTab('guide')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      previewTab === 'guide'
                        ? 'bg-[#A8382A] text-[#FAF7F0] shadow-xs'
                        : 'text-[#A89E8F] hover:text-[#FAF7F0]'
                    }`}
                  >
                    Folding Tutorial
                  </button>
                )}
              </div>

              <span className="text-[11px] text-[#8E8373] font-mono hidden sm:inline">
                Scale: 100% Print Ready
              </span>
            </div>

            {/* Visual Folding Guide Drawer */}
            {previewTab === 'guide' && (
              <div className="zine-screen-only bg-[#1F2824] rounded-2xl border border-[#38483F] p-5 sm:p-6 mb-4 text-[#FAF7F0] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#303E36]">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-[#D9A74A]" />
                    <h4 className="font-display font-bold text-base text-[#FAF7F0]">
                      How to Fold an 8-Page Pocket Zine (1 Sheet of Paper)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('sheet')}
                    className="text-xs text-[#A89E8F] hover:text-[#FAF7F0] underline cursor-pointer"
                  >
                    Back to Sheet Preview
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-[#18201C] p-3.5 rounded-xl border border-[#2B3830] space-y-2">
                    <div className="w-6 h-6 rounded-full bg-[#2E6B4E] text-[#FAF7F0] flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h5 className="font-bold text-sm text-[#D9A74A]">The Long Fold</h5>
                    <p className="text-[#A89E8F] text-[11px] leading-relaxed">
                      Print the sheet in Landscape orientation. Fold the paper in half lengthwise (hotdog fold), creasing sharply, then unfold.
                    </p>
                  </div>

                  <div className="bg-[#18201C] p-3.5 rounded-xl border border-[#2B3830] space-y-2">
                    <div className="w-6 h-6 rounded-full bg-[#2E6B4E] text-[#FAF7F0] flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h5 className="font-bold text-sm text-[#D9A74A]">The 8-Grid Folds</h5>
                    <p className="text-[#A89E8F] text-[11px] leading-relaxed">
                      Fold in half widthwise (hamburger fold), then fold both outer flaps into the center fold to create 8 distinct rectangular panels.
                    </p>
                  </div>

                  <div className="bg-[#18201C] p-3.5 rounded-xl border border-[#2B3830] space-y-2">
                    <div className="w-6 h-6 rounded-full bg-[#A8382A] text-[#FAF7F0] flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h5 className="font-bold text-sm text-[#F08A7D]">The Center Cut</h5>
                    <p className="text-[#A89E8F] text-[11px] leading-relaxed">
                      Fold in half widthwise. Use scissors to cut along the center horizontal crease between pages 2-3 and 5-6 (only between the center 2 panels).
                    </p>
                  </div>

                  <div className="bg-[#18201C] p-3.5 rounded-xl border border-[#2B3830] space-y-2">
                    <div className="w-6 h-6 rounded-full bg-[#2E6B4E] text-[#FAF7F0] flex items-center justify-center font-bold text-xs">
                      4
                    </div>
                    <h5 className="font-bold text-sm text-[#D9A74A]">Pop into Booklet</h5>
                    <p className="text-[#A89E8F] text-[11px] leading-relaxed">
                      Open the sheet lengthwise. Push the two outer ends toward each other so the cut diamond center pops out into a "+" cross, then fold into an 8-page book!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PRINTABLE CONTAINER (Rendered on screen and isolated during window.print()) */}
            <div 
              ref={printAreaRef}
              className="printable-zine-export-wrapper w-full flex-1 flex flex-col items-center justify-start overflow-y-auto"
            >
              
              {/* ========================================================================= */}
              {/* FORMAT 1: 8-PAGE POCKET ZINE (IMPOSED 1-SHEET LANDSCAPE) */}
              {/* ========================================================================= */}
              {zineFormat === 'pocket-zine' && previewTab === 'sheet' && (
                <div 
                  className={`zine-sheet-landscape w-full max-w-[1000px] aspect-[1.414/1] ${getPaperToneClasses()} rounded-xl border border-[#C8BBA5] shadow-2xl p-4 sm:p-6 grid grid-cols-4 grid-rows-2 relative overflow-hidden`}
                  style={{
                    backgroundImage: showRuledLines ? 'linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px)' : 'none',
                    backgroundSize: '100% 16px'
                  }}
                >
                  {/* Central Folding & Cutting Guide Lines (Screen + Print) */}
                  <div className="absolute inset-0 pointer-events-none z-20">
                    {/* Horizontal fold line */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] border-b zine-fold-line opacity-75" />
                    {/* Horizontal central cut line */}
                    <div className="absolute top-1/2 left-1/4 right-1/4 h-[2px] zine-cut-line border-b-2 opacity-90 flex items-center justify-center">
                      <span className="bg-[#FAF6EE] px-1 text-[9px] font-mono text-[#A8382A] font-bold flex items-center gap-1 -translate-y-0.5">
                        <Scissors className="w-3 h-3 inline-block" /> CUT HERE
                      </span>
                    </div>
                    {/* Vertical fold lines (3 column dividers) */}
                    <div className="absolute top-0 bottom-0 left-1/4 w-[1px] border-r zine-fold-line opacity-75" />
                    <div className="absolute top-0 bottom-0 left-2/4 w-[1px] border-r zine-fold-line opacity-75" />
                    <div className="absolute top-0 bottom-0 left-3/4 w-[1px] border-r zine-fold-line opacity-75" />
                  </div>

                  {/* ---------------- TOP ROW (Upside Down for Physical Folding Imposition) ---------------- */}
                  
                  {/* Panel 1: Page 8 (Back Colophon) */}
                  <div className="zine-inverted-panel p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative text-[10px]">
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono font-bold uppercase text-[#8C3A27] tracking-wider">
                        Folio 8 • Colophon
                      </div>
                      <h5 className="font-display font-bold text-xs text-[#2E4A3D]">Reverie Ledger</h5>
                      <p className="text-[9px] text-[#6A6050] leading-tight">
                        Printed on {format(new Date(), 'MMMM d, yyyy')}. A private archive of mundane magic and temporal grounding.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#E5DAC8] text-[8px] font-mono text-[#8C7F6E]">
                      <div>Days Reflected: {totalDays}</div>
                      <div>Archive: {firstDate} to {lastDate}</div>
                    </div>
                  </div>

                  {/* Panel 2: Page 1 (Front Cover) */}
                  <div className="zine-inverted-panel p-2.5 sm:p-3 flex flex-col justify-between items-center text-center border border-dashed border-[#DDD0BC]/60 relative">
                    <div className="w-full washi-tape washi-ochre h-3 flex items-center justify-center text-[7px] font-mono text-[#4A2F0F] font-bold">
                      REVERIE POCKET ZINE
                    </div>
                    <div className="space-y-1 my-auto">
                      <h4 className="font-display font-black text-sm sm:text-base text-[#2E4A3D] leading-tight tracking-tight">
                        SLOW TIME
                      </h4>
                      <p className="text-[9px] text-[#A8382A] font-semibold italic">
                        Field Memories & Micro-Novelties
                      </p>
                      <div className="text-[8px] font-mono text-[#6A6050] pt-1">
                        By: {userName}
                      </div>
                    </div>
                    <div className="text-[8px] font-mono text-[#8C7F6E] uppercase tracking-wider">
                      Vol. I • Pocket Edition
                    </div>
                  </div>

                  {/* Panel 3: Page 2 (Memory 1) */}
                  <div className="zine-inverted-panel p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative">
                    {activeEntries[0] ? (
                      <>
                        <div>
                          <div className="flex items-baseline justify-between text-[8px] font-mono pb-1 border-b border-[#E5DAC8] text-[#8C3A27]">
                            <span>Page 2</span>
                            <span>{format(parseLocalDate(activeEntries[0].date), 'MMM d, yyyy')}</span>
                          </div>
                          <h5 className={`font-bold text-xs text-[#1C355E] pt-1 leading-snug line-clamp-2 ${getFontFamilyClass()}`}>
                            {activeEntries[0].title}
                          </h5>
                          <p className={`text-[10px] text-[#2C2926] pt-1 leading-tight line-clamp-6 ${getFontFamilyClass()}`}>
                            {activeEntries[0].body}
                          </p>
                        </div>
                        {showSensoryStamps && activeEntries[0].moodStamp && (
                          <div className="text-[8px] font-mono text-[#2E6B4E] uppercase">
                            • {activeEntries[0].moodStamp.replace('_', ' ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-center my-auto text-[#A89E8F]">Blank Page</div>
                    )}
                  </div>

                  {/* Panel 4: Page 3 (Memory 2) */}
                  <div className="zine-inverted-panel p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative">
                    {activeEntries[1] ? (
                      <>
                        <div>
                          <div className="flex items-baseline justify-between text-[8px] font-mono pb-1 border-b border-[#E5DAC8] text-[#8C3A27]">
                            <span>Page 3</span>
                            <span>{format(parseLocalDate(activeEntries[1].date), 'MMM d, yyyy')}</span>
                          </div>
                          <h5 className={`font-bold text-xs text-[#1C355E] pt-1 leading-snug line-clamp-2 ${getFontFamilyClass()}`}>
                            {activeEntries[1].title}
                          </h5>
                          <p className={`text-[10px] text-[#2C2926] pt-1 leading-tight line-clamp-6 ${getFontFamilyClass()}`}>
                            {activeEntries[1].body}
                          </p>
                        </div>
                        {showSensoryStamps && activeEntries[1].sensoryCues && activeEntries[1].sensoryCues.length > 0 && (
                          <div className="text-[8px] font-mono text-[#6A6050] truncate">
                            Senses: {activeEntries[1].sensoryCues.join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-center my-auto text-[#A89E8F]">Blank Page</div>
                    )}
                  </div>

                  {/* ---------------- BOTTOM ROW (Right-side up) ---------------- */}

                  {/* Panel 5: Page 7 (Memory 6) */}
                  <div className="p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative">
                    {activeEntries[5] ? (
                      <>
                        <div>
                          <div className="flex items-baseline justify-between text-[8px] font-mono pb-1 border-b border-[#E5DAC8] text-[#8C3A27]">
                            <span>Page 7</span>
                            <span>{format(parseLocalDate(activeEntries[5].date), 'MMM d, yyyy')}</span>
                          </div>
                          <h5 className={`font-bold text-xs text-[#1C355E] pt-1 leading-snug line-clamp-2 ${getFontFamilyClass()}`}>
                            {activeEntries[5].title}
                          </h5>
                          <p className={`text-[10px] text-[#2C2926] pt-1 leading-tight line-clamp-6 ${getFontFamilyClass()}`}>
                            {activeEntries[5].body}
                          </p>
                        </div>
                        {showNoveltyBadges && activeEntries[5].linkedNoveltyTitle && (
                          <div className="text-[8px] font-mono text-[#8C3A27] truncate">
                            ★ {activeEntries[5].linkedNoveltyTitle}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-center my-auto text-[#A89E8F]">Blank Page</div>
                    )}
                  </div>

                  {/* Panel 6: Page 6 (Memory 5) */}
                  <div className="p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative">
                    {activeEntries[4] ? (
                      <>
                        <div>
                          <div className="flex items-baseline justify-between text-[8px] font-mono pb-1 border-b border-[#E5DAC8] text-[#8C3A27]">
                            <span>Page 6</span>
                            <span>{format(parseLocalDate(activeEntries[4].date), 'MMM d, yyyy')}</span>
                          </div>
                          <h5 className={`font-bold text-xs text-[#1C355E] pt-1 leading-snug line-clamp-2 ${getFontFamilyClass()}`}>
                            {activeEntries[4].title}
                          </h5>
                          <p className={`text-[10px] text-[#2C2926] pt-1 leading-tight line-clamp-6 ${getFontFamilyClass()}`}>
                            {activeEntries[4].body}
                          </p>
                        </div>
                        {showSensoryStamps && activeEntries[4].moodStamp && (
                          <div className="text-[8px] font-mono text-[#2E6B4E] uppercase">
                            • {activeEntries[4].moodStamp.replace('_', ' ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-center my-auto text-[#A89E8F]">Blank Page</div>
                    )}
                  </div>

                  {/* Panel 7: Page 5 (Memory 4) */}
                  <div className="p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative">
                    {activeEntries[3] ? (
                      <>
                        <div>
                          <div className="flex items-baseline justify-between text-[8px] font-mono pb-1 border-b border-[#E5DAC8] text-[#8C3A27]">
                            <span>Page 5</span>
                            <span>{format(parseLocalDate(activeEntries[3].date), 'MMM d, yyyy')}</span>
                          </div>
                          <h5 className={`font-bold text-xs text-[#1C355E] pt-1 leading-snug line-clamp-2 ${getFontFamilyClass()}`}>
                            {activeEntries[3].title}
                          </h5>
                          <p className={`text-[10px] text-[#2C2926] pt-1 leading-tight line-clamp-6 ${getFontFamilyClass()}`}>
                            {activeEntries[3].body}
                          </p>
                        </div>
                        {showSensoryStamps && activeEntries[3].sensoryCues && (
                          <div className="text-[8px] font-mono text-[#6A6050] truncate">
                            Senses: {activeEntries[3].sensoryCues.join(', ')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-center my-auto text-[#A89E8F]">Blank Page</div>
                    )}
                  </div>

                  {/* Panel 8: Page 4 (Memory 3) */}
                  <div className="p-2.5 sm:p-3 flex flex-col justify-between border border-dashed border-[#DDD0BC]/60 relative">
                    {activeEntries[2] ? (
                      <>
                        <div>
                          <div className="flex items-baseline justify-between text-[8px] font-mono pb-1 border-b border-[#E5DAC8] text-[#8C3A27]">
                            <span>Page 4</span>
                            <span>{format(parseLocalDate(activeEntries[2].date), 'MMM d, yyyy')}</span>
                          </div>
                          <h5 className={`font-bold text-xs text-[#1C355E] pt-1 leading-snug line-clamp-2 ${getFontFamilyClass()}`}>
                            {activeEntries[2].title}
                          </h5>
                          <p className={`text-[10px] text-[#2C2926] pt-1 leading-tight line-clamp-6 ${getFontFamilyClass()}`}>
                            {activeEntries[2].body}
                          </p>
                        </div>
                        {showNoveltyBadges && activeEntries[2].linkedNoveltyTitle && (
                          <div className="text-[8px] font-mono text-[#8C3A27] truncate">
                            ★ {activeEntries[2].linkedNoveltyTitle}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-[9px] text-center my-auto text-[#A89E8F]">Blank Page</div>
                    )}
                  </div>

                </div>
              )}

              {/* ========================================================================= */}
              {/* FORMAT 2 & 3: SEQUENTIAL MULTI-PAGE BOOKLET & ARCHIVAL CARDS */}
              {/* ========================================================================= */}
              {(zineFormat === 'field-booklet' || zineFormat === 'archival-card' || previewTab === 'sequential') && (
                <div className="w-full max-w-2xl space-y-8">
                  
                  {/* Booklet Cover Page (Only if enabled) */}
                  {showCoverAndColophon && zineFormat === 'field-booklet' && (
                    <div className={`booklet-folio-page p-8 sm:p-12 ${getPaperToneClasses()} rounded-2xl border border-[#C8BBA5] shadow-xl flex flex-col justify-between items-center text-center min-h-[560px]`}>
                      <div className="w-full flex items-center justify-between border-b border-[#D5C9B4] pb-3 text-xs font-mono text-[#7A6F5E]">
                        <span>VOL. I</span>
                        <span>ANALOG FIELD FOLIOS</span>
                        <span>{format(new Date(), 'yyyy')}</span>
                      </div>

                      <div className="my-auto space-y-4 max-w-md">
                        <div className="washi-tape washi-terracotta mx-auto w-40 h-6 flex items-center justify-center text-[10px] font-mono text-[#4A1E17] font-bold">
                          PRIVATE MEMORY VAULT
                        </div>
                        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2E4A3D] tracking-tight leading-tight">
                          REVERIE
                        </h2>
                        <div className="h-[2px] w-24 bg-[#A8382A] mx-auto my-2" />
                        <p className="text-sm font-semibold text-[#8C3A27] italic">
                          A Field Guide to Routine-Breaking & Mundane Core Memories
                        </p>
                        <div className="pt-4 border-t border-[#E5DAC8] text-xs font-mono space-y-1 text-[#6A6050]">
                          <div>Inscribed by: <strong>{userName}</strong></div>
                          <div>Span: {activeEntries.length} Recorded Days</div>
                        </div>
                      </div>

                      <div className="w-full text-center text-[10px] font-mono text-[#8C7F6E] border-t border-[#D5C9B4] pt-3">
                        DO NOT DISTURB • CONTAINS PRIVATE THOUGHTS
                      </div>
                    </div>
                  )}

                  {/* Individual Folio Entries */}
                  {activeEntries.map((entry, idx) => {
                    const dateObj = parseLocalDate(entry.date);
                    const currentStamp = entry.moodStamp || 'ROUTINE_BREAKER';
                    const StampIcon = STAMP_CONFIG[currentStamp]?.icon || Sparkles;

                    return (
                      <div 
                        key={entry.id}
                        className={`booklet-folio-page p-6 sm:p-10 ${getPaperToneClasses()} rounded-2xl border border-[#C8BBA5] shadow-xl space-y-5 print-avoid-break min-h-[480px] flex flex-col justify-between`}
                        style={{
                          backgroundImage: showRuledLines 
                            ? 'linear-gradient(90deg, transparent 40px, rgba(239, 68, 68, 0.25) 40px, rgba(239, 68, 68, 0.25) 41px, transparent 41px), repeating-linear-gradient(transparent, transparent 27px, rgba(59, 130, 246, 0.12) 27px, rgba(59, 130, 246, 0.12) 28px)'
                            : 'none',
                          backgroundSize: '100% 28px'
                        }}
                      >
                        <div>
                          {/* Folio Header Zone */}
                          <div className="flex items-baseline justify-between pb-2 border-b-2 border-[#E5DAC8] text-[#2E4A3D]">
                            <div className="flex items-baseline gap-2">
                              <span className="font-display font-bold text-xl sm:text-2xl">
                                {format(dateObj, 'EEEE')}
                              </span>
                              <span className="font-display text-sm sm:text-base text-[#A8382A]">
                                {format(dateObj, 'MMMM d, yyyy')}
                              </span>
                            </div>

                            <span className="text-xs font-mono font-bold text-[#8C7F6E]">
                              Folio #{idx + 1}
                            </span>
                          </div>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#6A6050] pt-2">
                            {entry.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#A8382A]" />
                                <span>{entry.location}</span>
                              </span>
                            )}
                            {entry.weather && (
                              <span className="flex items-center gap-1">
                                <CloudSun className="w-3 h-3 text-[#2E6B4E]" />
                                <span>{entry.weather}</span>
                              </span>
                            )}
                            {entry.timePacing && (
                              <span className="flex items-center gap-1 font-semibold text-[#1C355E]">
                                <span>{TIME_PACING_METADATA[entry.timePacing]?.symbol}</span>
                                <span>{TIME_PACING_METADATA[entry.timePacing]?.label}</span>
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className={`font-bold text-2xl text-[#1C355E] pt-3 leading-snug ${getFontFamilyClass()}`}>
                            {entry.title}
                          </h3>

                          {/* Body */}
                          <p className={`text-xl text-[#2C2926] pt-3 leading-relaxed whitespace-pre-wrap ${getFontFamilyClass()}`}>
                            {entry.body}
                          </p>

                          {/* Linked Micro-Novelty */}
                          {showNoveltyBadges && entry.linkedNoveltyTitle && (
                            <div className="mt-4 p-3 rounded-lg bg-[#EFE7D8] border border-[#DDD0BC] text-xs">
                              <span className="font-mono text-[10px] uppercase font-bold text-[#8C3A27]">
                                Micro-Novelty Experiment:
                              </span>
                              <p className="font-medium text-[#2C2926] mt-0.5">
                                "{entry.linkedNoveltyTitle}"
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer & Rubber Stamp */}
                        <div className="pt-3 border-t border-[#E5DAC8] flex items-center justify-between">
                          {showSensoryStamps && entry.sensoryCues && entry.sensoryCues.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-[#6A6050]">
                              <span>SENSES:</span>
                              {entry.sensoryCues.map(c => (
                                <span key={c} className="px-1.5 py-0.5 bg-[#EAE0CE] rounded text-[10px]">
                                  {SENSORY_CUE_METADATA[c]?.icon} {c}
                                </span>
                              ))}
                            </div>
                          ) : <div />}

                          {showSensoryStamps && (
                            <div className={currentStamp === 'CORE_MEMORY' || currentStamp === 'ROUTINE_BREAKER' ? 'rubber-stamp flex items-center gap-1 text-[10px]' : 'rubber-stamp-green flex items-center gap-1 text-[10px]'}>
                              <StampIcon className="w-3 h-3" />
                              <span>{STAMP_CONFIG[currentStamp]?.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Colophon & Index Page */}
                  {showCoverAndColophon && zineFormat === 'field-booklet' && (
                    <div className={`booklet-folio-page p-8 sm:p-12 ${getPaperToneClasses()} rounded-2xl border border-[#C8BBA5] shadow-xl space-y-6 min-h-[480px] flex flex-col justify-between`}>
                      <div className="space-y-4">
                        <div className="pb-3 border-b border-[#D5C9B4]">
                          <h4 className="font-display font-bold text-xl text-[#2E4A3D]">
                            Colophon & Memory Statistics
                          </h4>
                          <p className="text-xs text-[#7A6F5E] font-mono">
                            Recorded via Reverie PWA • Text-Only Cognitive Grounding
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="p-3.5 bg-[#F0E8DA] rounded-xl border border-[#DDD0BC] space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-[#8C3A27]">Total Folios Inscribed</span>
                            <p className="font-bold text-base text-[#2C2926]">{activeEntries.length} Memories</p>
                          </div>

                          <div className="p-3.5 bg-[#F0E8DA] rounded-xl border border-[#DDD0BC] space-y-1">
                            <span className="text-[10px] font-mono uppercase font-bold text-[#2E6B4E]">Chronological Range</span>
                            <p className="font-bold text-xs text-[#2C2926] font-mono">{firstDate} → {lastDate}</p>
                          </div>
                        </div>

                        <div className="p-4 bg-[#FAF7F0] rounded-xl border border-[#D5C9B4] text-center space-y-2">
                          <p className="font-display italic text-sm text-[#4A3E2E]">
                            "To pay attention, this is our endless and proper work."
                          </p>
                          <span className="text-[11px] font-mono text-[#8C7F6E] block">— Mary Oliver</span>
                        </div>
                      </div>

                      <div className="text-center text-[10px] font-mono text-[#8C7F6E] border-t border-[#D5C9B4] pt-3">
                        ALL RIGHTS RESERVED TO THE INSCRIBER • 100% PRIVATE & OFFLINE
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
