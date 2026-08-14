import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { notificationService } from './notification.service';

const createReminderSchema = z.object({
  type: z.enum(['MOOD_CHECKIN', 'BREATHING_BREAK', 'JOURNALING', 'MEDICATION']),
  title: z.string().min(1).max(100),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:mm format.'),
  daysOfWeek: z.array(z.string()).optional(),
  isEnabled: z.boolean().optional(),
});

export class NotificationController {
  async getReminders(req: Request, res: Response, next: NextFunction) {
    try {
      const reminders = await notificationService.getReminders(req.user!.id);
      res.status(200).json({ success: true, data: { reminders } });
    } catch (err) {
      next(err);
    }
  }

  async createReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createReminderSchema.parse(req.body);
      const reminder = await notificationService.createReminder(req.user!.id, data);
      res.status(201).json({ success: true, data: { reminder } });
    } catch (err) {
      next(err);
    }
  }

  async toggleReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const { isEnabled } = req.body;
      const reminder = await notificationService.toggleReminder(req.user!.id, req.params.id, Boolean(isEnabled));
      res.status(200).json({ success: true, data: { reminder } });
    } catch (err) {
      next(err);
    }
  }

  async deleteReminder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.deleteReminder(req.user!.id, req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
