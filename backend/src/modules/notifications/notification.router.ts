import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => notificationController.getReminders(req, res, next));
router.post('/', (req, res, next) => notificationController.createReminder(req, res, next));
router.patch('/:id/toggle', (req, res, next) => notificationController.toggleReminder(req, res, next));
router.delete('/:id', (req, res, next) => notificationController.deleteReminder(req, res, next));

export { router as notificationRouter };
