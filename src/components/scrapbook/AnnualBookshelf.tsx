import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Calendar, 
  ArrowRight, 
  Bookmark, 
  Library, 
  Compass, 
  Layers, 
  ChevronRight, 
  Award,
  BookMarked,
  X
} from 'lucide-react';
import gsap from 'gsap';
import { format } from 'date-fns';
import { AnnualVolume, groupEntriesByAnnualVolumes, BookSpineTheme } from '../../utils/annualVolumeEngine';
import { MemoryEntry } from '../../types';
import { soundEngine } from '../../utils/soundEngine';
import { hapticsEngine } from '../../utils/hapticsEngine';
import { parseLocalDate } from '../../utils/dateUtils';

interface AnnualBookshelfProps {
  entries: MemoryEntry[];
  onSelectYearVolume: (year: number, earliestDate: string) => void;
  selectedYearFilter?: number | null;
  onClearYearFilter?: () => void;
}

const SPINE_THEME_STYLES: Record<BookSpineTheme, {
  bg: string;
  ribbon: string;
  foil: string;
  goldAccent: string;
  label: string;
}> = {
  burgundy: {
    bg: 'bg-[#521C18] border-[#38110E]',
    ribbon: 'bg-[#C28B38]',
    foil: 'text-[#E5C388]',
    goldAccent: '#E5C388',
    label: 'Vintage Claret'
  },
  forest: {
    bg: 'bg-[#1C3B2D] border-[#10241B]',
    ribbon: 'bg-[#D9A74A]',
    foil: 'text-[#DFD0A8]',
    goldAccent: '#DFD0A8',
    label: 'Hunter Sage'
  },
  indigo: {
    bg: 'bg-[#192A45] border-[#0E1A2C]',
    ribbon: 'bg-[#A8382A]',
    foil: 'text-[#CAD8EF]',
    goldAccent: '#CAD8EF',
    label: 'Midnight Indigo'
  },
  ochre: {
    bg: 'bg-[#614515] border-[#3D2B0C]',
    ribbon: 'bg-[#2E6B4E]',
    foil: 'text-[#F9E8B2]',
    goldAccent: '#F9E8B2',
    label: 'Antique Ochre'
  },
  terracotta: {
    bg: 'bg-[#63291B] border-[#3E180F]',
    ribbon: 'bg-[#1C355E]',
    foil: 'text-[#EFC0B0]',
    goldAccent: '#EFC0B0',
    label: 'Terracotta'
  },
  charcoal: {
    bg: 'bg-[#262626] border-[#141414]',
    ribbon: 'bg-[#C28B38]',
    foil: 'text-[#DCD5C3]',
    goldAccent: '#DCD5C3',
    label: 'Embossed Charcoal'
  }
};

const THICKNESS_WIDTHS = {
  slim: 'w-14 sm:w-16 h-48 sm:h-52',
  medium: 'w-16 sm:w-18 h-52 sm:h-56',
  tome: 'w-20 sm:w-22 h-56 sm:h-60'
};

