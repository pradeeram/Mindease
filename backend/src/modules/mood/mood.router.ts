import { Router } from 'express';
import { moodController } from './mood.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => moodController.logMood(req, res, next));
router.get('/history', (req, res, next) => moodController.getHistory(req, res, next));
router.get('/stats', (req, res, next) => moodController.getStats(req, res, next));
router.delete('/:id', (req, res, next) => moodController.deleteEntry(req, res, next));

export { router as moodRouter };
