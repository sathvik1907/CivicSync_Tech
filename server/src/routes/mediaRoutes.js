import express from 'express';
import { handleUpload, uploadMiddleware } from '../controllers/mediaController.js';
import { authenticate } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';

const router = express.Router();

router.post('/upload', authenticate, verifyCsrf, uploadMiddleware.single('file'), handleUpload);

export default router;
