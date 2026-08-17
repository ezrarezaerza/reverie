import React, { useRef } from 'react';
import { X, Calendar, MapPin, Tag, CloudSun, Heart, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { format } from 'date-fns';
import { MemoryEntry } from '../types';
import { SENSORY_CUE_METADATA } from '../data/microNoveltiesCatalog';
import { soundEngine } from '../utils/soundEngine';

interface MemoryRevealProps {
  isOpen: boolean;
  onClose: () => void;
  entry: MemoryEntry | null;
  onEditInNotebook?: (date: string) => void;
}

export const MemoryReveal: React.FC<MemoryRevealProps> = ({
  isOpen,
  onClose,
  entry,
  onEditInNotebook,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  /**
   * GSAP Modal Entrance Animation:
   * Uses `power2.out` easing to mimic picking up a physical sheet of paper
   * from the wooden desk into the viewer's hands.
   */
  useGSAP(
    () => {
      if (isOpen && cardRef.current && backdropRef.current) {
        gsap.set(backdropRef.current, { opacity: 0 });
        gsap.set(cardRef.current, {
          opacity: 0,
          scale: 0.82,
          y: 28,
          rotationZ: -1.5,
        });

        // Animate Backdrop
        gsap.to(backdropRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        });

        // Animate Paper Card Lifting
        gsap.to(cardRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotationZ: 0,
          duration: 0.45,
          ease: 'power2.out',
        });
      }
    },
    { dependencies: [isOpen], scope: containerRef }
  );

  /**
   * Graceful reverse animation on close before unmounting
   */
  const handleClose = () => {
    soundEngine.playPaperTurnSound();
    if (cardRef.current && backdropRef.current) {
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
      });

      gsap.to(cardRef.current, {
        opacity: 0,
        scale: 0.85,
        y: 20,
        rotationZ: 1,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  if (!isOpen || !entry) return null;

  const entryDate = new Date(entry.date + 'T00:00:00');
  const formattedDate = format(entryDate, 'EEEE, MMMM d, yyyy');

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop overlay */}
      <div
        ref={backdropRef}
        onClick={handleClose}
        className="fixed inset-0 bg-[#141A17]/75 backdrop-blur-xs transition-opacity"
      />

      {/* Tactile Analog Paper Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-2xl bg-[#FAF8F2] ruled-paper rounded-2xl border border-[#D5C9B6] p-6 sm:p-10 shadow-[0_4px_12px_rgba(0,0,0,0.12),0_20px_40px_rgba(20,20,18,0.25)] z-10 my-auto max-h-[90vh] overflow-y-auto"
      >
        {/* Top Washi Tape Strip */}
        <div
          className="washi-tape washi-terracotta absolute -top-3.5 left-1/2 -translate-x-1/2 w-36 h-6 flex items-center justify-center shadow-xs select-none"
          style={{ transform: 'translateX(-50%) rotate(0.8deg)' }}
        >
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#4D231E] uppercase">
            SAVED MEMORY
          </span>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#7A6F5E] hover:text-[#2C2926] hover:bg-[#EAE0CE] transition-colors focus-visible:ring-2 focus-visible:ring-[#2E6B4E] outline-none"
          aria-label="Close memory view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entry Header: Date & Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#D8CDBC]">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#5A5040]">
            <Calendar className="w-4 h-4 text-[#A8382A]" />
            <span>{formattedDate}</span>
            {entry.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-normal text-[#6B6150]">
                  <MapPin className="w-3.5 h-3.5 text-[#2E6B4E]" />
                  {entry.location}
                </span>
              </>
            )}
            {entry.weather && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 font-normal text-[#6B6150]">
                  <CloudSun className="w-3.5 h-3.5 text-[#A8382A]" />
                  {entry.weather}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {entry.isFavorite && (
              <Heart className="w-4 h-4 text-[#A8382A] fill-[#A8382A]" />
            )}
            {entry.moodStamp && (
              <div className="rubber-stamp text-[10px] px-2 py-0.5 scale-95">
                {entry.moodStamp.replace('_', ' ')}
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#292623] mb-3">
          {entry.title}
        </h2>

        {/* Reflection prompt if present */}
        {entry.reflectionPrompt && (
          <div className="bg-[#F3EDE2] border-l-3 border-[#A8382A] p-3 rounded-r text-xs text-[#5C5243] italic mb-4">
            Prompt: "{entry.reflectionPrompt}"
          </div>
        )}

        {/* Handwritten Memory Body (Aligned with college-ruled lines) */}
        <div className="relative my-4 min-h-[160px]">
          <p className="font-hand text-2xl sm:text-3xl ballpoint-ink leading-[32px] whitespace-pre-wrap">
            {entry.body}
          </p>
        </div>

        {/* Sensory Coordinates Footer */}
        {entry.sensoryCues && entry.sensoryCues.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-6 border-t border-[#D8CDBC]">
            <span className="text-xs font-bold text-[#6D6352] uppercase tracking-wide">
              Senses:
            </span>
            {entry.sensoryCues.map((cue) => (
              <span
                key={cue}
                className="text-xs px-2.5 py-1 rounded-md bg-[#EAE0CE] text-[#3D3528] font-medium flex items-center gap-1"
              >
                <span>{SENSORY_CUE_METADATA[cue]?.icon}</span>
                <span>{cue}</span>
              </span>
            ))}

            {entry.tags && entry.tags.map(tag => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-md bg-[#DFD6C4] text-[#4A4032]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#D8CDBC]">
          {onEditInNotebook ? (
            <button
              type="button"
              onClick={() => {
                onEditInNotebook(entry.date);
                handleClose();
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1C355E] hover:underline"
            >
              <span>Edit in Notebook</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2 rounded-lg bg-[#2E6B4E] hover:bg-[#25563E] text-[#FAF7F0] text-xs font-semibold shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[#2E6B4E]"
          >
            Return to Folio
          </button>
        </div>
      </div>
    </div>
  );
};