export const AnnualBookshelf: React.FC<AnnualBookshelfProps> = ({
  entries,
  onSelectYearVolume,
  selectedYearFilter,
  onClearYearFilter
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);
  const [hoveredVolume, setHoveredVolume] = useState<AnnualVolume | null>(null);
  const [expandedVolume, setExpandedVolume] = useState<AnnualVolume | null>(null);

  const volumes = groupEntriesByAnnualVolumes(entries);
  const currentYear = new Date().getFullYear();

  // GSAP Shelf Entry Animation on Mount
  useEffect(() => {
    if (shelfRef.current && volumes.length > 0) {
      const books = shelfRef.current.querySelectorAll('.library-book-item');
      gsap.fromTo(
        books,
        {
          y: 20,
          opacity: 0,
          scale: 0.96
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.07,
          ease: 'power2.out',
          clearProps: 'transform,opacity'
        }
      );
    }
  }, [volumes.length]);

  const handleBookMouseEnter = (e: React.MouseEvent<HTMLDivElement>, vol: AnnualVolume) => {
    setHoveredVolume(vol);
    const bookEl = e.currentTarget.querySelector('.book-spine-card');
    if (bookEl) {
      gsap.to(bookEl, {
        y: -10,
        scale: 1.03,
        duration: 0.22,
        ease: 'power2.out'
      });
    }
  };

  const handleBookMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setHoveredVolume(null);
    const bookEl = e.currentTarget.querySelector('.book-spine-card');
    if (bookEl) {
      gsap.to(bookEl, {
        y: 0,
        scale: 1,
        duration: 0.25,
        ease: 'power2.out'
      });
    }
  };

  const handleToggleVolumeInspection = (vol: AnnualVolume) => {
    soundEngine.playPaperTurnSound();
    hapticsEngine.triggerHaptic('click');
    if (expandedVolume?.year === vol.year) {
      setExpandedVolume(null);
    } else {
      setExpandedVolume(vol);
    }
  };

  const handleJumpToEarliest = (vol: AnnualVolume) => {
    soundEngine.playPencilScratchSound();
    hapticsEngine.triggerHaptic('completion');
    onSelectYearVolume(vol.year, vol.earliestEntryDate);
  };

  return (
    <div className="w-full mb-6">
      {/* Bookshelf Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-[#A8382A] dark:text-[#F08A7D]" />
          <h3 className="font-display font-bold text-sm sm:text-base text-[#2C2926] dark:text-[#FAF7F0]">
            The Annual Library
          </h3>
          <span className="text-xs text-[#827766]">•</span>
          <span className="text-xs text-[#7A6F5E] dark:text-[#A89E8F]">
            {volumes.length} Bound {volumes.length === 1 ? 'Volume' : 'Volumes'}
          </span>
        </div>

        {selectedYearFilter && onClearYearFilter && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playPaperTurnSound();
              onClearYearFilter();
            }}
            className="text-xs font-semibold text-[#A8382A] dark:text-[#F08A7D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Filtered: Year {selectedYearFilter}</span>
            <span className="text-[10px] bg-[#EAE0CE] dark:bg-[#2C3831] px-1.5 py-0.5 rounded">Clear Filter ✕</span>
          </button>
        )}
      </div>

      {/* Tactile Wood Plank Bookshelf Container */}
      <div 
        ref={shelfRef}
        className="relative rounded-2xl bg-[#2A1F18] dark:bg-[#151C18] border border-[#443328] dark:border-[#27352E] pt-4 px-4 sm:px-8 pb-0 shadow-lg overflow-hidden"
      >
        {/* Soft atmospheric bookcase gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        {/* Books Array Row */}
        <div className="relative z-10 flex items-end justify-start sm:justify-center gap-4 sm:gap-6 min-h-[230px] sm:min-h-[250px] px-2 sm:px-4 overflow-x-auto pb-1 scrollbar-thin">
          
          {/* If no volumes recorded yet, show First Volume placeholder */}
          {volumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-6 text-[#C5BBAE] w-full">
              <div className="w-16 h-48 rounded-t bg-[#3D2C22] border border-[#594233] flex flex-col items-center justify-between py-4 shadow-md opacity-90">
                <span className="font-mono text-[10px] font-bold text-[#DFC69C] uppercase tracking-wider -rotate-90 origin-center whitespace-nowrap mt-8">
                  VOL. {currentYear}
                </span>
                <span className="w-2 h-6 bg-[#C28B38] rounded-full" />
              </div>
              <p className="text-xs text-[#A89E8F] mt-2.5 max-w-xs">
                Your first annual ledger begins today. As days are preserved, your library fills with bound volumes.
              </p>
            </div>
          ) : (
            volumes.map((vol) => {
              const theme = SPINE_THEME_STYLES[vol.spineTheme];
              const sizeClass = THICKNESS_WIDTHS[vol.thickness];
              const isSelected = selectedYearFilter === vol.year;
              const isInspecting = expandedVolume?.year === vol.year;

              return (
                <div
                  key={vol.year}
                  onMouseEnter={(e) => handleBookMouseEnter(e, vol)}
                  onMouseLeave={(e) => handleBookMouseLeave(e)}
                  onClick={() => handleToggleVolumeInspection(vol)}
                  className="library-book-item group relative flex flex-col items-center cursor-pointer select-none shrink-0"
                >
                  {/* Physical Book Spine */}
                  <div
                    className={`book-spine-card relative ${sizeClass} ${theme.bg} rounded-t border-t-2 border-x-2 border-black/30 shadow-md ${
                      isSelected || isInspecting
                        ? 'ring-2 ring-[#E5C388] ring-offset-2 ring-offset-[#2A1F18]'
                        : ''
                    }`}
                  >
                    {/* Top Headband Cloth Stitching */}
                    <div className="w-full h-1.5 bg-[#E8DCC4] border-b border-black/40 opacity-85 rounded-t-[2px]" />

                    {/* Top Gold Double Fillet Lines */}
                    <div className="px-2 mt-2 space-y-0.5">
                      <div className="w-full h-[1px] bg-[#E5C388]/70" />
                      <div className="w-full h-[1px] bg-[#E5C388]/40" />
                    </div>

                    {/* Spine Interior Details */}
                    <div className="flex flex-col items-center justify-between h-[calc(100%-3rem)] py-2 px-1 text-center">
                      
                      {/* Top Roman Numeral */}
                      <span className={`font-mono text-[10px] font-bold tracking-widest ${theme.foil} uppercase`}>
                        {vol.romanNumeral}
                      </span>

                      {/* Clean Vertical Spine Title */}
                      <div className="flex items-center justify-center my-auto">
                        <span className={`font-display font-bold text-xs sm:text-sm tracking-wider ${theme.foil} -rotate-90 origin-center whitespace-nowrap`}>
                          MEMORIES • {vol.year}
                        </span>
                      </div>

                      {/* Bottom Page Count & Star Emboss */}
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-[10px] font-mono font-bold ${theme.foil} opacity-90`}>
                          {vol.entryCount} {vol.entryCount === 1 ? 'DAY' : 'DAYS'}
                        </span>
                        <div className="w-3/4 h-[1px] bg-[#E5C388]/50 mt-0.5" />
                      </div>
                    </div>

                    {/* Ribbon Bookmark Tail Dropping below spine */}
                    <div
                      className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-2.5 h-4.5 ${theme.ribbon} shadow-sm rounded-b-[2px]`}
                    />

                    {/* Skeuomorphic Leather Ridge Texture Highlights */}
                    <div className="absolute inset-y-0 left-1 w-1 bg-white/10 pointer-events-none" />
                    <div className="absolute inset-y-0 right-1 w-1 bg-black/25 pointer-events-none" />
                  </div>

                  {/* Year Tag under shelf */}
                  <span className={`mt-2 font-mono text-[11px] font-bold transition-colors ${
                    isSelected || isInspecting ? 'text-[#FAF7F0]' : 'text-[#C5BBAE] group-hover:text-[#FAF7F0]'
                  }`}>
                    {vol.year}
                  </span>
                </div>
              );
            })
          )}

        </div>

        {/* The Skeuomorphic Walnut Shelf Plank */}
        <div className="relative w-full h-4 bg-[#3E2B1E] dark:bg-[#1D2520] border-t-2 border-[#5E422F] dark:border-[#2D3C33] border-b border-[#1F150E] flex items-center justify-between px-4 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#1F150E]/80 shadow-inner" />
          <div className="w-2 h-2 rounded-full bg-[#1F150E]/80 shadow-inner" />
        </div>
        <div className="w-full h-1.5 bg-[#1B120C] dark:bg-[#0E1310]" />

      </div>

      {/* INLINE (Non-modal) Expandable Annual Folio Desk */}
      {expandedVolume && (
        <div className="mt-3 bg-[#FAF7F1] dark:bg-[#1A221E] ruled-paper paper-shadow-lifted rounded-xl border border-[#D9CEBC] dark:border-[#384A40] p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-start justify-between gap-3 mb-3 pb-2.5 border-b border-[#E3DACB] dark:border-[#2C3831]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8382A] dark:text-[#F08A7D]">
                  Annual Ledger Record
                </span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#EAE0CE] dark:bg-[#28352F] text-[#5D5344] dark:text-[#C5BBAE] font-bold">
                  {expandedVolume.romanNumeral}
                </span>
              </div>
              <h4 className="font-display font-bold text-xl text-[#2B2723] dark:text-[#FAF7F0] mt-0.5">
                Memories of {expandedVolume.year}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setExpandedVolume(null)}
              className="p-1 rounded text-[#7A6F5E] hover:text-[#2C2926] hover:bg-[#EAE0CE] dark:hover:bg-[#2A3530] transition-colors cursor-pointer"
              title="Close inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            <div className="bg-[#F2ECE0] dark:bg-[#232F2A] p-2.5 rounded-lg border border-[#DDD0BC] dark:border-[#384A40]">
              <div className="text-[10px] uppercase font-mono text-[#7A6F5E] dark:text-[#A89E8F]">Inscribed Pages</div>
              <div className="text-base font-bold text-[#2E6B4E] dark:text-[#5BA87E]">{expandedVolume.entryCount} Days</div>
            </div>
            <div className="bg-[#F2ECE0] dark:bg-[#232F2A] p-2.5 rounded-lg border border-[#DDD0BC] dark:border-[#384A40]">
              <div className="text-[10px] uppercase font-mono text-[#7A6F5E] dark:text-[#A89E8F]">Micro-Novelties</div>
              <div className="text-base font-bold text-[#A8382A] dark:text-[#F08A7D]">{expandedVolume.noveltyCount} Completed</div>
            </div>
            <div className="bg-[#F2ECE0] dark:bg-[#232F2A] p-2.5 rounded-lg border border-[#DDD0BC] dark:border-[#384A40]">
              <div className="text-[10px] uppercase font-mono text-[#7A6F5E] dark:text-[#A89E8F]">Earliest Entry</div>
              <div className="text-xs font-semibold text-[#2C2926] dark:text-[#FAF7F0]">
                {format(parseLocalDate(expandedVolume.earliestEntryDate), 'MMM d, yyyy')}
              </div>
            </div>
            <div className="bg-[#F2ECE0] dark:bg-[#232F2A] p-2.5 rounded-lg border border-[#DDD0BC] dark:border-[#384A40]">
              <div className="text-[10px] uppercase font-mono text-[#7A6F5E] dark:text-[#A89E8F]">Latest Entry</div>
              <div className="text-xs font-semibold text-[#2C2926] dark:text-[#FAF7F0]">
                {format(parseLocalDate(expandedVolume.latestEntryDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Action Dock */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E3DACB] dark:border-[#2C3831]">
            <button
              type="button"
              onClick={() => {
                onSelectYearVolume(expandedVolume.year, expandedVolume.earliestEntryDate);
              }}
              className="text-xs font-semibold text-[#6E6454] dark:text-[#C5BBAE] hover:text-[#2C2926] dark:hover:text-[#FAF7F0] underline cursor-pointer"
            >
              {selectedYearFilter === expandedVolume.year ? '✓ Currently Filtering Timeline' : `Filter Scrapbook to ${expandedVolume.year}`}
            </button>

            <button
              type="button"
              onClick={() => handleJumpToEarliest(expandedVolume)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs font-bold shadow-xs transition-all cursor-pointer ml-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Earliest Day in Journal ({format(parseLocalDate(expandedVolume.earliestEntryDate), 'MMM d')}) →</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
