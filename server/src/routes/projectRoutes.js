import express from 'express';
import {
  listProjects,
  listMapProjects,
  getProject,
  createDraft,
  updateProject,
  publishProject,
  addUpdate
} from '../controllers/projectController.js';
import { authenticate, optionalAuthenticate, requireOfficial } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = express.Router();

// Public routes
router.get('/', listProjects);
router.get('/map', listMapProjects);
router.get('/:id', optionalAuthenticate, getProject);

// Protected official routes
router.post('/', authenticate, requireOfficial, verifyCsrf, createDraft);
router.patch('/:id', authenticate, requireOfficial, verifyCsrf, updateProject);
router.post('/:id/publish', authenticate, requireOfficial, verifyCsrf, publishProject);
router.post('/:id/updates', authenticate, requireOfficial, verifyCsrf, addUpdate);

export default router;
