import { Router } from 'express';
import { chatController } from './chat.controller';
import { authenticate } from '../../middleware/auth';
import { chatLimiter } from '../../middleware/security';

const router = Router();

router.use(authenticate);

router.post('/message', chatLimiter, (req, res, next) => chatController.sendMessage(req, res, next));
router.get('/sessions', (req, res, next) => chatController.getSessions(req, res, next));
router.post('/sessions', (req, res, next) => chatController.createSession(req, res, next));
router.get('/sessions/:sessionId/messages', (req, res, next) => chatController.getSessionMessages(req, res, next));
router.delete('/sessions/:sessionId', (req, res, next) => chatController.deleteSession(req, res, next));

export { router as chatRouter };
