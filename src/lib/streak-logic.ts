import { isSameDay, isSameMonth, differenceInCalendarDays } from 'date-fns';

export interface StreakCalculationResult {
  currentStreak: number;
  graceDayUsed: boolean;
  streakMaintained: boolean;
  graceDayTriggered: boolean;
}

/**
 * Pure, deterministic streak calculator with monthly grace-day protection.
 *
 * Rules:
 * 1. Month Rollover: If `currentDate` is in a different calendar month than `lastEntryDate`,
 *    the user's `graceDayUsed` status is refreshed back to `false` for the new month.
 * 2. Same Day Entry: If an entry was already recorded today (`daysDiff === 0`), return current stats.
 * 3. Consecutive Day Entry (`daysDiff === 1`): Increment `currentStreak` by 1.
 * 4. Missed Exactly 1 Day (`daysDiff === 2`, e.g., last entry was Aug 1st, today is Aug 3rd):
 *    - If `graceDayUsed` is false: Maintain streak! Increment `currentStreak` by 1 and set `graceDayUsed` to true.
 *    - If `graceDayUsed` is true: Grace day already spent this month; reset `currentStreak` to 1.
 * 5. Missed > 1 Day (`daysDiff > 2`): Streak is broken; reset `currentStreak` to 1.
 * 6. First Ever Entry (`lastEntryDate === null`): Initialize `currentStreak` to 1.
 *
 * @param lastEntryDate - The Date of the user's previous journal entry, or null if first entry
 * @param currentDate - The Date of the current entry being inscribed (usually today)
 * @param currentStreak - The user's active streak count from the database
 * @param graceDayUsed - Boolean flag indicating if the monthly grace day was already consumed
 */
export function calculateNewStreak(
  lastEntryDate: Date | null,
  currentDate: Date,
  currentStreak: number,
  graceDayUsed: boolean
): StreakCalculationResult {
  // Scenario 1: First entry ever
  if (!lastEntryDate) {
    return {
      currentStreak: 1,
      graceDayUsed: false,
      streakMaintained: true,
      graceDayTriggered: false,
    };
  }

  // Check for month rollover to replenish monthly grace day
  let effectiveGraceDayUsed = graceDayUsed;
  if (!isSameMonth(lastEntryDate, currentDate)) {
    effectiveGraceDayUsed = false;
  }

  // Calculate calendar day difference
  const daysDiff = differenceInCalendarDays(currentDate, lastEntryDate);

  // Scenario 2: Multiple entries on the same calendar day
  if (daysDiff === 0 || isSameDay(lastEntryDate, currentDate)) {
    return {
      currentStreak: Math.max(1, currentStreak),
      graceDayUsed: effectiveGraceDayUsed,
      streakMaintained: true,
      graceDayTriggered: false,
    };
  }

  // Scenario 3: Consecutive daily entry (perfect streak progression)
  if (daysDiff === 1) {
    return {
      currentStreak: currentStreak + 1,
      graceDayUsed: effectiveGraceDayUsed,
      streakMaintained: true,
      graceDayTriggered: false,
    };
  }

  // Scenario 4: Missed exactly one day (e.g. wrote on Monday, skipped Tuesday, writing on Wednesday)
  if (daysDiff === 2) {
    if (!effectiveGraceDayUsed) {
      // Grace day saves the streak!
      return {
        currentStreak: currentStreak + 1,
        graceDayUsed: true,
        streakMaintained: true,
        graceDayTriggered: true,
      };
    } else {
      // Grace day already consumed earlier this month
      return {
        currentStreak: 1,
        graceDayUsed: true,
        streakMaintained: false,
        graceDayTriggered: false,
      };
    }
  }

  // Scenario 5: Missed 2 or more days (daysDiff > 2)
  return {
    currentStreak: 1,
    graceDayUsed: effectiveGraceDayUsed,
    streakMaintained: false,
    graceDayTriggered: false,
  };
}
