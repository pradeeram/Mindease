import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { userService } from './user.service';
import { logAudit } from '../../middleware/security';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  theme: z.string().optional(),
});

const onboardingSchema = z.object({
  baselineScore: z.number().min(0).max(100),
  primaryGoals: z.array(z.string()).optional(),
  consentsAccepted: z.boolean(),
});

export class UserController {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      res.status(200).json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateProfileSchema.parse(req.body);
      const user = await userService.updateProfile(req.user!.id, data);
      res.status(200).json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  }

  async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      const data = onboardingSchema.parse(req.body);
      const user = await userService.completeOnboarding(req.user!.id, data);

      await logAudit({
        userId: req.user!.id,
        action: 'ONBOARDING_COMPLETED',
        req,
        details: `Assessment score: ${data.baselineScore}`,
      });

      res.status(200).json({ success: true, data: { user } });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
