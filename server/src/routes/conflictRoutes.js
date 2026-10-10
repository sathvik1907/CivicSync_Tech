import express from 'express';
import { listConflicts, getProjectConflicts, recordDecision } from '../controllers/conflictController.js';
import { authenticate, requireCoordinator } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = express.Router();

router.get('/', listConflicts);
router.get('/project/:id', getProjectConflicts);
router.post('/decision', authenticate, requireCoordinator, verifyCsrf, recordDecision);

export default router;
