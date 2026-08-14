import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { moodService } from './mood.service';

const logMoodSchema = z.object({
  score: z.number().min(1).max(10),
  primaryEmotion: z.string().min(1),
  secondaryEmotions: z.array(z.string()).optional(),
  intensity: z.number().min(1).max(100).optional(),
  notes: z.string().max(2000).optional(),
  factors: z.array(z.string()).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  anxietyLevel: z.number().min(1).max(10).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  loggedAt: z.string().optional(),
});

export class MoodController {
  async logMood(req: Request, res: Response, next: NextFunction) {
    try {
      const data = logMoodSchema.parse(req.body);
      const entry = await moodService.logMood(req.user!.id, data);
      res.status(201).json({ success: true, data: { entry } });
    } catch (err) {
      next(err);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, startDate, endDate } = req.query;
      const history = await moodService.getMoodHistory(req.user!.id, {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
      const stats = await moodService.getMoodStats(req.user!.id, days);
      res.status(200).json({ success: true, data: { stats } });
    } catch (err) {
      next(err);
    }
  }

  async deleteEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await moodService.deleteMoodEntry(req.user!.id, id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const moodController = new MoodController();
