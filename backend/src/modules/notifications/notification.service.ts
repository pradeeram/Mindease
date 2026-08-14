import { prisma } from '../../db/prisma';

export class NotificationService {
  async getReminders(userId: string) {
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { time: 'asc' }
    });

    return reminders.map(r => ({
      ...r,
      daysOfWeek: JSON.parse(r.daysOfWeek || '["MON","TUE","WED","THU","FRI","SAT","SUN"]'),
    }));
  }

  async createReminder(userId: string, data: {
    type: string;
    title: string;
    time: string;
    daysOfWeek?: string[];
    isEnabled?: boolean;
  }) {
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        type: data.type,
        title: data.title.trim(),
        time: data.time,
        daysOfWeek: JSON.stringify(data.daysOfWeek || ['MON','TUE','WED','THU','FRI','SAT','SUN']),
        isEnabled: data.isEnabled ?? true,
      }
    });

    return {
      ...reminder,
      daysOfWeek: JSON.parse(reminder.daysOfWeek),
    };
  }

  async toggleReminder(userId: string, reminderId: string, isEnabled: boolean) {
    const existing = await prisma.reminder.findFirst({
      where: { id: reminderId, userId }
    });

    if (!existing) {
      const error: any = new Error('Reminder not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await prisma.reminder.update({
      where: { id: reminderId },
      data: { isEnabled }
    });

    return {
      ...updated,
      daysOfWeek: JSON.parse(updated.daysOfWeek),
    };
  }

  async deleteReminder(userId: string, reminderId: string) {
    const existing = await prisma.reminder.findFirst({
      where: { id: reminderId, userId }
    });

    if (!existing) {
      const error: any = new Error('Reminder not found.');
      error.statusCode = 404;
      throw error;
    }

    await prisma.reminder.delete({ where: { id: reminderId } });
    return { success: true, message: 'Reminder deleted.' };
  }
}

export const notificationService = new NotificationService();
