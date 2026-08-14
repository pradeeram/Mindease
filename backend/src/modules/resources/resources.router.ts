import { Router } from 'express';
import { resourcesController } from './resources.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Publicly accessible crisis resources (Must ALWAYS be available without login)
router.get('/hotlines', (req, res) => resourcesController.getHotlines(req, res));
router.get('/grounding', (req, res) => resourcesController.getGrounding(req, res));

// Authenticated Safety Plan
router.get('/safety-plan', authenticate, (req, res, next) => resourcesController.getSafetyPlan(req, res, next));
router.put('/safety-plan', authenticate, (req, res, next) => resourcesController.updateSafetyPlan(req, res, next));

export { router as resourcesRouter };
