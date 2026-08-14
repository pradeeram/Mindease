import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/profile', (req, res, next) => userController.getProfile(req, res, next));
router.patch('/profile', (req, res, next) => userController.updateProfile(req, res, next));
router.post('/onboarding', (req, res, next) => userController.completeOnboarding(req, res, next));

export { router as userRouter };
