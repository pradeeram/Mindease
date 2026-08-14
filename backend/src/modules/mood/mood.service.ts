import { prisma } from '../../db/prisma';
import { encryptData, decryptData } from '../../utils/crypto';

export class MoodService {
  async logMood(userId: string, data: {
    score: number;
    primaryEmotion: string;
    secondaryEmotions?: string[];
    intensity?: number;
    notes?: string;
    factors?: string[];
    sleepHours?: number;
    anxietyLevel?: number;
    energyLevel?: number;
    loggedAt?: string | Date;
  }) {
    const entry = await prisma.moodEntry.create({
      data: {
        userId,
        score: Math.max(1, Math.min(10, data.score)),
        primaryEmotion: data.primaryEmotion,
        secondaryEmotions: JSON.stringify(data.secondaryEmotions || []),
        intensity: data.intensity ?? 50,
        notesEncrypted: data.notes ? encryptData(data.notes) : null,
        factors: JSON.stringify(data.factors || []),
        sleepHours: data.sleepHours,
        anxietyLevel: data.anxietyLevel,
        energyLevel: data.energyLevel,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
      }
    });

    const safeParse = (str: string | null | undefined, fallback: any = []) => {
      if (!str) return fallback;
      try { return JSON.parse(str); } catch { return fallback; }
    };

    return {
      ...entry,
      secondaryEmotions: safeParse(entry.secondaryEmotions, []),
      factors: safeParse(entry.factors, []),
      notes: entry.notesEncrypted ? decryptData(entry.notesEncrypted) : '',
    };
  }

  async getMoodHistory(userId: string, query: { limit?: number; offset?: number; startDate?: string; endDate?: string }) {
    const limit = query.limit || 30;
    const offset = query.offset || 0;

    const where: any = { userId };
    if (query.startDate || query.endDate) {
      where.loggedAt = {};
      if (query.startDate) where.loggedAt.gte = new Date(query.startDate);
      if (query.endDate) where.loggedAt.lte = new Date(query.endDate);
    }

    const [entries, total] = await Promise.all([
      prisma.moodEntry.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.moodEntry.count({ where }),
    ]);

    const formatted = entries.map(entry => ({
      ...entry,
      secondaryEmotions: JSON.parse(entry.secondaryEmotions || '[]'),
      factors: JSON.parse(entry.factors || '[]'),
      notes: entry.notesEncrypted ? decryptData(entry.notesEncrypted) : '',
    }));

    return { entries: formatted, total, limit, offset };
  }

  async getMoodStats(userId: string, days: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const entries = await prisma.moodEntry.findMany({
      where: {
        userId,
        loggedAt: { gte: cutoffDate }
      },
      orderBy: { loggedAt: 'asc' }
    });

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        streakDays: 0,
        emotionBreakdown: {},
        topFactors: [],
        timeline: [],
      };
    }

    const totalMood = entries.reduce((acc, curr) => acc + curr.score, 0);
    const averageMood = Number((totalMood / entries.length).toFixed(1));

    // Calculate emotion breakdown
    const emotionCount: Record<string, number> = {};
    const factorCount: Record<string, { total: number; avgMood: number; moodSum: number }> = {};

    entries.forEach(e => {
      emotionCount[e.primaryEmotion] = (emotionCount[e.primaryEmotion] || 0) + 1;
      
      const factors: string[] = JSON.parse(e.factors || '[]');
      factors.forEach(f => {
        if (!factorCount[f]) factorCount[f] = { total: 0, avgMood: 0, moodSum: 0 };
        factorCount[f].total += 1;
        factorCount[f].moodSum += e.score;
        factorCount[f].avgMood = Number((factorCount[f].moodSum / factorCount[f].total).toFixed(1));
      });
    });

    const topFactors = Object.entries(factorCount)
      .map(([name, data]) => ({ factor: name, count: data.total, averageMood: data.avgMood }))
      .sort((a, b) => b.count - a.count);

    // Calculate active streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loggedDates = new Set(
      entries.map(e => {
        const d = new Date(e.loggedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );

    let checkDate = new Date(today);
    // If today hasn't been logged yet, check starting yesterday for streak continuity
    if (!loggedDates.has(checkDate.getTime())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (loggedDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    const timeline = entries.map(e => ({
      id: e.id,
      date: e.loggedAt,
      score: e.score,
      emotion: e.primaryEmotion,
      intensity: e.intensity,
      sleepHours: e.sleepHours,
      anxietyLevel: e.anxietyLevel,
    }));

    return {
      totalEntries: entries.length,
      averageMood,
      streakDays: streak,
      emotionBreakdown: emotionCount,
      topFactors,
      timeline,
    };
  }

  async deleteMoodEntry(userId: string, entryId: string) {
    const entry = await prisma.moodEntry.findFirst({
      where: { id: entryId, userId }
    });

    if (!entry) {
      const error: any = new Error('Mood entry not found or unauthorized.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.moodEntry.delete({ where: { id: entryId } });
    return { success: true, message: 'Mood entry deleted.' };
  }
}

export const moodService = new MoodService();
