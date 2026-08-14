import { Router } from 'express';
import { privacyController } from './privacy.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/export', (req, res, next) => privacyController.exportData(req, res, next));
router.get('/audit-logs', (req, res, next) => privacyController.getAuditLogs(req, res, next));
router.get('/consents', (req, res, next) => privacyController.getConsents(req, res, next));
router.post('/delete-account', (req, res, next) => privacyController.deleteAccount(req, res, next));
router.post('/withdraw-consent', (req, res, next) => privacyController.withdrawConsent(req, res, next));

export { router as privacyRouter };
