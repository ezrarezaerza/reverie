import { format } from 'date-fns';

/**
 * Returns a 'YYYY-MM-DD' string representing the local date.
 * Avoids UTC mismatch from .toISOString().split('T')[0].
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parses a 'YYYY-MM-DD' string into a local Date object pinned to 12:00:00 (noon).
 * Pinned noon prevents midnight daylight saving time (DST) shifts from jumping dates.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr || !dateStr.includes('-')) {
    return new Date();
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0);
}

/**
 * Adds or subtracts exact days from a 'YYYY-MM-DD' date string.
 * Guarantees strictly 1-day step changes (no day-skipping).
 */
export function shiftDateString(dateStr: string, offsetDays: number): string {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
}

/**
 * Formats a 'YYYY-MM-DD' string into a human-readable string.
 */
export function formatDisplayDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }
): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', options);
}
