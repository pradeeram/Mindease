import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { journalService } from './journal.service';

const createJournalSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  situation: z.string().min(1, 'Please describe what triggered this thought.'),
  automaticThought: z.string().min(1, 'Please enter your automatic thought.'),
  distortionTags: z.array(z.string()).default([]),
  cognitiveReframing: z.string().min(1, 'Please provide an alternative balanced perspective.'),
  moodBefore: z.number().min(1).max(10),
  moodAfter: z.number().min(1).max(10),
  outcomeNote: z.string().optional(),
  isFavorite: z.boolean().optional(),
  loggedAt: z.string().optional(),
});

const updateJournalSchema = createJournalSchema.partial();

export class JournalController {
  async createEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createJournalSchema.parse(req.body);
      const entry = await journalService.createEntry(req.user!.id, data);
      res.status(201).json({ success: true, data: { entry } });
    } catch (err) {
      next(err);
    }
  }

  async getEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, search, distortion, favoriteOnly } = req.query;
      const result = await journalService.getEntries(req.user!.id, {
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
        search: search as string,
        distortion: distortion as string,
        favoriteOnly: favoriteOnly === 'true',
      });

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getEntryById(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await journalService.getEntryById(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: { entry } });
    } catch (err) {
      next(err);
    }
  }

  async updateEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateJournalSchema.parse(req.body);
      const entry = await journalService.updateEntry(req.user!.id, req.params.id, data);
      res.status(200).json({ success: true, data: { entry } });
    } catch (err) {
      next(err);
    }
  }

  async deleteEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await journalService.deleteEntry(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getDistortionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await journalService.getDistortionStats(req.user!.id);
      res.status(200).json({ success: true, data: { stats } });
    } catch (err) {
      next(err);
    }
  }
}

export const journalController = new JournalController();
