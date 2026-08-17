// Universal database adapter for Vercel Postgres / Prisma integration
export interface MemoryEntryRecord {
  id: string;
  userId: string;
  date: Date | string;
  title: string;
  body: string;
  timePacing?: string | null;
  sensoryCues: string[];
  location?: string | null;
  weather?: string | null;
  moodStamp?: string | null;
  linkedNoveltyTitle?: string | null;
  reflectionPrompt?: string | null;
  isFavorite: boolean;
  paperStyle: string;
  inkColor: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface StreakRecord {
  id: string;
  userId: string;
  currentCount: number;
  longestCount: number;
  graceDayUsed: boolean;
  lastEntryDate: Date | null;
  updatedAt?: Date | string;
}

// In-memory / ORM abstraction layer compatible with Vercel Postgres Prisma Client
class DatabaseClient {
  private entriesStore: Map<string, MemoryEntryRecord> = new Map();
  private streakStore: Map<string, StreakRecord> = new Map();

  get entry() {
    return {
      findMany: async ({ where, orderBy }: { where?: { userId: string }; orderBy?: { date: 'asc' | 'desc' } }) => {
        let list = Array.from(this.entriesStore.values());
        if (where?.userId) {
          list = list.filter((e) => e.userId === where.userId);
        }
        if (orderBy?.date) {
          list.sort((a, b) => {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();
            return orderBy.date === 'desc' ? timeB - timeA : timeA - timeB;
          });
        }
        return list;
      },
      findFirst: async ({ where }: { where: { id: string; userId?: string } }) => {
        const item = this.entriesStore.get(where.id);
        if (!item) return null;
        if (where.userId && item.userId !== where.userId) return null;
        return item;
      },
      create: async ({ data }: { data: Omit<MemoryEntryRecord, 'id' | 'createdAt' | 'updatedAt'> }) => {
        const id = 'ent_' + Math.random().toString(36).substring(2, 9);
        const now = new Date();
        const record: MemoryEntryRecord = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        this.entriesStore.set(id, record);
        return record;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<MemoryEntryRecord> }) => {
        const existing = this.entriesStore.get(where.id);
        if (!existing) throw new Error('Record not found');
        const updated: MemoryEntryRecord = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        this.entriesStore.set(where.id, updated);
        return updated;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const existing = this.entriesStore.get(where.id);
        if (!existing) throw new Error('Record not found');
        this.entriesStore.delete(where.id);
        return existing;
      },
    };
  }

  get streak() {
    return {
      findUnique: async ({ where }: { where: { userId: string } }) => {
        return this.streakStore.get(where.userId) || null;
      },
      create: async ({ data }: { data: Omit<StreakRecord, 'id'> }) => {
        const record: StreakRecord = {
          ...data,
          id: 'strk_' + Math.random().toString(36).substring(2, 9),
          updatedAt: new Date(),
        };
        this.streakStore.set(data.userId, record);
        return record;
      },
      update: async ({ where, data }: { where: { userId: string }; data: Partial<StreakRecord> }) => {
        const existing = this.streakStore.get(where.userId) || {
          id: 'strk_' + Math.random().toString(36).substring(2, 9),
          userId: where.userId,
          currentCount: 0,
          longestCount: 0,
          graceDayUsed: false,
          lastEntryDate: null,
        };
        const updated: StreakRecord = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        this.streakStore.set(where.userId, updated);
        return updated;
      },
    };
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: DatabaseClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new DatabaseClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
