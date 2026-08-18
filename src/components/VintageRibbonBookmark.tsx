import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  RotateCcw, 
  Feather, 
  FileText,
  Star,
  Check
} from 'lucide-react';
import gsap from 'gsap';
import { MemoryEntry } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { hapticsEngine } from '../utils/hapticsEngine';
import { formatDisplayDate } from '../utils/dateUtils';

export type RibbonColor = 'terracotta' | 'ochre' | 'sage' | 'indigo';

interface VintageRibbonBookmarkProps {
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  hasDraft: boolean;
  draftWordCount: number;
  lastDraftTime?: string | null;
  onPreserveDraft?: () => void;
  onDiscardDraft?: () => void;
  entries: MemoryEntry[];
  currentDate: string;
  onSelectDate: (date: string) => void;
}

const RIBBON_COLOR_CONFIG: Record<RibbonColor, { name: string; class: string; dot: string; label: string }> = {
  terracotta: { name: 'Terracotta Silk', class: 'vintage-ribbon-terracotta', dot: '#9C382A', label: 'Terracotta' },
  ochre: { name: 'Antique Ochre', class: 'vintage-ribbon-ochre', dot: '#B88320', label: 'Ochre' },
  sage: { name: 'Sage Moss', class: 'vintage-ribbon-sage', dot: '#2D5A43', label: 'Sage' },
  indigo: { name: 'Midnight Indigo', class: 'vintage-ribbon-indigo', dot: '#1E355B', label: 'Indigo' }
};

