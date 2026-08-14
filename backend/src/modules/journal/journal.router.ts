import { Router } from 'express';
import { journalController } from './journal.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', (req, res, next) => journalController.createEntry(req, res, next));
router.get('/', (req, res, next) => journalController.getEntries(req, res, next));
router.get('/stats', (req, res, next) => journalController.getDistortionStats(req, res, next));
router.get('/:id', (req, res, next) => journalController.getEntryById(req, res, next));
router.patch('/:id', (req, res, next) => journalController.updateEntry(req, res, next));
router.delete('/:id', (req, res, next) => journalController.deleteEntry(req, res, next));

export { router as journalRouter };
