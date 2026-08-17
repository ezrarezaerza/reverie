import { getDayOfYear } from 'date-fns';
import prompts from '../data/prompts.json';

export interface DailyPrompt {
  id: number;
  text: string;
  dayOfYear: number;
}

/**
 * Deterministically retrieves the micro-novelty prompt for any given calendar date.
 * Uses modulo arithmetic against the static prompt catalog so the experience is:
 * 1. Completely offline (no external AI / LLM API calls)
 * 2. Deterministic & predictable (the same date always yields the same prompt)
 * 3. Evenly distributed throughout all 365/366 days of the year
 * 
 * @param date - The target Date to get the daily prompt for (defaults to today)
 * @returns DailyPrompt object containing the prompt text and day identifier
 */
export function getDailyPrompt(date: Date = new Date()): DailyPrompt {
  const dayOfYear = getDayOfYear(date); // 1 - 366
  
  // Modulo index into the 50-prompt catalog
  const promptIndex = (dayOfYear - 1) % prompts.length;
  const prompt = prompts[promptIndex];

  return {
    id: prompt.id,
    text: prompt.text,
    dayOfYear,
  };
}
