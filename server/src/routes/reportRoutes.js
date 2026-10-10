import express from 'express';
import {
  submitReport,
  getMyReports,
  getAdminReports,
  getReportDetails,
  handleReportAction
} from '../controllers/reportController.js';
import { authenticate, requireOfficial } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = express.Router();

// Fixed subpaths declared before parameterized :id
router.post('/', authenticate, verifyCsrf, submitReport);
router.get('/mine', authenticate, getMyReports);
router.get('/admin', authenticate, requireOfficial, getAdminReports);

// Parameterized routes
router.get('/:id', authenticate, getReportDetails);
router.post('/:id/actions', authenticate, requireOfficial, verifyCsrf, handleReportAction);

export default router;
