import { MemoryEntry, UserPreferences, NoveltyLog } from '../types';

const STORAGE_KEYS = {
  ENTRIES: 'reverie_memories_v1',
  PREFS: 'reverie_prefs_v1',
  NOVELTY_LOGS: 'reverie_novelty_logs_v1',
  ACTIVE_NOVELTY: 'reverie_active_novelty_v1'
};

const DEFAULT_PREFERENCES: UserPreferences = {
  userName: 'Quiet Chronicler',
  userEmail: 'ezrarezaerza@gmail.com',
  themeStyle: 'warm-parchment',
  defaultPaper: 'ruled',
  defaultInk: 'blue',
  reminderTime: '21:30',
  enableNudges: true,
  ambientSound: 'none',
  ambientVolume: 0.45,
  isLoggedIn: true
};

const INITIAL_SAMPLE_ENTRIES: MemoryEntry[] = [
  {
    id: 'entry-seed-1',
    date: '2026-08-16',
    createdAt: '2026-08-16T19:42:00.000Z',
    updatedAt: '2026-08-16T19:42:00.000Z',
    title: 'The sound of dusk settling on the balcony bricks',
    body: 'Walked home down the alleyway beside the dry cleaner instead of main street. Noticed an old hand-painted apothecary sign peeling beneath ivy. The evening air tasted like rain on warm concrete. For twenty minutes, time did not feel like a countdown.',
    timePacing: 'slow',
    sensoryCues: ['sight', 'scent', 'sound'],
    location: 'Old Brick Quarter',
    weather: 'Overcast & balmy, 22°C',
    moodStamp: 'ROUTINE_BREAKER',
    linkedNoveltyId: 'nov-01',
    linkedNoveltyTitle: 'The Uncharted Turn',
    reflectionPrompt: 'Which 10 minutes of today felt the slowest, and why?',
    isFavorite: true,
    tags: ['micro-commute', 'dusk', 'summer'],
    paperStyle: 'ruled',
    inkColor: 'blue'
  },
  {
    id: 'entry-seed-2',
    date: '2026-08-15',
    createdAt: '2026-08-15T21:15:00.000Z',
    updatedAt: '2026-08-15T21:15:00.000Z',
    title: 'Steaming Earl Grey with zero screens',
    body: 'Did the challenge of drinking tea in pure quiet. It was almost uncomfortable at first—my thumb kept reaching for an imaginary phone in my pocket. By the fifth sip, I actually tasted the bergamot oil. The ceramic was warm enough to thaw my wrist.',
    timePacing: 'stillness',
    sensoryCues: ['taste', 'scent', 'touch'],
    location: 'Kitchen table by window',
    weather: 'Quiet morning mist',
    moodStamp: 'QUIET_MOMENT',
    linkedNoveltyId: 'nov-06',
    linkedNoveltyTitle: 'The Unaccompanied Warm Drink',
    reflectionPrompt: 'What is an unhurried moment you enjoyed without feeling guilty?',
    isFavorite: true,
    tags: ['tea-ritual', 'stillness', 'morning'],
    paperStyle: 'ruled',
    inkColor: 'blue'
  },
  {
    id: 'entry-seed-3',
    date: '2026-08-13',
    createdAt: '2026-08-13T22:00:00.000Z',
    updatedAt: '2026-08-13T22:00:00.000Z',
    title: 'Cardamom pods and grandma’s Sunday pantry',
    body: 'Cracked open a green cardamom pod between my fingernails. The sharp citrusy resin immediately pulled up a memory from when I was seven standing on a wooden stool watching dough rise. Amazing how 3 seconds of smell can unpack 20 years of dust.',
    timePacing: 'slow',
    sensoryCues: ['scent', 'touch', 'serendipity'],
    location: 'Pantry corner',
    weather: 'Clear night',
    moodStamp: 'CORE_MEMORY',
    linkedNoveltyId: 'nov-02',
    linkedNoveltyTitle: 'The Silent Scent Time Machine',
    reflectionPrompt: 'What texture, temperature, or breeze surprised your skin today?',
    isFavorite: false,
    tags: ['olfactory', 'nostalgia', 'kitchen'],
    paperStyle: 'ruled',
    inkColor: 'blue'
  }
];

export const memoryStorage = {
  getEntries(): MemoryEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(INITIAL_SAMPLE_ENTRIES));
        return INITIAL_SAMPLE_ENTRIES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_SAMPLE_ENTRIES;
    }
  },

  saveEntry(entry: MemoryEntry): MemoryEntry[] {
    const entries = this.getEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id || e.date === entry.date);
    
    let updated: MemoryEntry[];
    if (existingIndex >= 0) {
      updated = [...entries];
      updated[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
    } else {
      updated = [entry, ...entries];
    }
    
    // Sort descending by date
    updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated));

    // Optional background sync with Vercel Postgres DB if configured
    this.syncEntryWithServer(entry).catch(() => {/* Offline safe fallback */});

    return updated;
  },

  deleteEntry(id: string): MemoryEntry[] {
    const entries = this.getEntries();
    const updated = entries.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(updated));

    // Optional background delete sync
    this.deleteEntryOnServer(id).catch(() => {/* Offline safe fallback */});

    return updated;
  },

  async syncEntryWithServer(entry: MemoryEntry) {
    try {
      const user = this.getPreferences();
      await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userEmail || 'default_user',
          ...entry
        })
      });
    } catch {
      // Offline fallback
    }
  },

  async deleteEntryOnServer(id: string) {
    try {
      const user = this.getPreferences();
      await fetch(`/api/entries/${id}?userId=${encodeURIComponent(user.userEmail || 'default_user')}`, {
        method: 'DELETE',
      });
    } catch {
      // Offline fallback
    }
  },

  getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (!data) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
    return updated;
  },

  getNoveltyLogs(): NoveltyLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOVELTY_LOGS);
      if (!data) return [
        { noveltyId: 'nov-01', completedAt: '2026-08-16' },
        { noveltyId: 'nov-06', completedAt: '2026-08-15' },
        { noveltyId: 'nov-02', completedAt: '2026-08-13' }
      ];
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  logNoveltyCompleted(noveltyId: string, notes?: string): NoveltyLog[] {
    const logs = this.getNoveltyLogs();
    const today = new Date().toISOString().split('T')[0];
    const newLog: NoveltyLog = { noveltyId, completedAt: today, notes };
    const updated = [newLog, ...logs.filter(l => !(l.noveltyId === noveltyId && l.completedAt === today))];
    localStorage.setItem(STORAGE_KEYS.NOVELTY_LOGS, JSON.stringify(updated));
    return updated;
  },

  getActiveNoveltyId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_NOVELTY);
    return stored || 'nov-01';
  },

  setActiveNoveltyId(id: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_NOVELTY, id);
  },

  exportAllDataAsJSON(): string {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: this.getPreferences(),
      entries: this.getEntries(),
      noveltyLogs: this.getNoveltyLogs()
    };
    return JSON.stringify(data, null, 2);
  },

  importDataFromJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.entries)) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(parsed.entries));
      }
      if (parsed.user) {
        localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(parsed.user));
      }
      if (Array.isArray(parsed.noveltyLogs)) {
        localStorage.setItem(STORAGE_KEYS.NOVELTY_LOGS, JSON.stringify(parsed.noveltyLogs));
      }
      return true;
    } catch {
      return false;
    }
  }
};
