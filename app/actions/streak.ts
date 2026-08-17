import { getDayOfYear } from 'date-fns';
import prompts from '../../src/data/prompts.json';
import { calculateNewStreak } from '../../src/lib/streak-logic';

export async function updateStreakAction(userId: string, entryDate: Date, currentStreak: number, graceDayUsed: boolean, lastEntryDate: Date | null) {
  // Pure business logic invocation
  const result = calculateNewStreak(lastEntryDate, entryDate, currentStreak, graceDayUsed);
  return result;
}
