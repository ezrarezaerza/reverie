import { MemoryEntry } from '../types';
import { parseLocalDate } from './dateUtils';

export type BookSpineTheme = 'burgundy' | 'forest' | 'indigo' | 'ochre' | 'terracotta' | 'charcoal';

export interface AnnualVolume {
  year: number;
  entryCount: number;
  earliestEntryDate: string;
  latestEntryDate: string;
  noveltyCount: number;
  favoriteCount: number;
  thickness: 'slim' | 'medium' | 'tome';
  spineTheme: BookSpineTheme;
  romanNumeral: string;
  entries: MemoryEntry[];
}

const THEMES: BookSpineTheme[] = ['burgundy', 'forest', 'indigo', 'ochre', 'terracotta', 'charcoal'];

// Convert year number to Roman Numeral for vintage spine embossing
function toRomanNumeral(num: number): string {
  const lookup: Record<string, number> = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1
  };
  let roman = '';
  let n = num;
  for (const i in lookup) {
    while (n >= lookup[i]) {
      roman += i;
      n -= lookup[i];
    }
  }
  return roman;
}

/**
 * Groups memory entries by calendar year and computes tactile physical volume metrics
 */
export function groupEntriesByAnnualVolumes(entries: MemoryEntry[]): AnnualVolume[] {
  if (!entries || entries.length === 0) {
    return [];
  }

  const yearMap = new Map<number, MemoryEntry[]>();

  // Group entries by year
  entries.forEach((entry) => {
    try {
      const year = parseLocalDate(entry.date).getFullYear();
      if (!yearMap.has(year)) {
        yearMap.set(year, []);
      }
      yearMap.get(year)!.push(entry);
    } catch {
      // ignore invalid date formats
    }
  });

  // Sort years ascending so library shelf reads left-to-right chronologically
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);

  return sortedYears.map((year, index) => {
    const yearEntries = yearMap.get(year)!;
    
    // Sort entries within year chronologically
    yearEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const earliestEntryDate = yearEntries[0]?.date || `${year}-01-01`;
    const latestEntryDate = yearEntries[yearEntries.length - 1]?.date || `${year}-12-31`;
    const entryCount = yearEntries.length;
    const noveltyCount = yearEntries.filter(e => Boolean(e.linkedNoveltyId || e.linkedNoveltyTitle)).length;
    const favoriteCount = yearEntries.filter(e => Boolean(e.isFavorite)).length;

    // Physical thickness calculation
    let thickness: 'slim' | 'medium' | 'tome' = 'slim';
    if (entryCount >= 90) {
      thickness = 'tome';
    } else if (entryCount >= 30) {
      thickness = 'medium';
    }

    // Color theme allocation
    const spineTheme = THEMES[index % THEMES.length];

    return {
      year,
      entryCount,
      earliestEntryDate,
      latestEntryDate,
      noveltyCount,
      favoriteCount,
      thickness,
      spineTheme,
      romanNumeral: toRomanNumeral(year),
      entries: yearEntries
    };
  });
}
