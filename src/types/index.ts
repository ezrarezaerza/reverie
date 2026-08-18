export type TimePacing = 'slow' | 'flow' | 'fleeting' | 'stillness';

export type SensoryCue = 'sight' | 'sound' | 'scent' | 'taste' | 'touch' | 'serendipity';

export type MoodStamp = 'CORE_MEMORY' | 'MUNDANE_MAGIC' | 'SERENDIPITY' | 'QUIET_MOMENT' | 'ROUTINE_BREAKER' | 'GENTLE_DAY';

export interface MemoryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt: string;
  title: string;
  body: string;
  timePacing: TimePacing;
  sensoryCues: SensoryCue[];
  location?: string;
  weather?: string;
  moodStamp?: MoodStamp;
  linkedNoveltyId?: string;
  linkedNoveltyTitle?: string;
  reflectionPrompt?: string;
  isFavorite?: boolean;
  tags?: string[];
  paperStyle?: 'ruled' | 'grid' | 'dot' | 'blank';
  inkColor?: 'blue' | 'black' | 'sepia';
}

export type NoveltyCategory = 
  | 'sensory' 
  | 'routine_breaker' 
  | 'curiosity' 
  | 'nature' 
  | 'connection' 
  | 'stillness';

export interface MicroNovelty {
  id: string;
  category: NoveltyCategory;
  title: string;
  tagline: string;
  instruction: string;
  estimatedMinutes: number;
  difficulty: 'gentle' | 'playful' | 'deep';
  sensoryFocus: SensoryCue[];
  whyItSlowsTime: string;
  iconType: 'eye' | 'compass' | 'cup' | 'feather' | 'sparkle' | 'heart' | 'clock' | 'ear';
  isCustom?: boolean;
  createdAt?: string;
}

export interface UserPreferences {
  userName: string;
  userEmail: string;
  themeStyle: 'warm-parchment' | 'sage-linen' | 'ochre-terracotta';
  defaultPaper: 'ruled' | 'grid' | 'dot';
  defaultInk: 'blue' | 'black' | 'sepia';
  reminderTime: string;
  enableNudges: boolean;
  ambientSound: 'none' | 'rain' | 'clock' | 'hearth' | 'forest';
  ambientVolume: number;
  isLoggedIn: boolean;
  hapticFeedbackEnabled?: boolean;
}

export interface NoveltyLog {
  noveltyId: string;
  completedAt: string; // YYYY-MM-DD
  notes?: string;
}
