import { prisma } from '../../db/prisma';

export class JournalService {
  async createEntry(userId: string, data: {
    title: string;
    situation: string;
    automaticThought: string;
    distortionTags: string[];
    cognitiveReframing: string;
    moodBefore: number;
    moodAfter: number;
    outcomeNote?: string;
    isFavorite?: boolean;
    loggedAt?: string | Date;
  }) {
    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        title: data.title.trim(),
        situation: data.situation.trim(),
        automaticThought: data.automaticThought.trim(),
        distortionTags: JSON.stringify(data.distortionTags || []),
        cognitiveReframing: data.cognitiveReframing.trim(),
        moodBefore: Math.max(1, Math.min(10, data.moodBefore)),
        moodAfter: Math.max(1, Math.min(10, data.moodAfter)),
        outcomeNote: data.outcomeNote ? data.outcomeNote.trim() : null,
        isFavorite: data.isFavorite ?? false,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      }
    });

    const safeParse = (str: string | null | undefined, fallback: any = []) => {
      if (!str) return fallback;
      try { return JSON.parse(str); } catch { return fallback; }
    };

    return {
      ...entry,
      distortionTags: safeParse(entry.distortionTags, []),
    };
  }

  async getEntries(userId: string, query: { limit?: number; offset?: number; search?: string; distortion?: string; favoriteOnly?: boolean }) {
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    const where: any = { userId };
    if (query.favoriteOnly) {
      where.isFavorite = true;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { situation: { contains: query.search } },
        { automaticThought: { contains: query.search } },
        { cognitiveReframing: { contains: query.search } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.journalEntry.count({ where }),
    ]);

    let formatted = entries.map(entry => ({
      ...entry,
      distortionTags: JSON.parse(entry.distortionTags || '[]'),
    }));

    if (query.distortion) {
      formatted = formatted.filter(entry => entry.distortionTags.includes(query.distortion));
    }

    return { entries: formatted, total, limit, offset };
  }

  async getEntryById(userId: string, entryId: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId }
    });

    if (!entry) {
      const error: any = new Error('Journal entry not found.');
      error.statusCode = 404;
      throw error;
    }

    return {
      ...entry,
      distortionTags: JSON.parse(entry.distortionTags || '[]'),
    };
  }

  async updateEntry(userId: string, entryId: string, data: {
    title?: string;
    situation?: string;
    automaticThought?: string;
    distortionTags?: string[];
    cognitiveReframing?: string;
    moodBefore?: number;
    moodAfter?: number;
    outcomeNote?: string;
    isFavorite?: boolean;
  }) {
    const existing = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId }
    });

    if (!existing) {
      const error: any = new Error('Journal entry not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.journalEntry.update({
      where: { id: entryId },
      data: {
        title: data.title !== undefined ? data.title.trim() : undefined,
        situation: data.situation !== undefined ? data.situation.trim() : undefined,
        automaticThought: data.automaticThought !== undefined ? data.automaticThought.trim() : undefined,
        distortionTags: data.distortionTags ? JSON.stringify(data.distortionTags) : undefined,
        cognitiveReframing: data.cognitiveReframing !== undefined ? data.cognitiveReframing.trim() : undefined,
        moodBefore: data.moodBefore !== undefined ? Math.max(1, Math.min(10, data.moodBefore)) : undefined,
        moodAfter: data.moodAfter !== undefined ? Math.max(1, Math.min(10, data.moodAfter)) : undefined,
        outcomeNote: data.outcomeNote !== undefined ? data.outcomeNote.trim() : undefined,
        isFavorite: data.isFavorite !== undefined ? data.isFavorite : undefined,
      }
    });

    return {
      ...updated,
      distortionTags: JSON.parse(updated.distortionTags || '[]'),
    };
  }

  async deleteEntry(userId: string, entryId: string) {
    const existing = await prisma.journalEntry.findFirst({
      where: { id: entryId, userId }
    });

    if (!existing) {
      const error: any = new Error('Journal entry not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.journalEntry.delete({ where: { id: entryId } });
    return { success: true, message: 'Journal entry deleted successfully.' };
  }

  async getDistortionStats(userId: string) {
    const entries = await prisma.journalEntry.findMany({
      where: { userId },
      select: { distortionTags: true, moodBefore: true, moodAfter: true }
    });

    const distortionCounts: Record<string, number> = {};
    let totalImprovement = 0;

    entries.forEach(e => {
      const tags: string[] = JSON.parse(e.distortionTags || '[]');
      tags.forEach(t => {
        distortionCounts[t] = (distortionCounts[t] || 0) + 1;
      });

      totalImprovement += (e.moodAfter - e.moodBefore);
    });

    const avgRelief = entries.length > 0 ? Number((totalImprovement / entries.length).toFixed(1)) : 0;

    return {
      totalEntries: entries.length,
      averageMoodShift: avgRelief,
      distortionBreakdown: distortionCounts,
    };
  }
}

export const journalService = new JournalService();
