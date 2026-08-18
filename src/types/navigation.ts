export type MainTab = 'journal' | 'novelties' | 'scrapbook' | 'timeflow' | 'settings';

export type SubViewType = 
  | 'none'
  | 'dossier'      // Dedicated full-page Micro-Novelty Field Card Dossier
  | 'workshop'     // Dedicated full-page Alchemist's Novelty Workshop
  | 'serendipity'  // Dedicated full-page Serendipity Memory Folio
  | 'nudge';       // Dedicated full-page Twilight Reflection Desk

export interface NavigationState {
  tab: MainTab;
  view: SubViewType;
  selectedId?: string;       // E.g. noveltyId or memory entry ID
  selectedDate?: string;     // YYYY-MM-DD
  promptIndex?: number;      // For nudge / prompt reflection
  refPromptText?: string;    // Pre-inscribed prompt text
}
