import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { chatService } from './chat.service';

const sendMessageSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty.').max(4000),
});

const createSessionSchema = z.object({
  title: z.string().max(100).optional(),
});

export class ChatController {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const data = sendMessageSchema.parse(req.body);
      const result = await chatService.sendMessage(req.user!.id, data);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await chatService.getUserSessions(req.user!.id);
      res.status(200).json({ success: true, data: { sessions } });
    } catch (err) {
      next(err);
    }
  }

  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSessionSchema.parse(req.body);
      const session = await chatService.createNewSession(req.user!.id, data.title);
      res.status(201).json({ success: true, data: { session } });
    } catch (err) {
      next(err);
    }
  }

  async getSessionMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const messages = await chatService.getSessionMessages(req.user!.id, req.params.sessionId);
      res.status(200).json({ success: true, data: { messages } });
    } catch (err) {
      next(err);
    }
  }

  async deleteSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await chatService.deleteSession(req.user!.id, req.params.sessionId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const chatController = new ChatController();
