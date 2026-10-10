import express from 'express';
import { getCsrfToken, register, loginUser, logout, getMe, listLocalDemoAccounts } from '../controllers/authController.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { verifyCsrf } from '../middleware/csrf.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/csrf', getCsrfToken);
router.get('/demo-accounts', listLocalDemoAccounts);
router.post('/register', rateLimiter(60000, 10), verifyCsrf, register);
router.post('/login', rateLimiter(60000, 10), verifyCsrf, loginUser);
router.post('/logout', verifyCsrf, logout);
router.get('/me', optionalAuthenticate, getMe);

export default router;