export const VintageRibbonBookmark: React.FC<VintageRibbonBookmarkProps> = ({
  isBookmarked,
  onToggleBookmark,
  hasDraft,
  draftWordCount,
  lastDraftTime,
  onPreserveDraft,
  onDiscardDraft,
  entries,
  currentDate,
  onSelectDate
}) => {
  const [ribbonColor, setRibbonColor] = useState<RibbonColor>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('reverie_ribbon_color');
      if (saved && saved in RIBBON_COLOR_CONFIG) return saved as RibbonColor;
    }
    return 'terracotta';
  });

  const [isFolioOpen, setIsFolioOpen] = useState(false);
  const [isDraftMenuOpen, setIsDraftMenuOpen] = useState(false);

  const ribbonRef = useRef<HTMLDivElement>(null);
  const charmRef = useRef<HTMLButtonElement>(null);
  const draftTagRef = useRef<HTMLDivElement>(null);
  const folioMenuRef = useRef<HTMLDivElement>(null);
  const draftMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (folioMenuRef.current && !folioMenuRef.current.contains(e.target as Node) && !charmRef.current?.contains(e.target as Node)) {
        setIsFolioOpen(false);
      }
      if (draftMenuRef.current && !draftMenuRef.current.contains(e.target as Node) && !draftTagRef.current?.contains(e.target as Node)) {
        setIsDraftMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Animate ribbon pull on bookmark toggle
  const handleRibbonClick = () => {
    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('page_turn');

    if (ribbonRef.current) {
      gsap.timeline()
        .to(ribbonRef.current, {
          y: 8,
          scaleY: 1.06,
          duration: 0.12,
          ease: 'power1.out'
        })
        .to(ribbonRef.current, {
          y: 0,
          scaleY: 1,
          duration: 0.35,
          ease: 'elastic.out(1.2, 0.4)'
        });
    }

    onToggleBookmark();
  };

  const handleSelectColor = (color: RibbonColor) => {
    setRibbonColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem('reverie_ribbon_color', color);
    }
    soundEngine.playPencilScratchSound();
  };

  const bookmarkedEntries = entries.filter(e => e.isFavorite);

  return (
    <>
      {/* 1. IN-PROGRESS DRAFT MARKER (Left top edge of notebook spread) */}
      {hasDraft && (
        <div 
          ref={draftTagRef}
          className="absolute -top-3.5 left-2 sm:left-4 md:left-6 z-20 flex flex-col items-center select-none animate-in fade-in slide-in-from-top-3 duration-300"
        >
          {/* Skeuomorphic Brass Paperclip */}
          <div className="relative brass-paperclip cursor-pointer" onClick={() => setIsDraftMenuOpen(!isDraftMenuOpen)}>
            <div className="brass-paperclip-inner" />
          </div>

          {/* Stitched Cloth Draft Tab */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playPaperTurnSound();
              setIsDraftMenuOpen(!isDraftMenuOpen);
            }}
            className="draft-cloth-tab -mt-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-mono font-bold text-[#5C4524] dark:text-[#E2C799] flex items-center gap-1 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition-all"
            title="In-Progress Draft auto-saved. Click for options."
          >
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#D97706] animate-pulse" />
            <span className="tracking-tight uppercase">DRAFT</span>
            <span className="text-[9px] sm:text-[10px] font-normal opacity-80">({draftWordCount}w)</span>
          </button>

          {/* Draft Options Popover Menu */}
          {isDraftMenuOpen && (
            <div 
              ref={draftMenuRef}
              className="absolute top-12 left-0 w-64 bg-[#FAF8F3] dark:bg-[#1E2723] border border-[#DDD0BC] dark:border-[#384A40] rounded-xl shadow-2xl p-3 z-40 text-xs space-y-2.5 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-[#E8DFD0] dark:border-[#2C3831] pb-2">
                <div className="flex items-center gap-1.5 font-bold text-[#5C4524] dark:text-[#E2C799]">
                  <FileText className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Unsaved Live Draft</span>
                </div>
                <span className="text-[10px] font-mono text-[#8C7E6A] dark:text-[#A89E8F]">
                  Auto-saved
                </span>
              </div>

              <p className="text-[11px] text-[#6E6352] dark:text-[#C5BBAE] leading-relaxed">
                Your keystrokes are preserved locally so you don't lose thoughts while drafting.
              </p>

              {lastDraftTime && (
                <div className="text-[10px] text-[#8C7E6A] dark:text-[#A89E8F] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated {lastDraftTime}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                {onPreserveDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDraftMenuOpen(false);
                      onPreserveDraft();
                    }}
                    className="flex-1 py-1.5 px-2 bg-[#2E6B4E] hover:bg-[#24573F] text-[#FAF7F0] font-semibold rounded-lg text-center flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Feather className="w-3 h-3" />
                    <span>Preserve</span>
                  </button>
                )}

                {onDiscardDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDraftMenuOpen(false);
                      onDiscardDraft();
                    }}
                    className="py-1.5 px-2.5 bg-[#FAF3E8] dark:bg-[#28352F] hover:bg-[#EFE5D3] text-[#A8382A] dark:text-[#F08A7D] font-medium rounded-lg text-center flex items-center justify-center gap-1 cursor-pointer transition-colors border border-[#DDD0BC] dark:border-[#384A40]"
                    title="Discard changes and revert to last saved state"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Revert</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. VINTAGE SILK GROSGRAIN RIBBON BOOKMARK (Right top edge of notebook spread) */}
      <div 
        ref={ribbonRef}
        className={`absolute -top-3.5 right-2 sm:right-4 md:right-6 z-20 flex flex-col items-center select-none vintage-ribbon ${RIBBON_COLOR_CONFIG[ribbonColor].class} ${
          isBookmarked ? 'h-24 sm:h-28' : 'h-8 sm:h-9'
        }`}
        style={{ width: '26px' }}
      >
        {/* Ribbon Top Anchor Seam */}
        <div className="w-full h-1 bg-black/20" />

        {/* Pull / Toggle Trigger Button */}
        <button
          type="button"
          onClick={handleRibbonClick}
          className="w-full h-full flex flex-col items-center justify-between pb-3 pt-0.5 cursor-pointer group focus:outline-none"
          title={isBookmarked ? 'Click to unpin bookmark ribbon' : 'Pull ribbon to bookmark this memory page'}
          aria-label={isBookmarked ? 'Unpin bookmark ribbon' : 'Bookmark this memory page'}
        >
          {/* Subtle Ribbon Weave Indicator */}
          <div className="w-2.5 h-0.5 bg-white/40 rounded-full my-0.5 opacity-60 group-hover:opacity-100 transition-opacity" />

          {/* If Bookmarked: Gold Leaf Ribbon Charm */}
          {isBookmarked && (
            <div className="flex flex-col items-center gap-1 mt-auto pb-0.5 transform group-hover:scale-110 transition-transform">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#F5D88A] to-[#B88628] border border-[#8C6214] shadow-md flex items-center justify-center text-[#422C05]">
                <Star className="w-3 h-3 fill-[#422C05]" />
              </div>
            </div>
          )}
        </button>

        {/* Ribbon Quick Folio Menu Trigger Charm (Hanging below ribbon tip) */}
        <button
          ref={charmRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            soundEngine.playPaperTurnSound();
            setIsFolioOpen(!isFolioOpen);
          }}
          className="absolute -bottom-4 w-4.5 h-4.5 rounded-full bg-[#FAF8F3] dark:bg-[#1E2723] border border-[#A88647] shadow-md flex items-center justify-center text-[#8A682D] dark:text-[#E2C799] hover:scale-115 hover:bg-[#F3E7D0] transition-all cursor-pointer z-30"
          title="Ribbon Folio & Bookmark Index"
        >
          <Bookmark className="w-2 h-2 fill-current" />
        </button>

        {/* Ribbon Folio Dropdown / Index Popup */}
        {isFolioOpen && (
          <div 
            ref={folioMenuRef}
            className="absolute top-full mt-7 right-0 w-72 sm:w-80 bg-[#FAF8F3] dark:bg-[#1E2723] border border-[#DDD0BC] dark:border-[#384A40] rounded-2xl shadow-2xl p-3.5 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E8DFD0] dark:border-[#2C3831] pb-2">
              <div className="flex items-center gap-1.5 font-bold text-[#2C2926] dark:text-[#FAF7F0]">
                <Bookmark className="w-3.5 h-3.5 text-[#A8382A] fill-[#A8382A]" />
                <span>Ribbon Bookmark Folio</span>
              </div>
              <span className="text-[10px] font-mono bg-[#EAE0CE] dark:bg-[#2B3831] text-[#554936] dark:text-[#D5CCC0] px-1.5 py-0.5 rounded">
                {bookmarkedEntries.length} Saved
              </span>
            </div>

            {/* Ribbon Color Customizer */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-mono font-bold text-[#8C7E6A] dark:text-[#A89E8F]">
                Silk Ribbon Hue:
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.keys(RIBBON_COLOR_CONFIG) as RibbonColor[]).map(color => {
                  const cfg = RIBBON_COLOR_CONFIG[color];
                  const isSelected = ribbonColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg border text-[10px] font-medium transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#2E6B4E] bg-[#EBE3D3] dark:bg-[#2D3C34] text-[#1E3A2B] dark:text-[#FAF7F0] font-bold shadow-xs' 
                          : 'border-[#DDD0BC] dark:border-[#33423A] hover:bg-[#F2EADB] dark:hover:bg-[#25322B] text-[#5A5042] dark:text-[#C5BBAE]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: cfg.dot }} />
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Page Bookmark Toggle Quick Action */}
            <button
              type="button"
              onClick={() => {
                handleRibbonClick();
              }}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                isBookmarked
                  ? 'bg-[#F2EAE0] dark:bg-[#2A3530] text-[#A8382A] dark:text-[#F08A7D] border-[#DECFBD] dark:border-[#384A40]'
                  : 'bg-[#2E6B4E] hover:bg-[#24573F] text-[#FAF7F0] border-transparent shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-[#A8382A]' : 'fill-[#FAF7F0]'}`} />
                <span>{isBookmarked ? 'Unpin This Ribbon' : 'Bookmark Current Page'}</span>
              </div>
              {isBookmarked && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Bookmarked Memories List */}
            <div className="space-y-1.5 pt-1 border-t border-[#E8DFD0] dark:border-[#2C3831]">
              <div className="text-[10px] uppercase font-mono font-bold text-[#8C7E6A] dark:text-[#A89E8F] flex items-center justify-between">
                <span>Bookmarked Pages:</span>
              </div>

              {bookmarkedEntries.length === 0 ? (
                <p className="text-[11px] text-[#9E9180] dark:text-[#7D7365] italic py-2 text-center">
                  No bookmarked pages yet. Pull the ribbon on any date to pin it here.
                </p>
              ) : (
                <div className="max-h-44 overflow-y-auto analog-scrollbar space-y-1 pr-1">
                  {bookmarkedEntries.map(entry => {
                    const isCurrent = entry.date === currentDate;
                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => {
                          soundEngine.playPaperTurnSound();
                          onSelectDate(entry.date);
                          setIsFolioOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          isCurrent
                            ? 'bg-[#EAE2D2] dark:bg-[#2F3D35] border-[#2E6B4E] text-[#1E3A2B] dark:text-[#FAF7F0] font-bold'
                            : 'bg-[#FAF8F3] dark:bg-[#1A231F] border-[#E5DAC8] dark:border-[#2C3831] hover:bg-[#F3EADB] dark:hover:bg-[#25322B] text-[#332E27] dark:text-[#EAE5D9]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] font-mono text-[#A8382A] dark:text-[#F08A7D]">
                            {formatDisplayDate(entry.date)}
                          </div>
                          <div className="font-display font-medium text-xs truncate">
                            {entry.title || 'Untitled Memory'}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#8C7E6A] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
};
