import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { resourcesService } from './resources.service';

const safetyPlanSchema = z.object({
  warningSigns: z.array(z.string()).optional(),
  copingStrategies: z.array(z.string()).optional(),
  distractionPlaces: z.array(z.string()).optional(),
  supportiveContacts: z.array(z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  })).optional(),
  professionalResources: z.array(z.object({
    agency: z.string(),
    phone: z.string(),
    contact: z.string(),
  })).optional(),
  safeEnvironmentSteps: z.array(z.string()).optional(),
});

export class ResourcesController {
  getHotlines(req: Request, res: Response) {
    const hotlines = resourcesService.getCrisisHotlines();
    res.status(200).json({ success: true, data: { hotlines } });
  }

  getGrounding(req: Request, res: Response) {
    const techniques = resourcesService.getGroundingTechniques();
    res.status(200).json({ success: true, data: { techniques } });
  }

  async getSafetyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await resourcesService.getSafetyPlan(req.user!.id);
      res.status(200).json({ success: true, data: { plan } });
    } catch (err) {
      next(err);
    }
  }

  async updateSafetyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const data = safetyPlanSchema.parse(req.body);
      const plan = await resourcesService.upsertSafetyPlan(req.user!.id, data);
      res.status(200).json({ success: true, data: { plan } });
    } catch (err) {
      next(err);
    }
  }
}

export const resourcesController = new ResourcesController();
