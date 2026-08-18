import { getDayOfYear } from 'date-fns';
import { MICRO_NOVELTIES_CATALOG } from '../data/microNoveltiesCatalog';
import { MicroNovelty } from '../types';

export interface DailyPrompt {
  id: number;
  text: string;
  dayOfYear: number;
  novelty: MicroNovelty;
}

/**
 * Deterministically retrieves the micro-novelty prompt for any given calendar date.
 * Uses modulo arithmetic against the 50-prompt micro-novelty catalog so the experience is:
 * 1. Completely offline (no external AI / LLM API calls)
 * 2. Deterministic & predictable (the same date always yields the same prompt)
 * 3. Unified across the Homepage Journal spread and the Novelties Catalog deck
 * 
 * @param date - The target Date to get the daily prompt for (defaults to today)
 * @returns DailyPrompt object containing the prompt details, dayOfYear, and linked MicroNovelty
 */
export function getDailyPrompt(date: Date = new Date()): DailyPrompt {
  const dayOfYear = getDayOfYear(date); // 1 - 366
  
  // Modulo index into the 50-prompt catalog
  const promptIndex = (dayOfYear - 1) % MICRO_NOVELTIES_CATALOG.length;
  const novelty = MICRO_NOVELTIES_CATALOG[promptIndex];

  return {
    id: promptIndex + 1,
    text: novelty.instruction,
    dayOfYear,
    novelty
  };
}
